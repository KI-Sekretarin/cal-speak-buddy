#!/bin/bash

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎙️  Starte Whisper Transcription Server${NC}"
echo ""

# Wechsle ins Whisper-Server Verzeichnis
cd "$(dirname "$0")"

# Prüfe ob Virtual Environment existiert
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual Environment nicht gefunden. Erstelle...${NC}"
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual Environment erstellt${NC}"
fi

# Aktiviere Virtual Environment
echo -e "${BLUE}Aktiviere Virtual Environment...${NC}"
source .venv/bin/activate

# Installiere Dependencies falls nötig
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Dependencies nicht gefunden. Installiere...${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installiert${NC}"
fi

# Setze Umgebungsvariablen für optimale Performance
export WHISPER_MODEL=base  # base ist schneller als small, aber immer noch gut
export WHISPER_DEVICE=cpu
export WHISPER_COMPUTE_TYPE=int8

echo ""
echo -e "${GREEN}✓ Whisper-Server wird gestartet...${NC}"
echo -e "${BLUE}  Model: ${WHISPER_MODEL}${NC}"
echo -e "${BLUE}  Device: ${WHISPER_DEVICE}${NC}"
echo -e "${BLUE}  Port: 9000${NC}"
echo ""
echo -e "${YELLOW}Drücke Ctrl+C zum Beenden${NC}"
echo ""

# Starte Server
uvicorn server:app --host 0.0.0.0 --port 9000 --reload
