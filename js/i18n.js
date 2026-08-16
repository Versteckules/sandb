// i18n.js
// Übersetzungen DE/EN, Sprachumschalt-Logik, data-i18n Attribut-Binding
// Toggle-Button: 🇩🇪 DE | EN 🇬🇧
// Reihenfolge im HTML: songs.js → i18n.js → audio.js → solver.js → state.js → ui.js

'use strict';

// ---------------------------------------------------------------------------
// Übersetzungs-Tabelle
// ---------------------------------------------------------------------------

const I18N = {
  de: {
    // Header
    title:                     'PROJEKT JUKEBOX',
    'lang-toggle':             '🇬🇧 EN',

    // Fortschrittsanzeige
    'progress-separator':      ' / ',
    'progress-label':          ' gelöst',
    'solve-hint':              '21 zum Lösen',

    // Modal – Eingabe-Dialog
    'modal-title':             'Song #',
    'modal-input-label':       'Titel oder Interpret eingeben',
    'modal-input-placeholder': 'Titel oder Interpret eingeben…',
    'modal-submit':            'Bestätigen',
    'modal-close':             'Schließen',

    // Koordinaten-Overlay
    'coords-title':            '🏆 Gerätschaft gefunden! 21/25 Songs erkannt!',
    'coords-subtitle':         'Die Koordinaten des Caches:',
    'coords-copy':             'Koordinaten kopieren',
    'coords-close':            'Schließen',

    // Song-Etikett (dynamisch gesetzt via ui.js, hier als Referenz)
    song_solved_badge:         '✅ Gelöst',
    song_unsolved_hint:        '???',

    // Toast-Meldungen (dynamisch via ui.js)
    toast_correct:             '🎵 Richtig gelöst!',
    toast_wrong:               "❌ Leider falsch. Versuch's nochmal!",
    toast_already_solved:      '✅ Bereits gelöst!',
    toast_copied:              '📋 Koordinaten kopiert!',
    toast_file_error:          '⚠️ Bitte Seite über Webserver (http://) öffnen!',
    toast_audio_error:         '⚠️ Fehler beim Laden der MIDI-Datei!',

    // Komfort-Aliase mit Unterstrich (für programmatischen Zugriff via ui.js)
    header_title:              'PROJEKT JUKEBOX',
    lang_toggle:               '🇬🇧 EN',
    progress_label:            ' gelöst',
    progress_unit:             'Songs',
    modal_title_prefix:        'Song #',
    modal_input_placeholder:   'Titel oder Interpret eingeben…',
    modal_submit:              'Bestätigen',
    modal_close:               'Schließen',
    coords_title:              '🏆 Gerätschaft gefunden! 21/25 Songs erkannt!',
    coords_subtitle:           'Die Koordinaten des Caches:',
    coords_copy_btn:           'Koordinaten kopieren',
    footer_text:               '🎸 Projekt Jukebox · Geocaching-Rätsel · Kein Framework · Vanilla JS',
  },

  en: {
    // Header
    title:                     'PROJECT JUKEBOX',
    'lang-toggle':             '🇩🇪 DE',

    // Fortschrittsanzeige
    'progress-separator':      ' / ',
    'progress-label':          ' solved',
    'solve-hint':              '21 to unlock',

    // Modal – Eingabe-Dialog
    'modal-title':             'Song #',
    'modal-input-label':       'Enter title or artist',
    'modal-input-placeholder': 'Enter title or artist…',
    'modal-submit':            'Confirm',
    'modal-close':             'Close',

    // Koordinaten-Overlay
    'coords-title':            '🏆 Device found! 21/25 songs identified!',
    'coords-subtitle':         'The coordinates of the cache:',
    'coords-copy':             'Copy coordinates',
    'coords-close':            'Close',

    // Song-Etikett (dynamisch gesetzt via ui.js, hier als Referenz)
    song_solved_badge:         '✅ Solved',
    song_unsolved_hint:        '???',

    // Toast-Meldungen (dynamisch via ui.js)
    toast_correct:             '🎵 Correct!',
    toast_wrong:               '❌ Wrong answer. Try again!',
    toast_already_solved:      '✅ Already solved!',
    toast_copied:              '📋 Coordinates copied!',
    toast_file_error:          '⚠️ Please open page via web server (http://)!',
    toast_audio_error:         '⚠️ Error loading MIDI file!',

    // Komfort-Aliase mit Unterstrich (für programmatischen Zugriff via ui.js)
    header_title:              'PROJECT JUKEBOX',
    lang_toggle:               '🇩🇪 DE',
    progress_label:            'solved',
    progress_unit:             'Songs',
    modal_title_prefix:        'Song #',
    modal_input_placeholder:   'Enter title or artist…',
    modal_submit:              'Confirm',
    modal_close:               'Close',
    coords_title:              '🏆 Device found! 21/25 songs identified!',
    coords_subtitle:           'The coordinates of the cache:',
    coords_copy_btn:           'Copy coordinates',
    footer_text:               '🎸 Project Jukebox · Geocaching Puzzle · No Framework · Vanilla JS',
  },
};

