# 🎵 Projekt Jukebox – 80s Music Mystery

Eine interaktive **80er-Jahre Jukebox Web-App** für ein Musik-Quiz & Geocaching-Mystery. 
Höre dir nostalgische Synthesizer-Melodien an, errate die bekannten Hits aus dem Kult-Jahrzehnt und schalte Schritt für Schritt Informationen frei!

---

## 🌟 Features

- **Retro 80s Jukebox Styling**: Authentisches Design mit Neon-LED-Leuchten, Wurlitzer-Gehäuse-Optik und Glasmorphismus-Effekten.
- **Integrierter Synth-MIDI Audio Player**: Wiedergabe echter MIDI-Melodien direkt im Browser über die Web Audio API – ohne externe Plugins oder schwere Audio-Dateien.
- **Fuzzy-Matching & Kulanz-Prüfung**: Intelligente Antwortüberprüfung mit Levenshtein-Distanz. Schreibfehler, Klein-/Großschreibung und fehlende Sonderzeichen werden tolerant gewertet.
- **Mehrsprachig (Deutsch / Englisch)**: Dynamischer Sprachwechsel für alle UI-Elemente und Feedback-Toasts.
- **Geocaching Rätsel-Modus**: Nach dem Lösen ausreichend vieler Titel öffnet sich ein spezielles Koordinaten-Overlay für das Finale.
- **Vollständig Responsive**: Optimiert für Desktops, Tablets und Smartphones mit Touch-Unterstützung.

---

## 🎮 Anleitung für Spieler

1. **Wähle ein Lied**: Klicke auf eine Taste des Jukebox-Rasters (z. B. **A1**, **B3**).
2. **Lausche der Melodie**: Der integrierte Synthesizer spielt das MIDI-Arrangement des Titels ab.
3. **Gib deinen Tipp ein**: Trage den Songtitel oder den Interpreten in das Eingabefeld ein.
4. **Erfolge freischalten**: Bei richtiger Antwort wird der Songtitel auf dem Beschriftungsfeld sichtbar.
5. **Koordinaten freischalten**: Sobald genügend Lieder erfolgreich gelöst wurden, erscheint das finale Koordinaten-Overlay!

---

## 🚀 Hosting auf GitHub Pages

Die Anwendung besteht aus reinen Client-Side Webtechnologien (HTML5, CSS3, Vanilla JavaScript) und lässt sich unkompliziert und kostenlos über **GitHub Pages** bereitstellen.

### Schritt-für-Schritt Einrichtung

1. **Repository auf GitHub hochladen**:
   Push dein lokales Git-Repository zu GitHub.
   ```bash
   git remote add origin https://github.com/<dein-benutzername>/jukeBox.git
   git branch -M main
   git push -u origin main
   ```

2. **GitHub Pages aktivieren**:
   - Navigation in GitHub zum Menüpunkt **Settings** (Einstellungen) deines Repositories.
   - Wähle in der linken Seitenleiste den Punkt **Pages** aus.
   - Unter **Build and deployment** -> **Source** wähle **Deploy from a branch**.
   - Wähle als **Branch** `main` und als Ordner `/ (root)`.
   - Klicke auf **Save**.

3. **App aufrufen**:
   Nach 1–2 Minuten ist deine Jukebox live erreichbar unter:
   `https://<dein-benutzername>.github.io/jukeBox/`

---

## 🛠️ Technische Struktur

```
jukeBox/
├── index.html           # Hauptseite mit Jukebox-Aufbau & DOM-Struktur
├── README.md            # Dokumentation & Anleitung
├── css/
│   ├── jukebox.css      # Retro 80er Design, Button-Styling & Neon-Animationen
│   └── responsive.css   # Breakpoints & Layout-Anpassungen für Mobilgeräte
├── js/
│   ├── songs.js         # Verschlüsselte Song-Datenbank (Base64 + ROT13)
│   ├── i18n.js          # Übersetzungen (DE/EN) & Sprachwechsel
│   ├── audio.js         # Web Audio API Synth- & Binary MIDI-Parser Engine
│   ├── solver.js        # String-Normalisierung, Levenshtein & Antwortprüfung
│   ├── state.js         # Fortschritts-Verwaltung der gelösten Songs
│   └── ui.js            # DOM-Manipulation, Modal-Steuerung & Overlay Logic
└── MIDI51/              # Synthesizer MIDI-Audio-Dateien (25 Songs)
```

---

## 🔐 Hinweisse für Autoren & Geocacher

- Alle Song-Metadaten und Zielkoordinaten sind im Quellcode **Base64 + ROT13-verschlüsselt** hinterlegt, damit Spieler nicht einfach im Quelltext nach der Lösung suchen können.
- Für das Abspielen der Audio-Dateien im Browser muss die Seite über einen Webserver (z. B. GitHub Pages oder `python3 -m http.server`) aufgerufen werden (wegen Browser CORS-Sicherheitsrichtlinien bei lokalen `file://`-Aufrufen).

---

## 📜 Lizenz & Credits

Erstellt für Geocaching-Enthusiasten und Musikliebhaber der 80er Jahre.  
Viel Spaß beim Raten und Suchen! 📻✨
