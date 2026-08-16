# Projekt Jukebox – Architektur-Referenz

> Diese Datei dient als Nachschlagewerk für alle zukünftigen Prompts.
> Bitte VOR jeder Änderung lesen, um Inkonsistenzen zu vermeiden.

---

## Projektübersicht

**Name:** Projekt Jukebox
**Typ:** Interaktives Geocaching-Rätsel (statische Web-App)
**Hosting:** GitHub Pages (`index.html` als Einstiegspunkt)
**Sprache:** Zweisprachig DE/EN (umschaltbar per Toggle-Button)

---

## Datei- und Ordnerstruktur

```
jukeBox/
├── index.html          # Einstiegspunkt (Shell, lädt alle Module)
├── architecture.md     # Diese Datei (Architektur-Referenz)
├── prompt.md           # Schritt-für-Schritt Implementierungsanleitung
├── MIDI51/             # 51 MIDI-Dateien (unveränderter Originalinhalt!)
│   ├── ABBA.Gimme gimme gimme L.mid
│   ├── ... (51 Dateien gesamt)
│   └── We-Will-Rock-You.mid
├── css/
│   ├── jukebox.css     # Haupt-Stylesheet (80er Jukebox-Design)
│   └── responsive.css  # Mobile / Responsive-Regeln
├── js/
│   ├── songs.js        # Song-Daten (Base64+ROT13 kodiert) + MIDI-Mapping
│   ├── audio.js        # MIDI-Player Engine (Web Audio API + MIDI-Parser)
│   ├── ui.js           # DOM-Manipulation, Modal-Logik, LED-Animation
│   ├── solver.js       # Fuzzy-Matching (Levenshtein), Antwort-Validierung
│   ├── i18n.js         # Übersetzungen DE/EN, Sprachumschalt-Logik
│   └── state.js        # Spielfortschritt (localStorage, DEAKTIVIERT)
└── assets/
    └── (keine externen Bilder – alles CSS-generiert)
```

---

## Design-System

### Stil
- **Thema:** Realistische 80er-Jahre Diner-Wandmodell-Jukebox
- **Farben:**
  - Chrom: `linear-gradient(135deg, #e8e8e8, #a0a0a0, #f5f5f5)`
  - Neon-Rot (Standard-Button): `#ff2244` mit `box-shadow: 0 0 15px #ff2244`
  - Neon-Grün (Gelöst-Button): `#00ff88` mit `box-shadow: 0 0 15px #00ff88`
  - Hintergrund: `#1a0a00` (tiefes Dunkelbraun)
  - Akzent-Gold: `#d4a017`
- **Schrift:** `'Press Start 2P'` (Google Fonts) für Retro-Look
- **Texturen:** CSS-Gradienten simulieren Metall, Leder, Glas
- **Schatten:** Tiefe `box-shadow` für 3D-Tiefenwirkung

### Song-Eintrag Layout (1 von 25)
```
[ KNOPF ]  [ SCHILD/ETIKETT              ]
  3D-Rot     ungelöst: blur(8px)
  (rund      gelöst: lesbar (Titel+Artist)
  oder eckig)
```
- Knopf-Druck → öffnet Modal + startet MIDI-Wiedergabe
- Gelöst: Knopf leuchtet Grün, Schild wird lesbar

---

## Song-Daten (songs.js)

### Datenformat pro Song
```js
{
  id: 1,                              // 1–25
  display: {
    title:  btoa(rot13("Songtitel")), // Base64(ROT13(Klartext))
    artist: btoa(rot13("Interpret")),
  },
  answers: [
    btoa(rot13("songtitel")),         // lowercase, normalisiert
    btoa(rot13("interpret")),
    btoa(rot13("kurzform")),          // Optionale Alias-Varianten
  ],
  midiFile: "MIDI51/Dateiname.mid",  // Relativer Pfad zur MIDI-Datei
}
```

> ⚠️ Das Feld `melody` / `melodyIndex` entfällt vollständig.
> Stattdessen enthält jeder Song-Eintrag `midiFile` mit dem relativen Pfad.

### Codierungs-Pipeline
1. **ROT13:** Einfache Caesar-Chiffre (A↔N, B↔O, …)
2. **Base64:** `btoa()` → lesbar aber nicht direkt erkennbar
3. **Dekodierung zur Laufzeit:** `rot13(atob(encoded))`

---

## Audio-Engine (audio.js)

