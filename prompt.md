# Projekt Jukebox – Schritt-für-Schritt Implementierungsanleitung

> **Wie benutzen?**
> Jeden Prompt einzeln kopieren und in einem neuen Chat verwenden.
> Hänge IMMER die Datei `architecture.md` als Kontext an.
> Die Schritte bauen aufeinander auf – Reihenfolge einhalten!

---

## SCHRITT 1 – Projektstruktur & index.html

**Was wird gemacht:** Erstellt die vollständige Verzeichnisstruktur und die `index.html` als Shell. Diese lädt alle zukünftigen Module und definiert das semantische HTML-Grundgerüst der Jukebox.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Erstelle die folgende Verzeichnisstruktur für das Projekt "Projekt Jukebox":

jukeBox/
├── index.html
├── css/
│   ├── jukebox.css
│   └── responsive.css
├── js/
│   ├── songs.js
│   ├── audio.js
│   ├── ui.js
│   ├── solver.js
│   ├── i18n.js
│   └── state.js
└── assets/ (leer)

Erstelle index.html mit folgendem Inhalt:
- DOCTYPE HTML5, lang="de"
- <head> mit: charset UTF-8, viewport meta, SEO-Meta-Description, Title "Projekt Jukebox"
- Google Fonts Link: 'Press Start 2P' und 'Roboto'
- <link> für css/jukebox.css und css/responsive.css
- <body> mit semantischen Sektionen:
  - <header>: Logo-Text "PROJEKT JUKEBOX", Sprach-Toggle-Button (DE/EN), Fortschrittsanzeige "0 / 25", Hinweis "21 zum Lösen"
  - <main>: div#jukebox-cabinet (äußeres Gehäuse), darin div#song-grid (25 Einträge als Platzhalter)
  - div#led-bar (LED-Leiste, animiert)
  - div#modal-overlay (Modal, initial versteckt), darin: modal-title, modal-label-preview, modal-input, modal-submit, modal-close
  - div#coords-overlay (Koordinaten-Reveal, initial versteckt)
  - div#toast (Feedback-Toast, initial versteckt)
- <script>-Tags am Ende des body in dieser Reihenfolge:
  songs.js, i18n.js, audio.js, solver.js, state.js, ui.js
- Alle interaktiven Elemente haben eindeutige IDs
- Alle Texte die übersetzt werden haben data-i18n="key" Attribute
- Platzhalter-Kommentare wo die 25 Song-Buttons eingefügt werden
- Erstelle songs.js, audio.js, ui.js, solver.js, i18n.js, state.js als leere Dateien mit einem Kommentar "// TODO: Schritt X"

Alle leeren CSS- und JS-Dateien sollen einen Kommentar enthalten der erklärt welcher Schritt sie befüllt.
```

---

## SCHRITT 2 – CSS: 80er Jukebox-Styling (jukebox.css)

**Was wird gemacht:** Implementiert das komplette visuelle Design. Chrom-Ränder, Neon-Effekte, 3D-Buttons, verschwommene Schilder, LED-Leiste. Kein externes Bild – alles via CSS.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle css/jukebox.css mit dem vollständigen 80er-Jahre Jukebox-Styling:

Design-Anforderungen:
- CSS Custom Properties (Variablen) für alle Farben:
  --color-bg: #1a0a00
  --color-chrome: linear-gradient(135deg, #e8e8e8, #a0a0a0, #f5f5f5)
  --color-neon-red: #ff2244
  --color-neon-green: #00ff88
  --color-gold: #d4a017
  --color-dark-red: #3d0a0a
  --font-retro: 'Press Start 2P', monospace

- body: Hintergrund --color-bg, Schrift --font-retro

- #jukebox-cabinet:
  - Chrom-Rahmen via box-shadow und border mit Gradienten
  - Abgerundete Ecken oben (wie echte Jukebox)
  - Tiefe Schlagschatten (mehrfach gestaffelt)
  - Dunkler Holz/Metall-Hintergrund innen
  - Max-Width: 900px, zentriert
  - Padding für innere Abstände

- #song-grid:
  - CSS Grid, 2 Spalten (button + label nebeneinander)
  - Responsive: auf kleinen Screens 1 Spalte
  - Jede Zeile: eine Song-Einheit

- .song-button:
  - Massiver 3D-Knopf
  - Kann rund (border-radius: 50%) oder eckig sein – mische beide Formen
  - Standard: roter Glow (neon-red), box-shadow mehrstufig
  - Hover: leichtere Farbe, leichter Tiefenversatz (transform: translateY(2px))
  - Active: stärker gedrückt (transform: translateY(4px))
  - Gelöst (.solved): --color-neon-green, green glow
  - Transition: alle Effekte smooth (0.15s)

- .song-label:
  - "Schild" neben dem Button
  - Leicht erhöhtes Panel (box-shadow innen für Gravur-Effekt)
  - Schrift: kleines --font-retro
  - Standard: filter: blur(8px) pointer-events: none
  - .solved .song-label: filter: none, Schrift lesbar
  - Transition: filter 0.5s ease

- #led-bar:
  - Horizontale Leiste aus kleinen LED-Rechtecken (via CSS repeating-linear-gradient)
  - Animierter Blink-Effekt (@keyframes led-pulse)
  - Standardmäßig gedimmt, bei Musikwiedergabe (.playing) voll leuchtend

- #modal-overlay:
  - Vollbild-Overlay (position: fixed, z-index: 1000)
  - Glassmorphism-Effekt: backdrop-filter: blur(10px), halbtransparenter Hintergrund
  - Zentriertes Modal-Fenster im Jukebox-Stil (Chrom-Rahmen, dunkler Hintergrund)

- #coords-overlay:
  - Ähnlich modal-overlay
  - Gold-Thema (#d4a017 Glow)
  - @keyframes für dramatisches Einblenden der Koordinaten

- #toast:
  - Kleines Feedback-Element oben
  - Grün für Richtig, Rot für Falsch
  - auto-hide nach 2s via CSS animation

- Animations zu definieren:
  @keyframes led-pulse
  @keyframes btn-shake (Falsch-Antwort)
  @keyframes btn-flash-green (Richtig-Antwort)
  @keyframes coords-reveal
  @keyframes toast-show

Alle CSS-Klassen die durch JavaScript gesetzt werden:
.playing, .solved, .shake, .flash-green, .visible, .hidden
```

