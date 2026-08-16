// ui.js
// DOM-Manipulation, Modal-Logik, LED-Animation, Fortschrittsanzeige,
// Koordinaten-Overlay (SOLVE_THRESHOLD = 21), Toast-Feedback
// Abhängigkeiten (Ladereihenfolge): songs.js → i18n.js → audio.js → solver.js → state.js → ui.js

'use strict';

// ---------------------------------------------------------------------------
// 1. Konstanten
// ---------------------------------------------------------------------------

// ANZAHL DER SONGS ZUM LÖSEN (21 von 25 nötig)
const SOLVE_THRESHOLD = 21;

// VERSCHLÜSSELTE KOORDINATEN (Base64 + ROT13 + Salt "JUKEBOX21")
// Dekodierung: rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")
const COORDS_ENCODED = 'QSA1MMKwIDIzLjM1NiBSIDAxMcKwIDU1LjQyN1dIWFJPQksyMQ==';
// Dekodierung in showCoords():
// rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")

// ---------------------------------------------------------------------------
// 2. Interner Modul-State
// ---------------------------------------------------------------------------

/** Das aktuell im Modal angezeigte Song-Objekt */
let currentSong = null;

// ---------------------------------------------------------------------------
// 3. Grid-Label-Bezeichner (5×5 → A1–E5)
// ---------------------------------------------------------------------------

/**
 * Gibt die Song-Nummer als Label zurück: 1→"A1", 2→"A2", … 25→"E5"
 * @param {number} id - 1-basierter Song-Index (1–25)
 * @returns {string}
 */
function getSongLabel(id) {
  const row = String.fromCharCode(65 + Math.floor((id - 1) / 5)); // A–E
  const col = ((id - 1) % 5) + 1;                                 // 1–5
  return row + col;
}

// ---------------------------------------------------------------------------
// 4. Song-Grid rendern
// ---------------------------------------------------------------------------

/**
 * Iteriert über window.SONGS (25 Einträge) und befüllt #song-grid dynamisch.
 * Dekodierter Text ist IMMER im DOM, aber via CSS-Klasse .blurred versteckt
 * solange der Song nicht gelöst ist.
 */
function renderSongGrid() {
  const grid = document.getElementById('song-grid');
  if (!grid) {
    console.error('[ui] #song-grid nicht gefunden.');
    return;
  }

  grid.innerHTML = ''; // Sicherheitshalber leeren

  window.SONGS.forEach(function (song) {
    const label  = getSongLabel(song.id);
    const solved = State.isSolved(song.id);

    // Klartext dekodieren
    const titlePlain  = window.dec ? window.dec(song.display.title) : rot13(decodeURIComponent(escape(atob(song.display.title))));
    const artistPlain = window.dec ? window.dec(song.display.artist) : rot13(decodeURIComponent(escape(atob(song.display.artist))));

    // --- Wrapper ---
    const entry = document.createElement('div');
    entry.className  = 'song-entry' + (solved ? ' solved' : '');
    entry.setAttribute('role', 'listitem');
    entry.dataset.songId = song.id;

    // --- Button ---
    const btn = document.createElement('button');
    btn.className = 'song-button' + (solved ? ' solved' : '');
    btn.id        = 'btn-' + song.id;
    btn.dataset.songId   = song.id;
    btn.textContent      = label;
    btn.setAttribute('aria-label', 'Song ' + label + ' abspielen');
    btn.addEventListener('click', function () { openModal(song); });

    // --- Schild / Label ---
    const labelDiv = document.createElement('div');
    labelDiv.className = 'song-label';
    labelDiv.id        = 'label-' + song.id;
    labelDiv.style.cursor = 'pointer';
    labelDiv.addEventListener('click', function () { openModal(song); });

    const spanTitle = document.createElement('span');
    spanTitle.className = 'song-label-title' + (solved ? '' : ' blurred');
    spanTitle.textContent = titlePlain;

    const spanArtist = document.createElement('span');
    spanArtist.className = 'song-label-artist' + (solved ? '' : ' blurred');
    spanArtist.textContent = artistPlain;

    labelDiv.appendChild(spanTitle);
    labelDiv.appendChild(spanArtist);

    // --- Zusammenbauen ---
    entry.appendChild(btn);
    entry.appendChild(labelDiv);
    grid.appendChild(entry);
  });
}

// ---------------------------------------------------------------------------
// 5. Modal öffnen
// ---------------------------------------------------------------------------