### Technologie
- **Web Audio API** – keine externe Bibliothek
- **Eigener MIDI-Parser:** Binäres MIDI (Format 0 + 1) wird direkt aus dem ArrayBuffer gelesen
- **Wiedergabe:** Notes werden mit Oszillatoren (melodisch: Sägezahn/Square/Sinus/Dreieck je nach Kanal, Schlagzeug: Kick-Sinus + Noise-Buffer für Snare/Hi-Hat) über einen gemeinsamen `masterGainNode` ausgegeben

### MIDI-Dateien
- Liegen im Ordner `MIDI51/` (51 `.mid`-Dateien)
- Werden über `fetch()` als `ArrayBuffer` geladen
- **Die Dateien werden NIEMALS verändert – nur gelesen**
- Jede Datei wird nach dem ersten Laden gecacht (kein doppelter Fetch)

### Verhalten
- Knopfdruck → öffnet Modal → MIDI-Datei wird geladen und vollständig abgespielt
- Visuell synchron: LED-Leiste animiert sich während der Wiedergabe
- Lautstärke: steuerbar über `masterGainNode.gain`
- Song-Erkennungs-Apps (Shazam etc.) können die Musik erkennen – das ist gewollt

### Wichtige Funktionen
```js
// Initialisierung (lazy, erst beim ersten User-Klick)
function initAudio()

// MIDI-Datei laden und abspielen
async function playSong(midiFilePath, onEnd)

// Aktuellen Song stoppen
function stopCurrentSong()

// Lautstärke setzen (0–1)
function setVolume(value)

// Export:
window.AudioEngine = { playSong, stopCurrentSong, setVolume };
```

### MIDI-Parser (intern in audio.js)
```js
// Liest ArrayBuffer, gibt { duration, notes } zurück
// notes: [{ channel, key, start, dur, vel }, ...]
function parseMidiBuffer(arrayBuffer)
```

---

## UI-Logik (ui.js)

### Modal-Aufbau
```
┌─────────────────────────────┐
│ Song #X                     │
│ ┌─────────────────────────┐ │
│ │ [blurriges Schild]      │ │  ← blur(8px) solange ungelöst
│ └─────────────────────────┘ │
│ [Eingabefeld]               │
│ [Bestätigen]  [Schließen]   │
└─────────────────────────────┘
```
- Richtig → grüner Flash, Schild wird scharf, Knopf wird Grün
- Falsch → roter Shake-Effekt

### Fortschrittsanzeige
- Header-Bereich: `X / 25 Songs gelöst`
- Koordinaten erscheinen wenn **≥ 21 von 25** Songs gelöst sind
- Die Zahl 25 im Header bleibt immer sichtbar (Gesamtanzahl)
- `SOLVE_THRESHOLD = 21` als Konstante in ui.js

---

## Antwort-Validierung (solver.js)

### Algorithmus
1. Normalisieren: `input.toLowerCase().trim().replace(/[^a-z0-9äöüß ]/g, '')`
2. Alle `answers[]` des Songs dekodieren und ebenfalls normalisieren
3. Levenshtein-Distanz berechnen
4. Schwellenwert: `Math.max(1, Math.floor(answer.length / 5))`, max 3
5. Match wenn `distance <= threshold`

### Beispiele
| Eingabe | Akzeptiert? |
|---------|-------------|
| `"queen"` | ✅ (exakt) |
| `"Quenn"` | ✅ (1 Fehler) |
| `"Bohamian Rapsody"` | ✅ (2 Fehler) |
| `"Bdhmian"` | ❌ (zu weit entfernt) |

---

## Finale Koordinaten

### Echte Koordinaten
`N 50° 23.356 E 011° 55.427`

> ⚠️ Koordinaten niemals im Klartext im Code speichern!

### Verschlüsselung
```js
// SALT-Key: "JUKEBOX21" (Zahl = Lösungsschwelle)
const COORDS_ENCODED = btoa(
  unescape(encodeURIComponent(rot13("N 50° 23.356 E 011° 55.427") + "JUKEBOX21"))
);
// Bedingung: solvedCount >= 21
// Dekodierung: rot13(decodeURIComponent(escape(atob(COORDS_ENCODED)))).replace("JUKEBOX21", "")
```

### Anzeige-Effekt
- Goldenes Overlay erscheint wenn `State.getSolvedCount() >= 21`
- Text blendet mit CSS-Animation ein (Glow-Effekt)
- Kopier-Button für Koordinaten

---

## Internationalisierung (i18n.js)

### Struktur
```js
const i18n = {
  de: { title: "Projekt Jukebox", solved: "Gelöst!", ... },
  en: { title: "Project Jukebox", solved: "Solved!", ... }
};
```
- Toggle-Button oben rechts: `🇩🇪 DE | EN 🇬🇧`
- Alle UI-Texte via `data-i18n="key"` Attribut

