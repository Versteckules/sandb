// audio.js
// MIDI-Player Engine: Web Audio API + eigener MIDI-Parser (Format 0 + 1)
// Exports: window.AudioEngine = { playSong, stopCurrentSong, setVolume, initAudio }
// MIDI-Dateien werden NUR gelesen, niemals verändert.

'use strict';

// ---------------------------------------------------------------------------
// 1. State-Variablen
// ---------------------------------------------------------------------------
let audioCtx          = null;
let masterGainNode    = null;
let isPlaying         = false;
let schedulerTimer    = null;
let activeOscillators = [];
let noiseBuffer       = null;
let midiCache         = {};   // Pfad → geparste MIDI-Daten (Cache)

// Playback-Tracking (intern)
let noteIndex    = 0;
let parsedNotes  = [];
let songDuration = 0;
let startTimeSec = 0;

// ---------------------------------------------------------------------------
// 2. AudioContext Initialisierung (lazy)
// ---------------------------------------------------------------------------
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = 0.5;
    masterGainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Globales Freischalten bei jeder Interaktion
if (typeof window !== 'undefined') {
  const unlockCtx = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockCtx, { passive: true });
  });
}

// ---------------------------------------------------------------------------
// 3. Noise-Buffer für Schlagzeug
// ---------------------------------------------------------------------------
function getNoiseBuffer() {
  if (!noiseBuffer && audioCtx) {
    const sr = audioCtx.sampleRate;
    noiseBuffer = audioCtx.createBuffer(1, Math.floor(sr * 0.3), sr);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// ---------------------------------------------------------------------------
// 4. MIDI-Parser (binary) – Format 0 + 1, Running Status, Meta 0x51
// ---------------------------------------------------------------------------
function parseMidiBuffer(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let pos = 0;

  function readUint32() {
    const v = (data[pos] << 24) | (data[pos+1] << 16) | (data[pos+2] << 8) | data[pos+3];
    pos += 4;
    return v >>> 0;
  }
  function readUint16() {
    const v = (data[pos] << 8) | data[pos+1];
    pos += 2;
    return v;
  }
  function readVarLen() {
    let val = 0, b;
    do { b = data[pos++]; val = (val << 7) | (b & 0x7f); } while (b & 0x80);
    return val;
  }
  function tag(offset) {
    return String.fromCharCode(data[offset], data[offset+1], data[offset+2], data[offset+3]);
  }

  // Header
  if (tag(0) !== 'MThd') throw new Error('Kein gültiger MIDI-Header');
  pos = 4;
  const headerLen  = readUint32();   // immer 6
  pos += headerLen - 6;
  /* const format  = */ readUint16();
  const numTracks  = readUint16();
  const division   = readUint16();   // Ticks per Quarter-Note
  const ticksPerBeat = (division & 0x8000) ? 480 : division;

  // Tempo-Timeline: [{ tick, tempo (µs/beat) }]
  const tempoMap = [{ tick: 0, tempo: 500000 }]; // default 120 BPM

  // Roh-Events aus allen Tracks
  const rawNoteEvents = [];

  for (let t = 0; t < numTracks; t++) {
    if (pos + 8 > data.length) break;
    if (tag(pos) !== 'MTrk') { pos++; t--; continue; }
    pos += 4;
    const trackLen = readUint32();
    const trackEnd = pos + trackLen;

    let tick = 0, runningStatus = 0;

    while (pos < trackEnd && pos < data.length) {
      const delta = readVarLen();
      tick += delta;

      let statusByte = data[pos];

      if (statusByte < 0x80) {
        // Running Status – Byte gehört zu Daten, pos nicht erhöhen
        statusByte = runningStatus;
      } else {
        pos++;
        if (statusByte === 0xF0 || statusByte === 0xF7 || statusByte === 0xFF) {
          runningStatus = 0;
        } else {
          runningStatus = statusByte;
        }
      }

      const evType  = (statusByte & 0xF0) >> 4;
      const channel = statusByte & 0x0F;

      if (statusByte === 0xFF) {
        // Meta-Event
        const metaType = data[pos++];
        const metaLen  = readVarLen();
        if (metaType === 0x51 && metaLen === 3) {
          const us = (data[pos] << 16) | (data[pos+1] << 8) | data[pos+2];
          tempoMap.push({ tick, tempo: us });
        }
        pos += metaLen;
      } else if (statusByte === 0xF0 || statusByte === 0xF7) {
        pos += readVarLen();
      } else {
        switch (evType) {
          case 0x8: { const key = data[pos++]; const vel = data[pos++]; rawNoteEvents.push({ tick, type: 'noteOff', channel, key, vel }); break; }
          case 0x9: { const key = data[pos++]; const vel = data[pos++]; rawNoteEvents.push({ tick, type: vel === 0 ? 'noteOff' : 'noteOn', channel, key, vel }); break; }
          case 0xA: pos += 2; break;
          case 0xB: pos += 2; break;
          case 0xC: pos += 1; break;
          case 0xD: pos += 1; break;
          case 0xE: pos += 2; break;
          default:  pos = trackEnd; break;
        }
      }
    }
    pos = trackEnd;
  }

  // Tempo-Map sortieren
  tempoMap.sort((a, b) => a.tick - b.tick);

  // Ticks → Sekunden
  function tickToSec(tick) {
    let sec = 0, prevTick = 0, prevTempo = tempoMap[0].tempo;
    for (let i = 1; i < tempoMap.length; i++) {
      const e = tempoMap[i];
      if (e.tick >= tick) break;
      sec      += (e.tick - prevTick) * prevTempo / (ticksPerBeat * 1e6);
      prevTick  = e.tick;
      prevTempo = e.tempo;
    }
    sec += (tick - prevTick) * prevTempo / (ticksPerBeat * 1e6);
    return sec;
  }

  // Note On/Off zu Noten zusammenführen
  rawNoteEvents.sort((a, b) => a.tick - b.tick || (a.type === 'noteOff' ? -1 : 1));
  const openNotes = {}; // `ch-key` → [{ tick, vel }]
  const notes = [];

  for (const ev of rawNoteEvents) {
    const k = `${ev.channel}-${ev.key}`;
    if (ev.type === 'noteOn') {
      if (!openNotes[k]) openNotes[k] = [];
      openNotes[k].push({ tick: ev.tick, vel: ev.vel });
    } else {
      if (openNotes[k] && openNotes[k].length > 0) {
        const on = openNotes[k].shift();
        const dur = Math.max(0.01, tickToSec(ev.tick) - tickToSec(on.tick));
        notes.push({ channel: ev.channel, key: ev.key, start: tickToSec(on.tick), dur, vel: on.vel });
      }
    }
  }
  // Noch offene Notes
  for (const k of Object.keys(openNotes)) {
    const [ch, key] = k.split('-').map(Number);
    for (const on of openNotes[k]) {
      notes.push({ channel: ch, key, start: tickToSec(on.tick), dur: 0.25, vel: on.vel });
    }
  }

  notes.sort((a, b) => a.start - b.start);
  if (notes.length > 0 && notes[0].start > 0.2) {
    const offset = notes[0].start - 0.1;
    for (const note of notes) {
      note.start -= offset;
    }
  }
  const duration = notes.length > 0 ? notes[notes.length - 1].start + notes[notes.length - 1].dur : 0;
  return { duration, notes };
}

// ---------------------------------------------------------------------------
// 5. Note abspielen
// ---------------------------------------------------------------------------
function scheduleNote(n, time) {
  if (!audioCtx || time < audioCtx.currentTime) return;
  const velocity = (n.vel / 127) * 0.8 + 0.05;

  const cleanupNode = (node) => {
    node.onended = () => {
      const idx = activeOscillators.indexOf(node);
      if (idx !== -1) activeOscillators.splice(idx, 1);
    };
  };

  if (n.channel === 9) {
    // --- Schlagzeug ---
    if (n.key === 35 || n.key === 36) {
      // Kick: Sinus 150 → 30 Hz
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(masterGainNode);
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
      gain.gain.setValueAtTime(velocity, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      osc.start(time);
      osc.stop(time + 0.2);
      activeOscillators.push(osc);
      cleanupNode(osc);
    } else {
      // Snare / Hi-Hat: Noise-Buffer
      const buf = getNoiseBuffer();
      if (!buf) return;
      const src  = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = buf;
      src.connect(gain);
      gain.connect(masterGainNode);
      const decayTime = n.key >= 42 ? 0.05 : 0.12;
      gain.gain.setValueAtTime(velocity * 0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
      src.start(time);
      src.stop(time + decayTime + 0.01);
      activeOscillators.push(src);
      cleanupNode(src);
    }
  } else {
    // --- Melodie ---
    const freq = 440 * Math.pow(2, (n.key - 69) / 12);
    const waveforms = ['sawtooth', 'square', 'triangle', 'sine', 'sawtooth', 'square'];
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = waveforms[n.channel % 6];
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(masterGainNode);

    const attack  = 0.01;
    const release = Math.min(0.18, n.dur * 0.4);
    const sustain = Math.max(0, n.dur - release);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity, time + attack);
    if (sustain > 0) gain.gain.setValueAtTime(velocity, time + attack + sustain);
    gain.gain.linearRampToValueAtTime(0.0001, time + n.dur);

    osc.start(time);
    osc.stop(time + n.dur + 0.05);
    activeOscillators.push(osc);
    cleanupNode(osc);
  }
}

// ---------------------------------------------------------------------------
// 6. Song laden und abspielen
// ---------------------------------------------------------------------------
async function playSong(midiFilePath, onEnd) {
  stopCurrentSong();
  initAudio();

  if (audioCtx && audioCtx.state === 'suspended') {
    try { await audioCtx.resume(); } catch (e) {}
  }

  try {
    if (!midiCache[midiFilePath]) {
      const response = await fetch(midiFilePath);
      if (!response.ok) throw new Error(`MIDI fetch fehlgeschlagen: ${response.status} – ${midiFilePath}`);
      const arrayBuffer = await response.arrayBuffer();
      midiCache[midiFilePath] = parseMidiBuffer(arrayBuffer);
    }

    const parsed = midiCache[midiFilePath];
    if (!parsed || !parsed.notes || parsed.notes.length === 0) {
      console.warn('[AudioEngine] Keine Noten in MIDI-Datei:', midiFilePath);
      return false;
    }

    parsedNotes  = parsed.notes;
    songDuration = parsed.duration;
    noteIndex    = 0;
    isPlaying    = true;
    startTimeSec = audioCtx.currentTime + 0.1;

    // Scheduler: 40ms-Intervall, 1s Lookahead
    schedulerTimer = setInterval(() => {
      if (!isPlaying) return;
      const elapsed       = audioCtx.currentTime - startTimeSec;
      const scheduleUntil = elapsed + 1.0;

      while (noteIndex < parsedNotes.length && parsedNotes[noteIndex].start <= scheduleUntil) {
        const note     = parsedNotes[noteIndex];
        const noteTime = startTimeSec + note.start;
        if (noteTime >= audioCtx.currentTime - 0.01) scheduleNote(note, noteTime);
        noteIndex++;
      }

      if (elapsed >= songDuration + 0.5) {
        stopCurrentSong();
        if (typeof onEnd === 'function') onEnd();
      }
    }, 40);

    return true;

  } catch (err) {
    console.error('[AudioEngine] playSong Fehler:', err);
    isPlaying = false;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// 7. Song stoppen
// ---------------------------------------------------------------------------
function stopCurrentSong() {
  isPlaying = false;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
  activeOscillators.forEach(o => { try { o.stop(); } catch (e) {} });
  activeOscillators = [];
  noteIndex    = 0;
  parsedNotes  = [];
  songDuration = 0;
}

// ---------------------------------------------------------------------------
// 8. Lautstärke (0 – 1)
// ---------------------------------------------------------------------------
function setVolume(value) {
  if (masterGainNode) masterGainNode.gain.value = value * 0.7;
}

// ---------------------------------------------------------------------------
// 9. Export
// ---------------------------------------------------------------------------
window.AudioEngine = { playSong, stopCurrentSong, setVolume, initAudio };
