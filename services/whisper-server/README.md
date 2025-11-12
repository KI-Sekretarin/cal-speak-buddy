# Whisper Server

Dieser kleine Dienst stellt eine HTTP-API zur Verfügung, die Audio (als Base64-kodierte `webm`-Datei) mit [faster-whisper](https://github.com/SYSTRAN/faster-whisper) transkribiert. Die Supabase Edge Function kann anschließend statt der OpenAI-API diesen Dienst ansprechen.

## Voraussetzungen

- Python 3.10 oder neuer
- Optional: CUDA-fähige GPU (empfohlen). Per Default läuft das Modell auf der CPU.

## Installation

```bash
cd services/whisper-server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Starten

```bash
# CPU-Betrieb, kompaktes Modell
export WHISPER_MODEL=small  # tiny, base, small, medium, large-v2 ...
export WHISPER_DEVICE=cpu    # oder "cuda"
export WHISPER_COMPUTE_TYPE=int8  # bei GPU z.B. fp16

uvicorn server:app --host 0.0.0.0 --port 9000
```

Der Service lauscht anschließend unter `http://localhost:9000/transcribe` und akzeptiert JSON-POSTs:

```json
{
  "audio": "<base64 string>",
  "language": "de",
  "task": "transcribe"
}
```

Antwort:

```json
{
  "text": "…",
  "language": "de",
  "duration": 5.94
}
```

## Docker (optional)

```bash
docker build -t whisper-server .
docker run --rm -p 9000:9000 -e WHISPER_MODEL=small whisper-server
```

## Integration in Supabase

1. Setze das Secret `WHISPER_SERVER_URL`, z. B. `http://localhost:9000` oder die URL deines Deployments:
   ```bash
   supabase secrets set WHISPER_SERVER_URL=http://localhost:9000
   ```
2. Deploye die `speech-to-text` Function neu:
   ```bash
   supabase functions deploy speech-to-text
   ```
3. Backend/Frontend weiter verwenden wie bisher.

> Tipp: Für produktive Nutzung empfiehlt sich eine Maschine mit GPU; auf der CPU dauert die Transkription je nach Modell einige Sekunden.
