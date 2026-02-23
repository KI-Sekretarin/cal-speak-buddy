# 🎙️ Lokale Whisper-Transkription

Dieser Service transkribiert Audio **lokal und schnell** mit [faster-whisper](https://github.com/SYSTRAN/faster-whisper) - ohne Cloud, ohne n8n!

## ⚡ Schnellstart

```bash
cd services/whisper-server
./start.sh
```

Das war's! Der Server läuft jetzt auf `http://localhost:9000` 🚀

## 📋 Was passiert beim Start?

Das `start.sh` Script macht automatisch:
1. ✅ Erstellt Python Virtual Environment (falls nicht vorhanden)
2. ✅ Installiert alle Dependencies
3. ✅ Lädt das Whisper-Model (beim ersten Mal ~150MB Download)
4. ✅ Startet den Server auf Port 9000

## 🎯 Verwendung

### Mit dem Frontend

1. **Whisper-Server starten** (in einem Terminal):
   ```bash
   cd services/whisper-server
   ./start.sh
   ```

2. **Frontend starten** (in einem anderen Terminal):
   ```bash
   npm run dev
   ```

3. **Audio aufnehmen** → Automatische Transkription → Bestätigen ✨

### API-Endpunkte

#### POST `/transcribe-file` (empfohlen - schneller)
```bash
curl -X POST http://localhost:9000/transcribe-file \
  -F "file=@recording.wav" \
  -F "language=de"
```

Response:
```json
{
  "text": "Hallo, das ist ein Test",
  "language": "de",
  "duration": 2.5
}
```

#### POST `/transcribe` (Base64)
```bash
curl -X POST http://localhost:9000/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "<base64-string>",
    "language": "de"
  }'
```

#### GET `/healthz`
```bash
curl http://localhost:9000/healthz
```

## ⚙️ Konfiguration

Umgebungsvariablen in `start.sh` anpassen:

```bash
export WHISPER_MODEL=base      # tiny, base, small, medium, large-v3
export WHISPER_DEVICE=cpu      # oder "cuda" für GPU
export WHISPER_COMPUTE_TYPE=int8  # oder "fp16" bei GPU
```

### Model-Größen (Geschwindigkeit vs. Genauigkeit)

| Model | Größe | Geschwindigkeit | Genauigkeit | Empfohlen für |
|-------|-------|-----------------|-------------|---------------|
| `tiny` | ~75 MB | ⚡⚡⚡⚡⚡ | ⭐⭐ | Sehr schnelle Tests |
| `base` | ~150 MB | ⚡⚡⚡⚡ | ⭐⭐⭐ | **Standard (empfohlen)** |
| `small` | ~500 MB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Bessere Qualität |
| `medium` | ~1.5 GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Beste Qualität (CPU) |
| `large-v3` | ~3 GB | ⚡ | ⭐⭐⭐⭐⭐ | Beste Qualität (GPU empfohlen) |

**Tipp**: `base` ist der beste Kompromiss für lokale CPU-Transkription! 🎯

## 🚀 Performance-Tipps

### Für maximale Geschwindigkeit:
- Model: `tiny` oder `base`
- `beam_size=1` (bereits gesetzt)
- `vad_filter=True` (bereits gesetzt - filtert Stille)

### Für beste Qualität:
- Model: `small` oder `medium`
- GPU verwenden (CUDA)

### Typische Transkriptionszeiten (CPU):

| Audio-Länge | Model `base` | Model `small` |
|-------------|--------------|---------------|
| 5 Sekunden | ~1-2s | ~2-3s |
| 30 Sekunden | ~3-5s | ~8-12s |
| 1 Minute | ~6-10s | ~15-25s |

## 🔧 Manuelle Installation

Falls du das Script nicht verwenden möchtest:

```bash
cd services/whisper-server

# Virtual Environment erstellen
python3 -m venv .venv
source .venv/bin/activate

# Dependencies installieren
pip install -r requirements.txt

# Server starten
export WHISPER_MODEL=base
uvicorn server:app --host 0.0.0.0 --port 9000 --reload
```

## 🐛 Troubleshooting

### "Port 9000 already in use"
```bash
# Finde den Prozess
lsof -i :9000

# Beende ihn
kill -9 <PID>
```

### "Module 'faster_whisper' not found"
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### Transkription ist zu langsam
- Verwende kleineres Model (`tiny` oder `base`)
- Prüfe ob andere Programme die CPU belasten
- Erwäge GPU-Nutzung für größere Models

### Frontend kann Server nicht erreichen
- Prüfe ob Server läuft: `curl http://localhost:9000/healthz`
- Prüfe Browser-Console auf CORS-Fehler
- Stelle sicher dass beide (Frontend + Server) laufen

## 📦 Docker (optional)

```bash
docker build -t whisper-server .
docker run --rm -p 9000:9000 -e WHISPER_MODEL=base whisper-server
```

## 🎉 Vorteile gegenüber Cloud-Lösungen (OpenAI Whisper API, etc.)

✅ **Schneller**: Keine Netzwerk-Latenz, lokale Verarbeitung  
✅ **Privat**: Audio verlässt nie deinen Computer  
✅ **Offline**: Funktioniert ohne Internet  
✅ **Kostenlos**: Keine API-Kosten  
✅ **Zuverlässig**: Keine Server-Ausfälle  

---

**Made with ❤️ using Whisper AI**