// ---------------------------------------------------------------------------
// Sprache setzen – bindet alle [data-i18n] und [data-i18n-placeholder] Elemente
// ---------------------------------------------------------------------------

/**
 * Setzt die aktive Sprache der gesamten UI.
 *
 * @param {string} lang - Sprachcode, z. B. 'de' oder 'en'
 */
function setLanguage(lang) {
  // Fallback auf Deutsch falls unbekannte Sprache übergeben wird
  if (!I18N[lang]) {
    console.warn('[i18n] Unbekannte Sprache "' + lang + '", Fallback auf "de".');
    lang = 'de';
  }

  window.currentLang = lang;
  const dict = I18N[lang];

  // 1) Alle Elemente mit data-i18n-Attribut befüllen
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key = el.getAttribute('data-i18n');
    if (!(key in dict)) {
      console.warn('[i18n] Fehlender Key "' + key + '" für Sprache "' + lang + '".');
      return;
    }

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      // Eingabefelder: placeholder setzen
      el.placeholder = dict[key];
    } else {
      // Sonderfall modal-title: enthält Kinder-<span>, nur Text-Node aktualisieren
      if (key === 'modal-title') {
        const firstTextNode = Array.from(el.childNodes)
          .find(function (n) { return n.nodeType === Node.TEXT_NODE; });
        if (firstTextNode) {
          firstTextNode.textContent = dict[key];
        } else {
          el.insertBefore(document.createTextNode(dict[key]), el.firstChild);
        }
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // 2) Alle Elemente mit data-i18n-placeholder (primär <input>-Elemente)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key in dict) {
      el.placeholder = dict[key];
    } else {
      console.warn('[i18n] Fehlender Placeholder-Key "' + key + '" für Sprache "' + lang + '".');
    }
  });

  // 3) <html lang="…"> Attribut aktualisieren (SEO + Accessibility)
  document.documentElement.setAttribute('lang', lang);

  // 4) Wahl in localStorage persistieren
  try {
    localStorage.setItem('jukebox_lang', lang);
  } catch (e) {
    // localStorage kann in manchen Browsern/Privacy-Modi gesperrt sein
    console.warn('[i18n] localStorage nicht verfügbar:', e);
  }
}

// ---------------------------------------------------------------------------
// Initialisierung – gespeicherte Sprache laden & Toggle-Button verdrahten
// ---------------------------------------------------------------------------

/**
 * Initialisiert das i18n-System:
 *  - Liest die zuletzt gewählte Sprache aus localStorage (Fallback: 'de')
 *  - Setzt die Sprache für die gesamte UI
 *  - Registriert den Click-Listener auf dem #lang-toggle Button
 */
function initI18N() {
  let savedLang = 'de';
  try {
    const stored = localStorage.getItem('jukebox_lang');
    if (stored && I18N[stored]) {
      savedLang = stored;
    }
  } catch (e) {
    // localStorage nicht verfügbar – Fallback auf 'de'
  }

  setLanguage(savedLang);

  // Toggle-Button: wechselt zwischen 'de' und 'en'
  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const newLang = window.currentLang === 'de' ? 'en' : 'de';
      setLanguage(newLang);
    });
  } else {
    console.warn('[i18n] #lang-toggle Button nicht gefunden.');
  }
}

// ---------------------------------------------------------------------------
// Exports (globale API für andere Module)
// ---------------------------------------------------------------------------

window.I18N        = I18N;
window.setLanguage = setLanguage;

// Auto-Init beim Laden des Skripts
initI18N();