/**
 * Öffnet das Modal für den übergebenen Song, startet die MIDI-Wiedergabe
 * und aktualisiert die Vorschau je nach Löse-Status.
 *
 * @param {Object} song - Song-Objekt aus window.SONGS
 */
function openModal(song) {
  currentSong = song;

  const solved       = State.isSolved(song.id);
  const titlePlain   = window.dec ? window.dec(song.display.title) : rot13(decodeURIComponent(escape(atob(song.display.title))));
  const artistPlain  = window.dec ? window.dec(song.display.artist) : rot13(decodeURIComponent(escape(atob(song.display.artist))));
  const labelText    = getSongLabel(song.id);

  // Modal-Titel
  const songNumberEl = document.getElementById('modal-song-number');
  if (songNumberEl) songNumberEl.textContent = labelText;

  // Vorschau-Schild
  const previewTitle  = document.getElementById('modal-preview-title');
  const previewArtist = document.getElementById('modal-preview-artist');
  if (previewTitle) {
    previewTitle.textContent = titlePlain;
    previewTitle.className   = solved ? '' : 'blurred';
  }
  if (previewArtist) {
    previewArtist.textContent = artistPlain;
    previewArtist.className   = solved ? '' : 'blurred';
  }

  // Eingabefeld leeren
  const input = document.getElementById('modal-input');
  if (input) {
    input.value = '';
    input.classList.remove('shake');
  }

  // Modal einblenden
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.removeAttribute('hidden');
    overlay.classList.add('visible');
  }

  // Fokus auf Eingabefeld setzen
  if (input) {
    setTimeout(function () { input.focus(); }, 50);
  }

  // MIDI-Wiedergabe starten
  if (window.AudioEngine) {
    AudioEngine.playSong(song.midiFile, function onMidiEnd() {
      // LED-Leiste wieder deaktivieren wenn Song fertig
      stopLEDAnimation();
    }).then(function (started) {
      if (started !== false) {
        startLEDAnimation();
      }
    }).catch(function (err) {
      console.error('[ui] Wiedergabefehler:', err);
      stopLEDAnimation();

      if (window.location.protocol === 'file:') {
        showToast('toast_file_error');
      } else {
        showToast('toast_audio_error');
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 5b. LED-Equalizer-Animation (VU-Meter & Puls)
// ---------------------------------------------------------------------------

let ledTimer = null;
let currentLevelLeft = 0;
let currentLevelRight = 0;
let bottomStep = 0;

/**
 * Startet den dynamischen LED-Equalizer (VU-Meter an den Seiten, Puls unten).
 */
function startLEDAnimation() {
  stopLEDAnimation(); // Evtl. laufende Animation stornieren

  const ledBar = document.getElementById('led-bar');
  if (ledBar) ledBar.classList.add('playing');

  const leftLeds = document.querySelectorAll('.led-strip-left .led');
  const rightLeds = document.querySelectorAll('.led-strip-right .led');
  const bottomLeds = document.querySelectorAll('.led-strip-bottom .led');

  if (!leftLeds.length && !rightLeds.length) return;

  // Intervall für dynamischen Rhythmus-Effekt (alle 70 ms)
  ledTimer = setInterval(function () {
    // 1. Target-Level-Erzeugung mit geglättetem Peak-Falloff (VU-Meter Physik)
    const targetLeft = Math.floor(Math.random() * 10) + 1;
    const targetRight = Math.floor(Math.random() * 10) + 1;

    if (targetLeft > currentLevelLeft) {
      currentLevelLeft = targetLeft;
    } else {
      currentLevelLeft = Math.max(1, currentLevelLeft - 1);
    }

    if (targetRight > currentLevelRight) {
      currentLevelRight = targetRight;
    } else {
      currentLevelRight = Math.max(1, currentLevelRight - 1);
    }

    // 2. Linken Equalizer aktualisieren (Index 0 = led-l-1 unten, Index 9 = led-l-10 oben)
    leftLeds.forEach(function (led, index) {
      const levelNum = index + 1;
      if (levelNum <= currentLevelLeft) {
        led.classList.add('lit');
        if (levelNum === currentLevelLeft) {
          led.classList.add('peak');
        } else {
          led.classList.remove('peak');
        }
      } else {
        led.classList.remove('lit', 'peak');
      }
    });

    // 3. Rechten Equalizer aktualisieren
    rightLeds.forEach(function (led, index) {
      const levelNum = index + 1;
      if (levelNum <= currentLevelRight) {
        led.classList.add('lit');
        if (levelNum === currentLevelRight) {
          led.classList.add('peak');
        } else {
          led.classList.remove('peak');
        }
      } else {
        led.classList.remove('lit', 'peak');
      }
    });

    // 4. Untere Leiste: Rhythmisch leuchten
    bottomStep = (bottomStep + 1) % (bottomLeds.length || 1);
    bottomLeds.forEach(function (led, index) {
      if ((index + bottomStep) % 3 === 0) {
        led.classList.add('lit');
      } else {
        led.classList.remove('lit');
      }
    });

  }, 70);
}

/**
 * Stoppt die LED-Animation und schaltet alle LEDs ab.
 */
function stopLEDAnimation() {
  if (ledTimer) {
    clearInterval(ledTimer);
    ledTimer = null;
  }

  const ledBar = document.getElementById('led-bar');
  if (ledBar) ledBar.classList.remove('playing');

  const allLeds = document.querySelectorAll('#led-bar .led');
  allLeds.forEach(function (led) {
    led.classList.remove('lit', 'peak');
  });

  currentLevelLeft = 0;
  currentLevelRight = 0;
}

// ---------------------------------------------------------------------------
// 6. Modal schließen
// ---------------------------------------------------------------------------

/**
 * Versteckt das Modal und stoppt die aktuelle MIDI-Wiedergabe.
 */
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.setAttribute('hidden', '');
  }

  // MIDI stoppen
  if (window.AudioEngine) {
    AudioEngine.stopCurrentSong();
  }

  // LED deaktivieren
  stopLEDAnimation();

  currentSong = null;
}

// ---------------------------------------------------------------------------
// 7. Antwort prüfen
// ---------------------------------------------------------------------------

/**
 * Liest die Benutzereingabe, prüft sie gegen die gespeicherten Antworten
 * und verarbeitet Richtig/Falsch-Feedback.
 */
function submitAnswer() {
  if (!currentSong) return;

  const input    = document.getElementById('modal-input');
  const inputVal = input ? input.value.trim() : '';

  if (!inputVal) return;

  // Bereits gelöst?
  if (State.isSolved(currentSong.id)) {
    showToast('toast_already_solved');
    return;
  }

  const result = Solver.checkAnswer(currentSong, inputVal);

  if (result.correct) {
    // State aktualisieren
    State.markSolved(currentSong.id);

    // Entry & Button auf grün schalten
    const entry = document.querySelector('.song-entry[data-song-id="' + currentSong.id + '"]');
    if (entry) entry.classList.add('solved');

    const btn = document.getElementById('btn-' + currentSong.id);
    if (btn) btn.classList.add('solved');

    // Label-Blur entfernen & Flash-Effekt auslösen
    const labelDiv = document.getElementById('label-' + currentSong.id);
    if (labelDiv) {
      labelDiv.classList.add('solved-flash');
      labelDiv.querySelectorAll('.blurred').forEach(function (el) {
        el.classList.remove('blurred');
      });
    }

    // Modal-Vorschau scharf schalten
    const previewTitle  = document.getElementById('modal-preview-title');
    const previewArtist = document.getElementById('modal-preview-artist');
    if (previewTitle)  previewTitle.classList.remove('blurred');
    if (previewArtist) previewArtist.classList.remove('blurred');

    // Toast anzeigen
    showToast('toast_correct');

    // Fortschritt aktualisieren
    updateProgress();

    // Modal nach kurzer Verzögerung schließen
    setTimeout(closeModal, 1500);

  } else {
    // Falsch – Shake-Effekt
    const modalBox    = document.getElementById('modal-box');
    const shakeTarget = input || modalBox;
    if (shakeTarget) {
      shakeTarget.classList.remove('shake');
      // Reflow erzwingen damit die Animation neu startet
      void shakeTarget.offsetWidth;
      shakeTarget.classList.add('shake');
      setTimeout(function () { shakeTarget.classList.remove('shake'); }, 600);
    }

    showToast('toast_wrong');
  }
}

// ---------------------------------------------------------------------------
// 8. Fortschritt aktualisieren
// ---------------------------------------------------------------------------

/**
 * Aktualisiert die Anzeige „X / 25 gelöst" und prüft, ob die
 * Lösungsschwelle erreicht wurde.
 */
function updateProgress() {
  const count = State.getSolvedCount();

  const countEl = document.getElementById('solved-count');
  if (countEl) countEl.textContent = count;

  // Koordinaten anzeigen wenn Schwelle erreicht
  if (count >= SOLVE_THRESHOLD) {
    showCoords();
  }
}

// ---------------------------------------------------------------------------
// 9. Koordinaten anzeigen
// ---------------------------------------------------------------------------

/**
 * Dekodiert die verschlüsselten Koordinaten und zeigt das goldene Overlay.
 * Dekodierung: rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")
 */
function showCoords() {
  // Dekodierung
  const coords = rot13(
    decodeURIComponent(escape(atob(COORDS_ENCODED)))
  ).replace('JUKEBOX21', '');

  const overlay  = document.getElementById('coords-overlay');
  const display  = document.getElementById('coords-display');
  const copyBtn  = document.getElementById('coords-copy');
  const closeBtn = document.getElementById('coords-close');

  if (display) {
    display.textContent = coords;
  }

  if (overlay) {
    overlay.removeAttribute('hidden');
    overlay.classList.add('visible');
  }

  // Kopier-Button – alten Listener via cloneNode entfernen (verhindert Doppel-Binding)
  if (copyBtn) {
    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
    newCopyBtn.addEventListener('click', function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(coords).then(function () {
          showToast('toast_copied');
        }).catch(function () {
          showToast('toast_copied');
        });
      } else {
        // Fallback für ältere Browser
        const ta = document.createElement('textarea');
        ta.value = coords;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('toast_copied');
      }
    });
  }

  // Schließen-Button
  if (closeBtn) {
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', function () {
      if (overlay) {
        overlay.classList.remove('visible');
        overlay.setAttribute('hidden', '');
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 10. Toast anzeigen
// ---------------------------------------------------------------------------

/** Laufende Toast-Timeout-ID (verhindert überlappendes Ausblenden) */
let _toastTimeout = null;

/**
 * Zeigt kurzzeitig eine Feedback-Meldung an.
 * @param {string} key - Schlüssel in I18N[currentLang] (z. B. 'toast_correct')
 */
function showToast(key) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;

  const lang = window.currentLang || 'de';
  const dict = (window.I18N && window.I18N[lang]) ? window.I18N[lang] : {};
  const text = dict[key] || key;

  msgEl.textContent = text;

  // CSS-Klassen fuer Farbstyling (Gruen/Rot) setzen
  toast.classList.remove('correct', 'wrong');
  if (key === 'toast_correct' || key === 'toast_already_solved' || key === 'toast_copied') {
    toast.classList.add('correct');
  } else if (key === 'toast_wrong' || key === 'toast_file_error' || key === 'toast_audio_error') {
    toast.classList.add('wrong');
  }

  toast.removeAttribute('hidden');
  toast.classList.add('visible');

  // Vorherigen Timeout abbrechen
  if (_toastTimeout) clearTimeout(_toastTimeout);

  _toastTimeout = setTimeout(function () {
    toast.classList.remove('visible');
    setTimeout(function () {
      toast.setAttribute('hidden', '');
      toast.classList.remove('correct', 'wrong');
    }, 300);
    _toastTimeout = null;
  }, 2000);
}

// ---------------------------------------------------------------------------
// 11. Initialisierung
// ---------------------------------------------------------------------------

/**
 * Bootstrapped die gesamte UI:
 *  - Song-Grid rendern
 *  - Fortschrittsanzeige aktualisieren
 *  - Event-Listener für Modal, Overlay und Sprach-Toggle registrieren
 */
function init() {
  // Grid und Fortschritt
  renderSongGrid();
  updateProgress();

  // ---- Modal: Schließen-Button ----
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // ---- Modal: Bestätigen-Button ----
  const modalSubmit = document.getElementById('modal-submit');
  if (modalSubmit) {
    modalSubmit.addEventListener('click', submitAnswer);
  }

  // ---- Modal: Enter-Taste im Eingabefeld ----
  const modalInput = document.getElementById('modal-input');
  if (modalInput) {
    modalInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    });
  }

  // ---- Modal-Overlay: Klick auf Hintergrund schließt Modal ----
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      // Nur schließen wenn direkt auf den Overlay-Hintergrund (nicht die Box) geklickt
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // ---- Tastatur: ESC schließt Modal & Koordinaten-Overlay ----
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      const coordsOverlay = document.getElementById('coords-overlay');
      if (coordsOverlay && (coordsOverlay.classList.contains('visible') || !coordsOverlay.hasAttribute('hidden'))) {
        coordsOverlay.classList.remove('visible');
        coordsOverlay.setAttribute('hidden', '');
      }
    }
  });

  // ---- Sprach-Toggle: wird von i18n.js (initI18N) automatisch gebunden.
  //      Kein doppelter Listener nötig. ----
}

// ---------------------------------------------------------------------------
// 12. DOMContentLoaded-Einstiegspunkt
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', init);