---

## SCHRITT 3 – CSS: Responsive Design (responsive.css)

**Was wird gemacht:** Macht die Jukebox für Smartphones nutzbar. Geocacher sind unterwegs – Mobile-First ist wichtig.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle css/responsive.css mit Responsive-Regeln für die Jukebox:

Breakpoints:
- max-width: 768px (Tablet/Smartphone)
- max-width: 480px (kleines Smartphone)

Für max-width: 768px:
- #jukebox-cabinet: volle Breite, weniger padding
- #song-grid: weiterhin 2 Spalten aber kleinere Abstände
- .song-button: etwas kleiner
- #modal-overlay .modal: 95vw breit
- header: kleinere Schrift, vertikal gestapelt wenn nötig

Für max-width: 480px:
- #song-grid: 1 Spalte (button + label nebeneinander bleiben, aber Zeilen schmaler)
- Alternativ: 2 kompakte Spalten (jeweils button+label als Block)
- .song-button: Touch-freundlich (min 44px × 44px nach WCAG)
- Schriftgrößen reduziert
- LED-Leiste: vereinfacht (weniger LEDs sichtbar)

Zusätzlich:
- @media (prefers-color-scheme: light): leichte Anpassung (optional, falls gewünscht)
- Touch-Action für Buttons: touch-action: manipulation (verhindert Doppeltipp-Zoom)
```

---

## SCHRITT 4 – Internationalisierung (i18n.js)

**Was wird gemacht:** Implementiert die zweisprachige DE/EN Unterstützung. Alle UI-Texte werden hier zentral verwaltet.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle js/i18n.js mit der vollständigen Internationalisierung:

Struktur:
- Objekt `const I18N` mit Sprachen 'de' und 'en'
- Alle Schlüssel (keys) die im HTML via data-i18n="key" referenziert werden

Benötigte Keys (mindestens):
  header_title, lang_toggle, progress_label, progress_unit,
  modal_title_prefix, modal_input_placeholder, modal_submit,
  modal_close, toast_correct, toast_wrong, toast_already_solved,
  coords_title, coords_subtitle, coords_copy_btn,
  song_solved_badge, song_unsolved_hint,
  footer_text

Deutsche Texte:
  header_title: "PROJEKT JUKEBOX"
  modal_input_placeholder: "Titel oder Interpret eingeben..."
  toast_correct: "🎵 Richtig gelöst!"
  toast_wrong: "❌ Leider falsch. Versuch's nochmal!"
  toast_already_solved: "✅ Bereits gelöst!"
  coords_title: "🏆 Gerätschaft gefunden! 21/25 Songs erkannt!"
  coords_subtitle: "Die Koordinaten des Caches:"
  coords_copy_btn: "Koordinaten kopieren"

Englische Texte entsprechend übersetzen.

Funktionen:
- `function setLanguage(lang)`:
  - Setzt window.currentLang = lang
  - Iteriert über alle [data-i18n] Elemente
  - Setzt textContent oder placeholder je nach Element-Typ
  - Aktualisiert data-i18n-placeholder für Inputs
  - Speichert Wahl in localStorage ('jukebox_lang')

- `function initI18N()`:
  - Liest gespeicherte Sprache aus localStorage oder Fallback 'de'
  - Ruft setLanguage() auf
  - Registriert Click-Listener auf #lang-toggle Button

- Exportiert: `window.I18N = I18N; window.setLanguage = setLanguage;`
- Am Ende: `initI18N();`
```

