// solver.js
// Antwort-Validierung: Normalisierung + Levenshtein-Fuzzy-Matching
// Schwellenwert: Math.max(1, Math.min(3, Math.floor(target.length / 5)))
// Dekodierung zur Laufzeit: rot13(atob(encoded))

'use strict';

// ---------------------------------------------------------------------------
// 1. Normalisierung
// ---------------------------------------------------------------------------

/**
 * Normalisiert einen String für den Vergleich:
 *  - lowercase + trim
 *  - Umlaute: ä→ae, ö→oe, ü→ue, ß→ss
 *  - Alle nicht-alphanumerischen Zeichen (außer Leerzeichen) entfernen
 *  - Mehrfache Leerzeichen zu einem zusammenfassen
 *
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/ +/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// 2. Levenshtein-Distanz
// ---------------------------------------------------------------------------

/**
 * Berechnet die Levenshtein-Distanz zwischen zwei Strings (Standard 2D-Matrix).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} Integer >= 0
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;

  // Trivialfälle
  if (m === 0) return n;
  if (n === 0) return m;

  // Matrix initialisieren (m+1 Zeilen x n+1 Spalten)
  const dp = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1).fill(0);
    dp[i][0] = i; // Löschen aus a
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j; // Einfügen in a
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // keine Operation nötig
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Löschen
          dp[i][j - 1],     // Einfügen
          dp[i - 1][j - 1]  // Ersetzen
        );
      }
    }
  }

  return dp[m][n];
}

// ---------------------------------------------------------------------------
// 3. Fuzzy-Match
// ---------------------------------------------------------------------------

/**
 * Prüft ob input "nah genug" an target liegt.
 * Schwellenwert: Math.max(1, Math.min(3, Math.floor(target.length / 5)))
 *
 * @param {string} input   - rohe Benutzereingabe
 * @param {string} target  - Referenzstring (roh oder bereits normalisiert)
 * @returns {boolean}
 */
function fuzzyMatch(input, target) {
  const normInput  = normalize(input);
  const normTarget = normalize(target);
  const threshold  = Math.max(1, Math.min(3, Math.floor(normTarget.length / 5)));
  return levenshtein(normInput, normTarget) <= threshold;
}

// ---------------------------------------------------------------------------
// 4. Song-Validierung
// ---------------------------------------------------------------------------

/**
 * ROT13-Hilfsfunktion (intern).
 *
 * @param {string} s
 * @returns {string}
 */
function _rot13(s) {
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c >= 'a' && c <= 'z' ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/**
 * Validiert die Benutzereingabe gegen alle akzeptierten Antworten eines Songs.
 *
 * Jeder Eintrag in song.answers[] ist Base64+ROT13 kodiert:
 *   Klartext = dec(encoded)
 *
 * @param {{ answers: string[] }} song  - Song-Objekt aus SONGS[]
 * @param {string}                userInput - rohe Benutzereingabe
 * @returns {{ correct: boolean, matchedWith: string|null }}
 */
function checkAnswer(song, userInput) {
  const normInput = normalize(userInput);
  if (!normInput) return { correct: false, matchedWith: null };

  const targets = [];

  // 1. Dekodieren aller expliziten Antworten in song.answers
  if (Array.isArray(song.answers)) {
    for (const encoded of song.answers) {
      const decoded = (window.dec ? window.dec(encoded) : _rot13(atob(encoded))).toLowerCase();
      if (decoded && !targets.includes(decoded)) {
        targets.push(decoded);
      }
    }
  }

  // 2. Dekodierte Titel- und Interpret-Strings ermitteln (falls vorhanden)
  let titleDec = '';
  let artistDec = '';

  if (song.display) {
    if (song.display.title) {
      titleDec = (window.dec ? window.dec(song.display.title) : _rot13(atob(song.display.title))).toLowerCase();
    }
    if (song.display.artist) {
      artistDec = (window.dec ? window.dec(song.display.artist) : _rot13(atob(song.display.artist))).toLowerCase();
    }
  }

  if (titleDec && !targets.includes(titleDec)) targets.push(titleDec);
  if (artistDec && !targets.includes(artistDec)) targets.push(artistDec);

  // 3. Kombinierte Antworten (Titel + Interpret & Interpret + Titel)
  if (titleDec && artistDec) {
    const titleArtist = titleDec + ' ' + artistDec;
    const artistTitle = artistDec + ' ' + titleDec;
    if (!targets.includes(titleArtist)) targets.push(titleArtist);
    if (!targets.includes(artistTitle)) targets.push(artistTitle);
  }

  // 4. Gegen alle Kandidaten mit Fuzzy-Matching prüfen
  for (const target of targets) {
    if (fuzzyMatch(normInput, target)) {
      return { correct: true, matchedWith: target };
    }
  }

  return { correct: false, matchedWith: null };
}

// ---------------------------------------------------------------------------
// 5. Export
// ---------------------------------------------------------------------------

window.Solver = { checkAnswer, normalize, fuzzyMatch, levenshtein };
