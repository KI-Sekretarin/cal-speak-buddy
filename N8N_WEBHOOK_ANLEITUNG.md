# n8n Webhook Einrichtung für Sprachtranskription

Diese Anleitung zeigt dir, wie du einen n8n Webhook einrichtest, um Transkripte von der KI-Sekretärin zu empfangen und zu verarbeiten.

## Voraussetzungen

- n8n Installation (lokal oder Cloud)
- Zugriff auf n8n Editor
- Grundkenntnisse in n8n Workflows

## Schritt 1: Neuen Workflow erstellen

1. Öffne n8n in deinem Browser
2. Klicke auf **"New Workflow"**
3. Benenne den Workflow z.B. "Sprachtranskript Verarbeitung"

## Schritt 2: Webhook Node hinzufügen

1. Klicke auf das **"+"** Symbol, um einen neuen Node hinzuzufügen
2. Suche nach **"Webhook"** und wähle ihn aus
3. Konfiguriere den Webhook:

### Webhook Einstellungen:

```
HTTP Method: POST
Path: audio-to-transcribe
Authentication: None (oder nach Bedarf)
Response Mode: When Last Node Finishes
Response Code: 200
Response Data: Last Node
```

### Wichtig: CORS Einstellungen

Füge unter **"Options"** → **"Response Headers"** folgende Header hinzu:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## Schritt 3: Webhook URL kopieren

1. Klicke auf **"Test URL"** oder **"Production URL"**
2. Kopiere die URL (z.B. `https://deine-n8n-instanz.com/webhook/audio-to-transcribe`)
3. Diese URL wird in der Anwendung verwendet

## Schritt 4: Datenstruktur verstehen

Die Anwendung sendet folgende JSON-Daten an den Webhook:

```json
{
  "transcript": "Das bearbeitete Transkript",
  "originalTranscript": "Das ursprüngliche Transkript vom Whisper",
  "wasEdited": true,
  "timestamp": "2025-11-20T15:00:00.000Z"
}
```

### Felder Erklärung:

- **transcript**: Der finale Text (nach Bearbeitung durch den User)
- **originalTranscript**: Der ursprüngliche Text von Whisper
- **wasEdited**: Boolean - wurde der Text bearbeitet?
- **timestamp**: ISO 8601 Zeitstempel

## Schritt 5: Beispiel-Workflow erstellen

Hier ist ein einfacher Workflow, um die Daten zu verarbeiten:

### Node 1: Webhook (bereits konfiguriert)

### Node 2: Set Node - Daten extrahieren

```javascript
// Füge einen "Set" Node hinzu
return {
  transcript: $json.transcript,
  wasEdited: $json.wasEdited,
  timestamp: $json.timestamp,
  wordCount: $json.transcript.split(' ').length,
  receivedAt: new Date().toISOString()
};
```

### Node 3: IF Node - Bearbeitete vs. Original

Bedingung: `{{ $json.wasEdited }} === true`

**True Branch**: Transkript wurde bearbeitet
**False Branch**: Transkript ist original

### Node 4a: Slack/Email/DB - Bearbeitete Transkripte

Beispiel für Slack Nachricht:
```
✏️ Bearbeitetes Transkript empfangen

📝 Text: {{ $json.transcript }}
🕐 Zeit: {{ $json.timestamp }}
📊 Wörter: {{ $json.wordCount }}
```

### Node 4b: Slack/Email/DB - Original Transkripte

Beispiel für Slack Nachricht:
```
🎤 Original Transkript empfangen

📝 Text: {{ $json.transcript }}
🕐 Zeit: {{ $json.timestamp }}
📊 Wörter: {{ $json.wordCount }}
```

## Schritt 6: Erweiterte Verarbeitung (Optional)

### A) Speichern in Datenbank

Füge einen **"Postgres"** oder **"MySQL"** Node hinzu:

```sql
INSERT INTO transcripts (
  transcript_text,
  original_text,
  was_edited,
  created_at,
  word_count
) VALUES (
  '{{ $json.transcript }}',
  '{{ $json.originalTranscript }}',
  {{ $json.wasEdited }},
  '{{ $json.timestamp }}',
  {{ $json.wordCount }}
);
```

### B) KI-Analyse mit OpenAI

Füge einen **"OpenAI"** Node hinzu:

```
Operation: Message a Model
Model: gpt-4
Prompt: 
Analysiere folgendes Transkript und extrahiere:
- Hauptthema
- Erwähnte Personen
- Aktionspunkte
- Sentiment (positiv/neutral/negativ)

Transkript: {{ $json.transcript }}
```

### C) Kalendereinträge erstellen

Wenn das Transkript einen Termin enthält, füge einen **"Google Calendar"** Node hinzu:

1. Verwende einen **"Function"** Node, um Datum/Zeit zu extrahieren
2. Erstelle einen Kalendereintrag mit den extrahierten Daten

### D) Ticket-System Integration

Füge einen **"HTTP Request"** Node hinzu, um ein Ticket zu erstellen:

