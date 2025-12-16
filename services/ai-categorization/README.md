# 🤖 AI-Kategorisierung Service

Lokaler Service zur automatischen Kategorisierung von Inquiry-Einträgen mit Ollama.

## 📋 Übersicht

Dieser Service verwendet Ollama (lokale LLM) um Kundenanfragen automatisch zu kategorisieren:
- **Betreff** + **Nachricht** → **Kategorie**
- Kategorien: `general`, `technical`, `billing`, `feedback`, `other`

## 🚀 Schnellstart

### 1. Ollama installieren

**Windows:**
1. Download von https://ollama.com/download
2. Installiere Ollama (wird als Service gestartet)
3. Öffne PowerShell und lade Modell:
   ```powershell
   ollama pull llama3.2:3b
   ```

**Prüfe Installation:**
```powershell
ollama list
```

Du solltest `llama3.2:3b` in der Liste sehen.

### 2. AI-Service starten

```powershell
cd services\ai-categorization
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

Der Service:
- Erstellt automatisch Virtual Environment
- Installiert Dependencies
- Startet auf Port 9001

### 3. Testen

**Health Check:**
```powershell
curl http://localhost:9001/healthz
```

**Kategorisierung testen:**
```powershell
curl -X POST http://localhost:9001/categorize -H "Content-Type: application/json" -d "{\"subject\":\"Rechnung\",\"message\":\"Ich habe eine Frage zu meiner letzten Rechnung\"}"
```

Erwartete Antwort:
```json
{
  "category": "billing",
  "confidence": 0.85,
  "reasoning": "Kategorisiert als 'billing' basierend auf Inhalt"
}
```

## 📡 API-Endpunkte

### POST `/categorize`

Kategorisiert eine Anfrage.

**Request:**
```json
{
  "subject": "Technisches Problem",
  "message": "Meine App stürzt ständig ab",
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "category": "technical",
  "confidence": 0.85,
  "reasoning": "Kategorisiert als 'technical' basierend auf Inhalt"
}
```

### GET `/healthz`

Prüft ob Service und Ollama verfügbar sind.

**Response:**
```json
{
  "status": "ok",
  "model": "llama3.2:3b",
  "ollama_available": true
}
```

### GET `/categories`

Gibt verfügbare Kategorien zurück.

**Response:**
```json
{
  "categories": {
    "general": "Allgemeine Anfragen",
    "technical": "Technische Probleme oder Support",
    "billing": "Rechnungen, Zahlungen, Preise",
    "feedback": "Feedback, Vorschläge, Bewertungen",
    "other": "Sonstige Anfragen"
  }
}
```

## ⚙️ Konfiguration

In `start.ps1` anpassen:

```powershell
$env:OLLAMA_MODEL = "llama3.2:3b"  # Oder anderes Modell
$env:AI_SERVICE_PORT = "9001"      # Port ändern
```

### Empfohlene Modelle

| Modell | Größe | Geschwindigkeit | Qualität | Empfehlung |
|--------|-------|-----------------|----------|------------|
| `llama3.2:3b` | ~2GB | ⚡⚡⚡⚡ | ⭐⭐⭐ | **Empfohlen** |
| `mistral:7b` | ~4GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Bessere Qualität |
| `llama3.2:1b` | ~1GB | ⚡⚡⚡⚡⚡ | ⭐⭐ | Sehr schnell |

## 🔧 Troubleshooting

### "Ollama not available"

Prüfe ob Ollama läuft:
```powershell
ollama list
```

Falls nicht, starte Ollama neu oder installiere es von https://ollama.com

### "Model not found"

Lade das Modell:
```powershell
ollama pull llama3.2:3b
```

### "Port 9001 already in use"

Ändere Port in `start.ps1` oder beende anderen Prozess:
```powershell
netstat -ano | findstr :9001
taskkill /PID <PID> /F
```

### Service startet nicht

1. Prüfe Python Installation: `py --version`
2. Prüfe Virtual Environment: `ls .venv`
3. Installiere Dependencies manuell:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

## 🔄 Integration mit Supabase

Der Service wird von der Supabase Edge Function aufgerufen:

```
Neuer Inquiry → Trigger → Edge Function → AI-Service (Port 9001) → Update ai_category
```

**Wichtig:** Für lokale Tests muss die Edge Function mit Supabase CLI lokal laufen!

## 📊 Beispiele

### Technische Anfrage
```json
{
  "subject": "App stürzt ab",
  "message": "Die App friert ein wenn ich auf Speichern klicke"
}
→ "technical"
```

### Rechnungsanfrage
```json
{
  "subject": "Rechnung",
  "message": "Ich habe die Rechnung noch nicht erhalten"
}
→ "billing"
```

### Feedback
```json
{
  "subject": "Verbesserungsvorschlag",
  "message": "Es wäre toll wenn man Farben anpassen könnte"
}
→ "feedback"
```

## 🎯 Features

- ✅ **100% lokal** - Keine Cloud, keine API-Kosten
- ✅ **Schnell** - Kategorisierung in 1-2 Sekunden
- ✅ **Privat** - Daten verlassen nie deinen Computer
- ✅ **Offline** - Funktioniert ohne Internet
- ✅ **Anpassbar** - Kategorien und Prompts einfach änderbar

---

**Made with ❤️ using Ollama**
