#!/usr/bin/env bash

# Projekt Jukebox – Startskript für den lokalen Webserver
# Findet automatisch einen freien Port (startend bei 8080)

# Immer aus dem Verzeichnis dieses Skripts heraus starten
cd "$(dirname "$0")" || exit 1

PORT=8080

while lsof -i :$PORT >/dev/null 2>&1 || nc -z localhost $PORT >/dev/null 2>&1; do
    echo "Port $PORT ist bereits belegt, versuche Port $((PORT+1))..."
    PORT=$((PORT+1))
done

URL="http://localhost:$PORT"

echo ""
echo "======================================================="
echo "  🎵 PROJEKT JUKEBOX – LOKALER WEBSERVER GESTARTET 🎵"
echo "======================================================="
echo ""
echo "  Öffne im Browser:  $URL"
echo ""
echo "  Zum Beenden:  Drücke Strg + C"
echo "======================================================="
echo ""

# Versuche den Browser automatisch zu öffnen
if command -v xdg-open >/dev/null 2>&1; then
    (sleep 1 && xdg-open "$URL") &
elif command -v open >/dev/null 2>&1; then
    (sleep 1 && open "$URL") &
fi

# Webserver starten
exec python3 -m http.server "$PORT"
