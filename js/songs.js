// songs.js
// Song-Daten (Base64+ROT13 kodiert) + MIDI-Mapping (25 Songs)
// Format pro Song: { id, display: { title, artist }, answers: [], midiFile: "MIDI51/..." }
// Kodierungs-Pipeline: ROT13 → encodeURIComponent → unescape → btoa (= Base64)
// Dekodierung zur Laufzeit: rot13(decodeURIComponent(escape(atob(encoded))))

// ---------------------------------------------------------------------------
// 1. ROT13-Hilfsfunktion
//    Rotiert nur ASCII a–z / A–Z; Umlaute und alle anderen Zeichen bleiben.
// ---------------------------------------------------------------------------
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c >= 'a' && c <= 'z' ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// ---------------------------------------------------------------------------
// 2. Encode- & Decode-Hilfsfunktionen
//    enc(str) → Base64( ROT13( trim(str) ) )
//    dec(str) → ROT13( decodeURIComponent( escape( atob(str) ) ) )
// ---------------------------------------------------------------------------
function enc(str) {
  return btoa(unescape(encodeURIComponent(rot13(str.trim()))));
}

function dec(str) {
  return rot13(decodeURIComponent(escape(atob(str))));
}

// ---------------------------------------------------------------------------
// 3. Song-Array (MIDI-Mapping) – 25 Songs
//    HINWEIS: melody / melodyIndex entfallen vollständig.
//    Jeder Song enthält midiFile mit dem relativen Pfad zur MIDI-Datei.
//    ALLE Strings sind via enc() vorverschlüsselt (ROT13 + Base64). Kein Klartext!
// ---------------------------------------------------------------------------
const SONGS = [

  // Song 1 (A1)
  { id: 1, display: { title: 'WXJnIFZnIE9y', artist: 'R3VyIE9ybmd5cmY=' },
    answers: [ 'eXJnIHZnIG9y', 'Z3VyIG9ybmd5cmY=', 'b3JuZ3lyZg==' ],
    midiFile: 'MIDI51/A1.mid' },

  // Song 2 (A2)
  { id: 2, display: { title: 'WXJ6YmEgR2Vycg==', artist: 'U2JieWYgVG5lcXJh' },
    answers: [ 'eXJ6YmEgZ2Vycg==', 'c2JieWYgdG5lcXJh' ],
    midiFile: 'MIDI51/A2.mid' },

  // Song 3 (A3)
  { id: 3, display: { title: 'UmxyIGJzIGd1ciBHdnRyZQ==', artist: 'RmhlaXZpYmU=' },
    answers: [ 'cmxyIGJzIGd1ciBndnRyZQ==', 'ZmhlaXZpYmU=' ],
    midiFile: 'MIDI51/A3.mid' },

  // Song 4 (A4)
  { id: 4, display: { title: 'VW55eXJ5aHdudQ==', artist: 'UXJyYyBDaGVjeXI=' },
    answers: [ 'dW55eXJ5aHdudQ==', 'cXJyYyBjaGVjeXI=' ],
    midiFile: 'MIDI51/A4.mid' },

  // Song 5 (A5)
  { id: 5, display: { title: 'VXZ0dWpubCBnYiBVcnl5', artist: 'TlAvUVA=' },
    answers: [ 'dXZ0dWpubCBnYiB1cnl5', 'bnBxcA==', 'bnAgcXA=', 'bnAvcXA=' ],
    midiFile: 'MIDI51/A5.mid' },

  // Song 6 (B1)
  { id: 6, display: { title: 'QWJpcnpvcmUgRW52YQ==', artist: 'VGhhZiBBJyBFYmZyZg==' },
    answers: [ 'YWJpcnpvcmUgZW52YQ==', 'dGhhZiBhIGViZnJm', 'dGhhZiBuYXEgZWJmcmY=' ],
    midiFile: 'MIDI51/B1.mid' },

  // Song 7 (B2)
  { id: 7, display: { title: 'T2J1cnp2bmEgRXVuY2ZicWw=', artist: 'RGhycmE=' },
    answers: [ 'b2J1cnp2bmEgZXVuY2ZicWw=', 'ZGhycmE=' ],
    midiFile: 'MIDI51/B2.mid' },

  // Song 8 (B3)
  { id: 8, display: { title: 'Wm56em4gWnZu', artist: 'Tk9PTg==' },
    answers: [ 'em56em4genZu', 'bm9vbg==' ],
    midiFile: 'MIDI51/B3.mid' },

  // Song 9 (B4)
  { id: 9, display: { title: 'T3JuZyBWZw==', artist: 'WnZwdW5yeSBXbnB4ZmJh' },
    answers: [ 'b3JuZyB2Zw==', 'enZwdW5yeSB3bnB4ZmJh', 'd25weGZiYQ==' ],
    midiFile: 'MIDI51/B4.mid' },

  // Song 10 (B5)
  { id: 10, display: { title: 'RnpyeXlmIFl2eHIgR3JyYSBGY3Zldmc=', artist: 'QXZlaW5hbg==' },
    answers: [ 'ZnpyeXlmIHl2eHIgZ3JyYSBmY3Zldmc=', 'YXZlaW5hbg==' ],
    midiFile: 'MIDI51/B5.mid' },

  // Song 11 (C1)
  { id: 11, display: { title: 'R254ciBaciBVYnpyLCBQYmhhZ2VsIEVibnFm', artist: 'V2J1YSBRcmFpcmU=' },
    answers: [ 'Z254ciB6ciB1YnpyIHBiaGFnZWwgZWJucWY=', 'cGJoYWdlbCBlYm5xZg==', 'd2J1YSBxcmFpcmU=' ],
    midiFile: 'MIDI51/C1.mid' },

  // Song 12 (C2)
  { id: 12, display: { title: 'SnIgTmVyIEd1ciBQdW56Y3ZiYWY=', artist: 'RGhycmE=' },
    answers: [ 'anIgbmVyIGd1ciBwdW56Y3ZiYWY=', 'ZGhycmE=', 'cHVuemN2YmFm' ],
    midiFile: 'MIDI51/C2.mid' },

  // Song 13 (C3)
  { id: 13, display: { title: 'VG5hdGZnbidmIENuZW5xdmZy', artist: 'UGJieXZi' },
    answers: [ 'dG5hdGZnbidmIGNuZW5xdmZy', 'dG5hdGZnbiBjbmVucXZmcg==', 'cGJieXZi' ],
    midiFile: 'MIDI51/C3.mid' },

  // Song 14 (C4)
  { id: 14, display: { title: 'UGVycmM=', artist: 'RW5xdmJ1cm5x' },
    answers: [ 'cGVycmM=', 'ZW5xdmJ1cm5x' ],
    midiFile: 'MIDI51/C4.mid' },

  // Song 15 (C5)
  { id: 15, display: { title: 'R3VyIFN2YW55IFBiaGFncWJqYQ==', artist: 'UmhlYmNy' },
    answers: [ 'Z3VyIHN2YW55IHBiaGFncWJqYQ==', 'c3ZhbnkgcGJoYWdxYmph', 'cmhlYmNy' ],
    midiFile: 'MIDI51/C5.mid' },

  // Song 16 (D1)
  { id: 16, display: { title: 'SmJhcXJlam55eQ==', artist: 'Qm5mdmY=' },
    answers: [ 'amJhcXJlam55eQ==', 'Ym5mdmY=' ],
    midiFile: 'MIDI51/D1.mid' },

  // Song 17 (D2)
  { id: 17, display: { title: 'VWJncnkgUG55dnNiZWF2bg==', artist: 'Um50eXJm' },
    answers: [ 'dWJncnkgcG55dnNiZWF2bg==', 'cm50eXJm' ],
    midiFile: 'MIDI51/D2.mid' },

  // Song 18 (D3)
  { id: 18, display: { title: 'VHZ6enIhIFR2enpyISBUdnp6ciE=', artist: 'Tk9PTg==' },
    answers: [ 'dHZ6enIgdHZ6enIgdHZ6enI=', 'dHZ6enI=', 'bm9vbg==' ],
    midiFile: 'MIDI51/D3.mid' },

  // Song 19 (D4)
  { id: 19, display: { title: 'TWJ6b3Zy', artist: 'R3VyIFBlbmFvcmVldnJm' },
    answers: [ 'bWJ6b3Zy', 'Z3VyIHBlbmFvcmVldnJm', 'cGVuYW9yZWV2cmY=' ],
    midiFile: 'MIDI51/D4.mid' },

  // Song 20 (D5)
  { id: 20, display: { title: 'UG55dnNiZWF2cG5ndmJh', artist: 'RXJxIFViZyBQdXZ5diBDcmNjcmVm' },
    answers: [ 'cG55dnNiZWF2cG5ndmJh', 'ZXJxIHViZyBwdXZ5diBjcmNjcmVm', 'ZXVwYw==', 'cHV2eXYgY3JjY3JlZg==' ],
    midiFile: 'MIDI51/D5.mid' },

  // Song 21 (E1)
  { id: 21, display: { title: 'V2h6Yw==', artist: 'SW5hIFVueXJh' },
    answers: [ 'd2h6Yw==', 'aW5hIHVueXJh' ],
    midiFile: 'MIDI51/E1.mid' },

  // Song 22 (E2)
  { id: 22, display: { title: 'VWJoZnIgYnMgZ3VyIEV2ZnZhdCBGaGE=', artist: 'R3VyIE5hdnpueWY=' },
    answers: [ 'dWJoZnIgYnMgZ3VyIGV2ZnZhdCBmaGE=', 'Z3VyIG5hdnpueWY=', 'bmF2em55Zg==' ],
    midiFile: 'MIDI51/E2.mid' },

  // Song 23 (E3)
  { id: 23, display: { title: 'QWJndXZhdCBSeWZyIFpuZ2dyZWY=', artist: 'WnJnbnl5dnBu' },
    answers: [ 'YWJndXZhdCByeWZyIHpuZ2dyZWY=', 'enJnbnl5dnBu' ],
    midiFile: 'MIDI51/E3.mid' },

  // Song 24 (E4)
  { id: 24, display: { title: 'Q25lbnF2ZnIgUHZnbA==', artist: 'VGhhZiBBJyBFYmZyZg==' },
    answers: [ 'Y25lbnF2ZnIgcHZnbA==', 'dGhhZiBhIGViZnJm', 'dGhhZiBuYXEgZWJmcmY=' ],
    midiFile: 'MIDI51/E4.mid' },

  // Song 25 (E5)
  { id: 25, display: { title: 'SnZhcSBicyBQdW5hdHI=', artist: 'R3VyIEZwYmVjdmJhZg==' },
    answers: [ 'anZhcSBicyBwdW5hdHI=', 'Z3VyIGZwYmVjdmJhZg==', 'ZnBiZWN2YmFm' ],
    midiFile: 'MIDI51/E5.mid' },

];

// ---------------------------------------------------------------------------
// 4. Export auf window (Vanilla JS, kein Modul-System)
//    Reihenfolge: songs.js → i18n.js → audio.js → solver.js → state.js → ui.js
// ---------------------------------------------------------------------------
window.SONGS  = SONGS;
window.rot13  = rot13;
window.enc    = enc;
window.dec    = dec;
