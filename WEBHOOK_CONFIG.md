# Webhook Konfiguration

## Schnellstart

Die Sprachsteuerung sendet Transkripte an einen n8n Webhook. Um die Webhook-URL zu ändern:

1. Öffne `src/components/CalSpeakBuddy.tsx`
2. Finde die Zeile:
   ```typescript
   const WEBHOOK_URL = 'https://n8n-service-jm5f.onrender.com/webhook-test/audio-to-transcribe';
   ```
3. Ersetze die URL mit deiner eigenen n8n Webhook URL

## Umgebungsvariablen (Empfohlen)

Für eine bessere Konfiguration, erstelle eine `.env` Datei im Projekt-Root:

```env
VITE_N8N_WEBHOOK_URL=https://deine-n8n-instanz.com/webhook/audio-to-transcribe
VITE_N8N_WEBHOOK_TOKEN=optional_dein_secret_token
```

Dann in `CalSpeakBuddy.tsx`:

```typescript
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://fallback-url.com';
const WEBHOOK_TOKEN = import.meta.env.VITE_N8N_WEBHOOK_TOKEN;
```

## Vollständige Anleitung

Siehe [N8N_WEBHOOK_ANLEITUNG.md](./N8N_WEBHOOK_ANLEITUNG.md) für eine detaillierte Schritt-für-Schritt-Anleitung zur Einrichtung des n8n Webhooks.

## Gesendete Daten

```json
{
  "transcript": "Das finale Transkript (nach Bearbeitung)",
  "originalTranscript": "Das ursprüngliche Whisper-Transkript",
  "wasEdited": true,
  "timestamp": "2025-11-20T15:00:00.000Z"
}
```