```javascript
{
  "method": "POST",
  "url": "https://your-ticket-system.com/api/tickets",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  },
  "body": {
    "title": "Neues Sprachtranskript",
    "description": "{{ $json.transcript }}",
    "priority": "{{ $json.wasEdited ? 'high' : 'normal' }}",
    "created_at": "{{ $json.timestamp }}"
  }
}
```

## Schritt 7: Webhook URL in der Anwendung konfigurieren

1. Öffne die Datei: `src/components/CalSpeakBuddy.tsx`
2. Finde die Zeile mit `WEBHOOK_URL`
3. Ersetze die URL mit deiner n8n Webhook URL:

```typescript
const WEBHOOK_URL = 'https://deine-n8n-instanz.com/webhook/audio-to-transcribe';
```

## Schritt 8: Testen

1. Aktiviere den Workflow in n8n (Toggle oben rechts)
2. Starte die Anwendung
3. Mache eine Sprachaufnahme
4. Bearbeite das Transkript (optional)
5. Klicke auf "An n8n senden"
6. Überprüfe in n8n, ob die Daten empfangen wurden

## Troubleshooting

### Problem: CORS-Fehler

**Lösung**: Stelle sicher, dass die Response Headers im Webhook korrekt gesetzt sind:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

### Problem: 404 Not Found

**Lösung**: 
- Überprüfe, ob der Workflow aktiviert ist
- Stelle sicher, dass die URL korrekt ist
- Verwende die "Production URL" statt "Test URL"

### Problem: Keine Daten empfangen

**Lösung**:
- Öffne die Browser-Konsole (F12)
- Überprüfe die Network-Tab für Fehler
- Stelle sicher, dass der Webhook auf POST-Requests hört

### Problem: Timeout

**Lösung**:
- Setze "Response Mode" auf "When Last Node Finishes"
- Stelle sicher, dass der Workflow nicht zu lange dauert
- Verwende asynchrone Verarbeitung für lange Tasks

## Erweiterte Konfiguration

### Authentifizierung hinzufügen

Für Produktionsumgebungen solltest du Authentifizierung hinzufügen:

1. Im Webhook Node: **Authentication** → **Header Auth**
2. Header Name: `Authorization`
3. Header Value: `Bearer DEIN_SECRET_TOKEN`

4. In `CalSpeakBuddy.tsx`:
```typescript
const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer DEIN_SECRET_TOKEN'
  },
  body: JSON.stringify({...})
});
```

### Umgebungsvariablen verwenden

Erstelle eine `.env` Datei:
```
VITE_N8N_WEBHOOK_URL=https://deine-n8n-instanz.com/webhook/audio-to-transcribe
VITE_N8N_WEBHOOK_TOKEN=dein_secret_token
```

In `CalSpeakBuddy.tsx`:
```typescript
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const WEBHOOK_TOKEN = import.meta.env.VITE_N8N_WEBHOOK_TOKEN;
```

## Beispiel: Vollständiger n8n Workflow

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "audio-to-transcribe",
        "responseMode": "lastNode",
        "options": {
          "responseHeaders": {
            "entries": [
              {
                "name": "Access-Control-Allow-Origin",
                "value": "*"
              },
              {
                "name": "Access-Control-Allow-Methods",
                "value": "POST, OPTIONS"
              },
              {
                "name": "Access-Control-Allow-Headers",
                "value": "Content-Type"
              }
            ]
          }
        }
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": [
            {
              "name": "transcript",
              "value": "={{ $json.transcript }}"
            },
            {
              "name": "timestamp",
              "value": "={{ $json.timestamp }}"
            }
          ],
          "boolean": [
            {
              "name": "wasEdited",
              "value": "={{ $json.wasEdited }}"
            }
          ],
          "number": [
            {
              "name": "wordCount",
              "value": "={{ $json.transcript.split(' ').length }}"
            }
          ]
        }
      }
    },
    {
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "position": [650, 300],
      "parameters": {
        "channel": "#transcripts",
        "text": "=🎤 Neues Transkript\n\n{{ $json.transcript }}\n\n📊 Wörter: {{ $json.wordCount }}\n✏️ Bearbeitet: {{ $json.wasEdited }}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Process Data", "type": "main", "index": 0}]]
    },
    "Process Data": {
      "main": [[{"node": "Send to Slack", "type": "main", "index": 0}]]
    }
  }
}
```

## Nächste Schritte

1. ✅ Webhook erstellt und getestet
2. 🔄 Datenverarbeitung implementiert
3. 📊 Analytics hinzufügen (optional)
4. 🔐 Authentifizierung aktivieren (Produktion)
5. 📧 Benachrichtigungen einrichten
6. 💾 Datenbank-Speicherung konfigurieren

## Support

Bei Fragen oder Problemen:
- n8n Dokumentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- GitHub Issues: https://github.com/n8n-io/n8n/issues

---

**Viel Erfolg mit deinem n8n Webhook! 🚀**
