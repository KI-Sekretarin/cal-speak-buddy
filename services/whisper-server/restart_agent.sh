#!/bin/bash
echo "🛑 Stoppe alten Server auf Port 9000..."
# Finde PID auf Port 9000 und kille sie
lsof -ti:9000 | xargs kill -9 2>/dev/null || true

echo "📦 Installiere Dependencies..."
source .venv/bin/activate
pip install -r requirements.txt

echo "🚀 Starte AI Calendar Agent..."
python3 server.py