---

## SCHRITT 5 – Song-Daten (songs.js)

**Was wird gemacht:** Hier werden die 25 Songs eingetragen. Die Daten werden mit ROT13 + Base64 kodiert. Du bekommst in diesem Schritt eine Vorlage und einen Encoder-Helper.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle js/songs.js:

1. ROT13-Hilfsfunktion:
function rot13(str) {
  return str.replace(/[a-zA-ZäöüÄÖÜ]/g, c => {
    // Nur ASCII a-z und A-Z rotieren (Umlaute unverändert lassen)
    const base = c >= 'a' ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

2. Encode-Hilfsfunktion:
function enc(str) {
  return btoa(unescape(encodeURIComponent(rot13(str.toLowerCase().trim()))));
}

3. Song-Array (mit MIDI-Mapping):
const SONGS = [
  // PLATZHALTER – wird in Schritt 5b durch echte Songs ersetzt
  // Format:
  {
    id: 1,
    display: {
      title: enc("Songtitel"),
      artist: enc("Interpret"),
    },
    answers: [
      enc("songtitel"),    // Hauptantwort (lowercase)
      enc("interpret"),    // Interpret als Alternative
      // enc("kurzform"), // Optional: bekannte Kurzform
    ],
    midiFile: "MIDI51/Dateiname.mid",  // Relativer Pfad zur MIDI-Datei
  },
];

// HINWEIS: MELODY_PRESETS und melodyIndex entfallen komplett.
// Jeder Song verwendet midiFile mit dem Pfad zur echten MIDI-Datei aus MIDI51/.

4. Export:
window.SONGS = SONGS;
window.rot13 = rot13;
window.enc = enc;

WICHTIG:
- Kein Klartext von Titeln oder Interpreten im Code
- enc() muss ÜBERALL verwendet werden
- Füge 3 Beispiel-Songs als Platzhalter ein damit das Grundgerüst funktioniert
- Die echten Songs werden separat im nächsten Prompt eingetragen
```

---

## SCHRITT 5b – Song-Daten befüllen

**Was wird gemacht:** Die 25 echten Songs werden in das SONGS-Array eingetragen. Dieser Prompt wird nach dem Erhalt der Song-Liste ausgeführt.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Ergänze js/songs.js: Ersetze die Platzhalter im SONGS-Array durch die echten 25 Songs.

ALLE Strings MÜSSEN mit enc() kodiert werden. Niemals Klartext im Code!

Songs-Array (vollständig):

const SONGS = [
  // Song 1 (A1)
  { id:1, display:{ title:enc("The Winner Takes It All"), artist:enc("ABBA") },
    answers:[ enc("the winner takes it all"), enc("winner takes it all"), enc("abba") ],
    midiFile: "MIDI51/A1.mid" },

  // Song 2 (A2)
  { id:2, display:{ title:enc("Forever Young"), artist:enc("Alphaville") },
    answers:[ enc("forever young"), enc("alphaville") ],
    midiFile: "MIDI51/A2.mid" },

  // Song 3 (A3)
  { id:3, display:{ title:enc("Another Brick in the Wall"), artist:enc("Pink Floyd") },
    answers:[ enc("another brick in the wall"), enc("pink floyd") ],
    midiFile: "MIDI51/A3.mid" },

  // Song 4 (A4)
  { id:4, display:{ title:enc("Total Eclipse of the Heart"), artist:enc("Bonnie Tyler") },
    answers:[ enc("total eclipse of the heart"), enc("bonnie tyler") ],
    midiFile: "MIDI51/A4.mid" },

  // Song 5 (A5)
  { id:5, display:{ title:enc("Cotton Eye Joe"), artist:enc("Rednex") },
    answers:[ enc("cotton eye joe"), enc("rednex") ],
    midiFile: "MIDI51/A5.mid" },

  // Song 6 (B1)
  { id:6, display:{ title:enc("Fortunate Son"), artist:enc("Creedence Clearwater Revival") },
    answers:[ enc("fortunate son"), enc("creedence clearwater revival"), enc("ccr") ],
    midiFile: "MIDI51/B1.mid" },

  // Song 7 (B2)
  { id:7, display:{ title:enc("Knockin' on Heaven's Door"), artist:enc("Guns N' Roses") },
    answers:[ enc("knockin on heavens door"), enc("guns n roses"), enc("guns and roses") ],
    midiFile: "MIDI51/B2.mid" },

  // Song 8 (B3)
  { id:8, display:{ title:enc("Behind Blue Eyes"), artist:enc("Limp Bizkit") },
    answers:[ enc("behind blue eyes"), enc("limp bizkit") ],
    midiFile: "MIDI51/B3.mid" },

  // Song 9 (B4)
  { id:9, display:{ title:enc("What a Wonderful World"), artist:enc("Louis Armstrong") },
    answers:[ enc("what a wonderful world"), enc("louis armstrong"), enc("armstrong") ],
    midiFile: "MIDI51/B4.mid" },

  // Song 10 (B5)
  { id:10, display:{ title:enc("Home Sweet Home"), artist:enc("Mötley Crüe") },
    answers:[ enc("home sweet home"), enc("motley crue") ],
    midiFile: "MIDI51/B5.mid" },

  // Song 11 (C1)
  { id:11, display:{ title:enc("My Heart Will Go On"), artist:enc("Céline Dion") },
    answers:[ enc("my heart will go on"), enc("celine dion"), enc("titanic") ],
    midiFile: "MIDI51/C1.mid" },

  // Song 12 (C2)
  { id:12, display:{ title:enc("The Sound of Silence"), artist:enc("Simon & Garfunkel") },
    answers:[ enc("the sound of silence"), enc("sound of silence"), enc("simon and garfunkel"), enc("simon garfunkel") ],
    midiFile: "MIDI51/C2.mid" },

  // Song 13 (C3)
  { id:13, display:{ title:enc("He's a Pirate"), artist:enc("Hans Zimmer") },
    answers:[ enc("hes a pirate"), enc("hans zimmer"), enc("pirates of the caribbean") ],
    midiFile: "MIDI51/C3.mid" },

  // Song 14 (C4)
  { id:14, display:{ title:enc("Popcorn"), artist:enc("Hot Butter") },
    answers:[ enc("popcorn"), enc("hot butter") ],
    midiFile: "MIDI51/C4.mid" },

  // Song 15 (C5)
  { id:15, display:{ title:enc("Purple Rain"), artist:enc("Prince") },
    answers:[ enc("purple rain"), enc("prince") ],
    midiFile: "MIDI51/C5.mid" },

  // Song 16 (D1)
  { id:16, display:{ title:enc("Listen to Your Heart"), artist:enc("Roxette") },
    answers:[ enc("listen to your heart"), enc("roxette") ],
    midiFile: "MIDI51/D1.mid" },

  // Song 17 (D2)
  { id:17, display:{ title:enc("Hey Jude"), artist:enc("The Beatles") },
    answers:[ enc("hey jude"), enc("the beatles"), enc("beatles") ],
    midiFile: "MIDI51/D2.mid" },

  // Song 18 (D3)
  { id:18, display:{ title:enc("Yesterday"), artist:enc("The Beatles") },
    answers:[ enc("yesterday"), enc("the beatles"), enc("beatles") ],
    midiFile: "MIDI51/D3.mid" },

  // Song 19 (D4)
  { id:19, display:{ title:enc("Take My Breath Away"), artist:enc("Berlin") },
    answers:[ enc("take my breath away"), enc("berlin"), enc("top gun") ],
    midiFile: "MIDI51/D4.mid" },

  // Song 20 (D5)
  { id:20, display:{ title:enc("We Didn't Start the Fire"), artist:enc("Billy Joel") },
    answers:[ enc("we didnt start the fire"), enc("billy joel") ],
    midiFile: "MIDI51/D5.mid" },

  // Song 21 (E1)
  { id:21, display:{ title:enc("We Will Rock You"), artist:enc("Queen") },
    answers:[ enc("we will rock you"), enc("queen") ],
    midiFile: "MIDI51/E1.mid" },

  // Song 22 (E2)
  { id:22, display:{ title:enc("Sailing"), artist:enc("Rod Stewart") },
    answers:[ enc("sailing"), enc("rod stewart") ],
    midiFile: "MIDI51/E2.mid" },

  // Song 23 (E3)
  { id:23, display:{ title:enc("Paradise"), artist:enc("Coldplay") },
    answers:[ enc("paradise"), enc("coldplay") ],
    midiFile: "MIDI51/E3.mid" },

  // Song 24 (E4)
  { id:24, display:{ title:enc("Photograph"), artist:enc("Nickelback") },
    answers:[ enc("photograph"), enc("nickelback") ],
    midiFile: "MIDI51/E4.mid" },

  // Song 25 (E5)
  { id:25, display:{ title:enc("Let Her Go"), artist:enc("Passenger") },
    answers:[ enc("let her go"), enc("passenger") ],
    midiFile: "MIDI51/E5.mid" },

  // Song 26 (F1)
  { id:26, display:{ title:enc("Sonne"), artist:enc("Rammstein") },
    answers:[ enc("sonne"), enc("rammstein") ],
    midiFile: "MIDI51/F1.mid" },
];

HINWEIS:
- melodyIndex und MELODY_PRESETS wurden vollständig entfernt
- Jeder Song enthält midiFile mit dem relativen Pfad zur Datei in MIDI51/
- Die MIDI-Dateien dürfen NIEMALS verändert werden
```

---

## SCHRITT 6 – Audio-Engine (audio.js)

**Was wird gemacht:** Implementiert den MIDI-Player. Echte `.mid`-Dateien aus `MIDI51/` werden per `fetch()` geladen, binär geparst und Note-für-Note über die Web Audio API abgespielt. Kein externer MIDI-Synthesizer, keine Libraries.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle js/audio.js:

1. State-Variablen:
let audioCtx = null;
let masterGainNode = null;
let isPlaying = false;
let schedulerTimer = null;
let activeOscillators = [];
let noiseBuffer = null;
let midiCache = {};  // Pfad → geparste MIDI-Daten (Cache)

2. AudioContext Initialisierung (lazy):
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = 0.5;
    masterGainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

3. Noise-Buffer für Schlagzeug:
function getNoiseBuffer() {
  if (!noiseBuffer && audioCtx) {
    const sr = audioCtx.sampleRate;
    noiseBuffer = audioCtx.createBuffer(1, sr * 0.3, sr);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

4. MIDI-Parser (binary):
function parseMidiBuffer(arrayBuffer)
- Liest Header: "MThd", Format, Anzahl Tracks, Division (Ticks/Quarter)
- Liest alle Tracks: "MTrk", Events (Note On/Off, Meta-Tempo, SysEx)
- Unterstützt Running Status
- Sammelt Tempo-Änderungen (Meta 0x51)
- Konvertiert Ticks → Sekunden via Tempo-Timeline
- Gibt zurück: { duration: number, notes: [{channel, key, start, dur, vel}] }
- notes ist nach start sortiert

5. Note abspielen:
function scheduleNote(n, time) {
  // Kanal 9 = Schlagzeug:
  //   key 35/36 → Kick (Sinus, frequency 150→30, kurzer Decay)
  //   andere → Snare/HiHat (Noise-Buffer, kurzer Gain-Decay)
  // Melodie-Kanäle:
  //   freq = 440 * 2^((key-69)/12)
  //   Wellenform: ['sawtooth','square','triangle','sine','sawtooth','square'][channel % 6]
  //   Gain-Envelope: Attack 0.01s, Release min(0.18, dur*0.4)
  //   Alle Nodes an masterGainNode anschließen
  //   activeOscillators.push(osc)
}

6. Song laden und abspielen:
async function playSong(midiFilePath, onEnd) {
  // Lade MIDI per fetch() wenn nicht im Cache
  // parseMidiBuffer() aufrufen, Ergebnis in midiCache[midiFilePath] speichern
  // isPlaying = true, startTimeSec = audioCtx.currentTime + 0.1
  // schedulerTimer = setInterval(40ms):
  //   Lookahead: elapsed + 1.0s
  //   scheduleNote() für alle Notes in diesem Fenster
  //   Bei Ende (elapsed >= duration + 0.5): stopCurrentSong(), onEnd() aufrufen
}

7. Song stoppen:
function stopCurrentSong() {
  isPlaying = false;
  clearInterval(schedulerTimer);
  activeOscillators.forEach(o => { try { o.stop(); } catch(e){} });
  activeOscillators = [];
}

8. Lautstärke:
function setVolume(value) {
  if (masterGainNode) masterGainNode.gain.value = value * 0.7;
}

9. Export:
window.AudioEngine = { playSong, stopCurrentSong, setVolume, initAudio };

WICHTIG:
- Die MIDI-Dateien (MIDI51/*.mid) werden NUR gelesen, niemals verändert
- Caching per midiCache verhindert doppeltes Laden derselben Datei
- initAudio() MUSS innerhalb einer User-Geste (click) aufgerufen werden
- playSong() ruft initAudio() intern auf
```

---

## SCHRITT 7 – Fuzzy-Matching & Validierung (solver.js)

**Was wird gemacht:** Implementiert den Levenshtein-Algorithmus und die Antwort-Validierungslogik. Toleriert Tippfehler und Groß-/Kleinschreibung.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle js/solver.js:

1. Normalize-Funktion:
`function normalize(str)`
- lowercase, trim
- Umlaute ersetzen: ä→ae, ö→oe, ü→ue, ß→ss
- Alle nicht-alphanumerischen Zeichen (außer Leerzeichen) entfernen
- Mehrfache Leerzeichen zu einem

2. Levenshtein-Distanz:
`function levenshtein(a, b)`
- Standard-Implementierung mit 2D-Matrix
- Gibt integer zurück

3. Fuzzy-Match:
`function fuzzyMatch(input, target)`
- Beide normalisieren
- Threshold: Math.max(1, Math.min(3, Math.floor(target.length / 5)))
- Gibt true wenn levenshtein(input, target) <= threshold

4. Song-Validierung:
`function checkAnswer(song, userInput)`
- Dekodiert alle answers[]: rot13(atob(encoded)).toLowerCase()
- Normalisiert auch userInput
- Prüft fuzzyMatch gegen JEDE Antwort in answers[]
- Gibt {correct: boolean, matchedWith: string|null} zurück

5. Export:
window.Solver = { checkAnswer, normalize, fuzzyMatch, levenshtein };
```

---

## SCHRITT 8 – Spielfortschritt (state.js)

**Was wird gemacht:** Bereitet den localStorage-Fortschritt vor, lässt ihn aber DEAKTIVIERT. Der Code ist auskommentiert und bereit zur Aktivierung.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle js/state.js:

Status: DEAKTIVIERT (alle aktiven Zeilen auskommentiert)

1. Interner State:
`let solvedSongs = new Set(); // IDs der gelösten Songs`

2. Lade-Funktion (auskommentiert):
/*
function loadProgress() {
  const saved = localStorage.getItem('jukebox_progress');
  if (saved) {
    solvedSongs = new Set(JSON.parse(saved));
  }
}
*/

3. Speicher-Funktion (auskommentiert):
/*
function saveProgress() {
  localStorage.setItem('jukebox_progress', JSON.stringify([...solvedSongs]));
}
*/

4. Reset-Funktion (auskommentiert):
/*
function resetProgress() {
  localStorage.removeItem('jukebox_progress');
  solvedSongs = new Set();
}
*/

5. Aktiv genutzter State (NICHT auskommentiert):
function markSolved(id) {
  solvedSongs.add(id);
  // saveProgress(); // DEAKTIVIERT
}

function isSolved(id) {
  return solvedSongs.has(id);
}

function getSolvedCount() {
  return solvedSongs.size;
}

// Initialisierung (DEAKTIVIERT):
// loadProgress();

6. Export:
window.State = { markSolved, isSolved, getSolvedCount, solvedSongs };
```

---

## SCHRITT 9 – UI-Logik (ui.js)

**Was wird gemacht:** Verbindet alle Module. Rendert die 25 Song-Einträge, verwaltet das Modal, verarbeitet Antworten und steuert alle visuellen Zustände.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Befülle js/ui.js (Haupt-Controller):

1. Lösungsschwelle und Koordinaten:
// ANZAHL DER SONGS ZUM LÖSEN (21 von 25 nötig)
const SOLVE_THRESHOLD = 21;

// ECHTE KOORDINATEN – VERSCHLÜSSELT
// Klartext: N 50° 23.356 E 011° 55.427
// Verschlüsselt mit ROT13 + Base64 + Salt "JUKEBOX21"
const COORDS_ENCODED = btoa(
  unescape(encodeURIComponent(rot13("N 50° 23.356 E 011° 55.427") + "JUKEBOX21"))
);
// Dekodierung in showCoords():
// decodeURIComponent(escape(atob(COORDS_ENCODED))).replace("JUKEBOX21","") |> rot13

2. Song-Grid rendern:
`function renderSongGrid()`
- Iteriert über window.SONGS (25 Einträge)
- Für jeden Song erstellt:
  - div.song-entry
  - button.song-button (id="btn-{id}", data-song-id="{id}")
    - Inhalt: Song-Nummer als Text (z.B. "A1", "A2", ... "E5" – 5×5 Grid)
    - Klasse .solved wenn State.isSolved(id)
  - div.song-label (id="label-{id}")
    - Span.label-title (blur wenn ungelöst)
    - Span.label-artist (blur wenn ungelöst)
    - Dekodierter Text (title/artist) IMMER im DOM, nur via CSS versteckt
- Click-Listener auf jeden Button → openModal(song)

3. Modal öffnen:
`function openModal(song)`
- Setzt modal-title auf Song-Nummer
- Setzt modal-label-preview auf blurriges Schild (falls gelöst: scharf)
- Leert modal-input
- Zeigt #modal-overlay (.visible)
- Fokussiert Input-Feld
- Startet AudioEngine.playSong(song.midiFile, onMidiEnd)
- Fügt .playing zu #led-bar hinzu

4. Modal schließen:
`function closeModal()`
- Versteckt #modal-overlay
- Stoppt AudioEngine.stopCurrentSong()
- Entfernt .playing von #led-bar

5. Antwort prüfen:
`function submitAnswer()`
- Liest Input-Wert
- Prüft State.isSolved(song.id) → Toast "bereits gelöst"
- Ruft Solver.checkAnswer(song, input) auf
- Bei richtig:
  - State.markSolved(song.id)
  - Button-Klasse → .solved
  - Label-Klasse → blur entfernen
  - Toast "Richtig!" anzeigen
  - Fortschrittsanzeige aktualisieren (updateProgress)
  - Prüft ob State.getSolvedCount() >= SOLVE_THRESHOLD → showCoords()
  - closeModal() nach 1.5s
- Bei falsch:
  - .shake auf Input oder Modal-Box
  - Toast "Falsch"

6. Fortschritt aktualisieren:
`function updateProgress()`
- Setzt #progress-count auf State.getSolvedCount()
- Prüft ob >= SOLVE_THRESHOLD (21) → showCoords()

7. Koordinaten anzeigen:
`function showCoords()`
- Dekodiert COORDS_ENCODED:
  `rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")`
- Zeigt #coords-overlay mit dekodiertem Text
- Kopier-Button: navigator.clipboard.writeText(coords)

8. Toast:
`function showToast(key)`
- Zeigt #toast mit I18N-Text für key
- Fügt .visible hinzu, nach 2s wieder entfernen

9. Initialisierung:
`function init()`
- renderSongGrid()
- updateProgress()
- Event-Listener für: modal-close, modal-submit (Enter + Button), Overlay-Click zum Schließen
- Event-Listener für Sprach-Toggle (delegiert an i18n.js)

- Am Ende: document.addEventListener('DOMContentLoaded', init);
```

---

## SCHRITT 10 – Integration testen

**Was wird gemacht:** Manuelle Checkliste um sicherzustellen dass alle Module korrekt zusammenarbeiten, bevor die echten Songs eingetragen werden.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Überprüfe folgende Punkte in der aktuellen Implementierung und liste Fehler auf:

Checkliste:
[ ] index.html lädt alle 6 JS-Dateien in korrekter Reihenfolge
[ ] index.html lädt jukebox.css und responsive.css
[ ] Google Fonts 'Press Start 2P' ist verlinkt
[ ] Alle data-i18n Keys in HTML existieren in i18n.js
[ ] DE/EN Toggle wechselt alle Texte
[ ] 25 Song-Buttons werden gerendert (auch mit Platzhalter-Songs)
[ ] Klick auf Button öffnet Modal
[ ] Audio startet beim Öffnen des Modals (Web Audio API)
[ ] LED-Leiste animiert sich bei Audiowiedergabe
[ ] Eingabe einer korrekten Antwort (Platzhalter-Song) → Knopf wird grün
[ ] Eingabe einer falschen Antwort → Shake-Animation, Toast
[ ] Schild ungelöster Songs ist unlesbar (blur)
[ ] Schild gelöster Songs ist lesbar
[ ] Modal schließt korrekt (Button + Overlay-Click + ESC)
[ ] Fortschrittsanzeige wird korrekt aktualisiert
[ ] Responsive: Auf 375px (iPhone) ist alles bedienbar
[ ] Koordinaten-Overlay erscheint wenn 21 Songs gelöst sind (nicht erst bei 25)
[ ] Koordinaten sind korrekt dekodiert: "N 50° 23.356 E 011° 55.427"

Für jeden gefundenen Fehler:
- Beschreibe das Problem
- Gib den Fix an (konkrete Code-Änderung)
- Wende den Fix an
```

---

## SCHRITT 11 – Koordinaten & Finalisierung

**Was wird gemacht:** Ersetzt die Platzhalter-Koordinaten durch die echten GPS-Koordinaten des Caches. Verschlüsselt und eingebettet.

```
Schritt 11 ist nicht mehr nötig – die Koordinaten sind bereits in Schritt 9 eingebettet.

Führe stattdessen eine Verifikation durch:

1. Prüfe COORDS_ENCODED in js/ui.js:
   - Dekodiere es in der Browser-Konsole:
     ```js
     const rot13=s=>s.replace(/[a-zA-Z]/g,c=>{const b=c>='a'?97:65;return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b)})
     rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21","")
     ```
   - Ergebnis muss sein: "N 50° 23.356 E 011° 55.427"

2. Prüfe SOLVE_THRESHOLD in js/ui.js:
   - Muss den Wert 21 haben

3. Erstelle einen README.md für das GitHub-Repository:
   - Beschreibt das Projekt (ohne Spoiler, kein Hinweis auf die Zahl 21)
   - Erklärt wie man es auf GitHub Pages hostet
   - Hinweis dass das Lösen der Songs erforderlich ist

4. Finale Überprüfung:
   - Kein Klartext der Koordinaten im Quellcode (grep nach "50" und "55")
   - Koordinaten-Overlay funktioniert bei genau 21 gelösten Songs
   - README.md ist fertig
```

---

## SCHRITT 12 – GitHub Deployment

**Was wird gemacht:** Vorbereitung für GitHub Pages Hosting. `.gitignore` und deployment-relevante Einstellungen.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Bereite das Projekt für GitHub Pages vor:

1. Erstelle .gitignore:
   .DS_Store
   *.log
   node_modules/
   .env

2. Überprüfe index.html:
   - Alle Pfade sind relativ (css/, js/, nicht /css/, /js/)
   - Kein localhost-spezifischer Code

3. Erstelle README.md (falls noch nicht vorhanden):
   # Projekt Jukebox 🎵
   Ein interaktives Geocaching-Rätsel im 80er-Jahre Jukebox-Stil.
   
   ## Spielen
   [Link einfügen wenn live]
   
   ## Technologie
   - Vanilla HTML/CSS/JS
   - Web Audio API
   - GitHub Pages Hosting
   
   ## Für Cache-Inhaber
   Songs und Koordinaten in js/songs.js und js/ui.js anpassen.

4. Erstelle SCHRITT-FÜR-SCHRITT Deployment-Anleitung als Kommentar:
   # Deployment:
   # 1. git init (falls noch nicht done)
   # 2. git add .
   # 3. git commit -m "Projekt Jukebox v1.0"
   # 4. git remote add origin [dein-repo-url]
   # 5. git push -u origin main
   # 6. GitHub → Settings → Pages → Source: main branch
   # 7. URL: https://[username].github.io/jukeBox/
```

---

## SCHRITT 13 – Aktivierung localStorage (optional, wenn Cache live)

**Was wird gemacht:** Aktiviert die deaktivierte localStorage-Fortschrittsspeicherung, sobald der Cache ausgelegt ist.

```
Bitte lies zuerst die architecture.md aus dem Repository.

Aktiviere den Spielfortschritt in js/state.js:

1. Entferne die Kommentarzeichen /* ... */ von:
   - loadProgress() Funktion
   - saveProgress() Funktion
   - resetProgress() Funktion (optional)
   - loadProgress() Aufruf am Ende

2. In markSolved(): entkommentiere saveProgress();

3. In ui.js init(): füge loadProgress() als ersten Aufruf hinzu

4. Füge optional einen Reset-Button hinzu (z.B. im Footer):
   - Nur sichtbar wenn State.getSolvedCount() > 0
   - Doppelte Bestätigung: "Wirklich zurücksetzen?" Dialog
   - Ruft State.resetProgress() auf und re-rendert Grid

5. Test:
   - Seite laden → Fortschritt aus localStorage lesen
   - Song lösen → Fortschritt gespeichert
   - Seite neu laden → Song noch gelöst
   - Reset → alles zurückgesetzt
```

---

## Notizen & Cheatsheet

### ROT13-Encoder (für Songs manuell kodieren)
```js
// Im Browser-Konsole ausführen:
function rot13(s){return s.replace(/[a-zA-Z]/g,c=>{const b=c>='a'?97:65;return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b);})}
function enc(s){return btoa(unescape(encodeURIComponent(rot13(s.toLowerCase().trim()))))}

enc("Queen")              // → kodierter String
enc("Bohemian Rhapsody")  // → kodierter String
```

### Decoder (zum Verifizieren)
```js
function dec(s){return rot13(decodeURIComponent(escape(atob(s))))}
dec(enc("Queen"))  // → "queen"
```

### MIDI51 – Song-Mapping Übersicht (jukeBox_2)
```
Song #  → MIDI-Datei (in MIDI51/)
 1  ABBA – The Winner Takes It All           → A1.mid
 2  Alphaville – Forever Young               → A2.mid
 3  Pink Floyd – Another Brick in the Wall   → A3.mid
 4  Bonnie Tyler – Total Eclipse of the Heart → A4.mid
 5  Rednex – Cotton Eye Joe                  → A5.mid
 6  CCR – Fortunate Son                      → B1.mid
 7  Guns N' Roses – Knockin' on Heaven's Door → B2.mid
 8  Limp Bizkit – Behind Blue Eyes           → B3.mid
 9  Louis Armstrong – What a Wonderful World → B4.mid
10  Mötley Crüe – Home Sweet Home            → B5.mid
11  Céline Dion – My Heart Will Go On        → C1.mid
12  Simon & Garfunkel – The Sound of Silence → C2.mid
13  Hans Zimmer – He's a Pirate              → C3.mid
14  Hot Butter – Popcorn                     → C4.mid
15  Prince – Purple Rain                     → C5.mid
16  Roxette – Listen to Your Heart           → D1.mid
17  The Beatles – Hey Jude                   → D2.mid
18  The Beatles – Yesterday                  → D3.mid
19  Berlin – Take My Breath Away             → D4.mid
20  Billy Joel – We Didn't Start the Fire    → D5.mid
21  Queen – We Will Rock You                 → E1.mid
22  Rod Stewart – Sailing                    → E2.mid
23  Coldplay – Paradise                      → E3.mid
24  Nickelback – Photograph                  → E4.mid
25  Passenger – Let Her Go                   → E5.mid
26  Rammstein – Sonne                        → F1.mid
```