---

## Spielfortschritt (state.js) – ⚠️ DEAKTIVIERT

> **Status: Code vorhanden, aber auskommentiert.**
> Aktivierung wenn Cache live geht: Kommentare entfernen.

```js
// DEAKTIVIERT:
// localStorage.setItem('jukebox_progress', JSON.stringify(solvedIds));
// const saved = JSON.parse(localStorage.getItem('jukebox_progress') || '[]');
```

---

## Sicherheitsübersicht

| Aspekt | Maßnahme |
|--------|----------|
| Song-Klartext im Code | ROT13 + Base64, nie direkt |
| GPS-Koordinaten | Base64 + ROT13 + Salt-Key |
| Song-Erkennung per App | MIDI-Wiedergabe (erkennbar – gewollt) |
| GitHub öffentliches Repo | Alle sensitiven Daten kodiert |
| MIDI-Dateien | Unveränderter Originalinhalt – nur lesender Zugriff |

---

## Wichtige Konventionen

- **Kein Klartext** von Songtiteln, Interpreten oder Koordinaten im Code
- **Lösungsschwelle:** `SOLVE_THRESHOLD = 21` (Konstante in ui.js)
- **Alle JS-Module** werden in `index.html` via `<script src="...">` eingebunden
- **Reihenfolge der Script-Tags:** `songs.js` → `i18n.js` → `audio.js` → `solver.js` → `state.js` → `ui.js`
- **CSS-Reihenfolge:** `jukebox.css` → `responsive.css`
- **Kein Framework** (Vanilla JS + CSS)
- **Google Fonts** einziger externer Dienst: `'Press Start 2P'`
- **MIDI-Dateien:** Liegen in `MIDI51/`, werden per `fetch()` geladen, nie modifiziert

---

## Song-Liste (Referenz) + MIDI-Mapping

> Alle 25 Songs – nur zur Referenz. Im Code ausschließlich über `enc()` verwenden!
> Mapping: Jeder Song ist einer konkreten Datei aus `MIDI51/` zugeordnet.

| # | Interpret | Titel | MIDI-Datei in MIDI51/ |
|---|-----------|-------|-----------------------|
| 1 | The Beatles | Let It Be | `A1.mid` |
| 2 | Fools Garden | Lemon Tree | `A2.mid` |
| 3 | Survivor | Eye of the Tiger | `A3.mid` |
| 4 | Deep Purple | Hallelujah | `A4.mid` |
| 5 | AC/DC | Highway to Hell | `A5.mid` |
| 6 | Guns N' Roses | November Rain | `B1.mid` |
| 7 | Queen | Bohemian Rhapsody | `B2.mid` |
| 8 | ABBA | Mamma Mia | `B3.mid` |
| 9 | Michael Jackson | Beat It | `B4.mid` |
| 10 | Nirvana | Smells Like Teen Spirit | `B5.mid` |
| 11 | John Denver | Take Me Home, Country Roads | `C1.mid` |
| 12 | Queen | We Are The Champions | `C2.mid` |
| 13 | Coolio | Gangsta's Paradise | `C3.mid` |
| 14 | Radiohead | Creep | `C4.mid` |
| 15 | Europe | The Final Countdown | `C5.mid` |
| 16 | Oasis | Wonderwall | `D1.mid` |
| 17 | Eagles | Hotel California | `D2.mid` |
| 18 | ABBA | Gimme! Gimme! Gimme! | `D3.mid` |
| 19 | The Cranberries | Zombie | `D4.mid` |
| 20 | Red Hot Chili Peppers | Californication | `D5.mid` |
| 21 | Van Halen | Jump | `E1.mid` |
| 22 | The Animals | House of the Rising Sun | `E2.mid` |
| 23 | Metallica | Nothing Else Matters | `E3.mid` |
| 24 | Guns N' Roses | Paradise City | `E4.mid` |
| 25 | The Scorpions | Wind of Change | `E5.mid` |

### Akzeptierte Antwort-Varianten (Beispiele)
| Song | Antwort-Varianten in answers[] |
|------|--------------------------------|
| 4  | "hallelujah", "deep purple" |
| 7  | "bohemian rhapsody", "queen" |
| 12 | "we are the champions", "queen", "champions" |
| 13 | "gangsta's paradise", "gangsta paradise", "coolio" |
| 22 | "house of the rising sun", "the animals", "animals" |
| 23 | "nothing else matters", "metallica" |
