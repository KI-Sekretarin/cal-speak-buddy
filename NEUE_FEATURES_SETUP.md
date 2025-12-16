# 🎉 Neue Features Setup - Google Calendar Integration

## Was ist neu?

Nach dem letzten Pull wurden folgende Features hinzugefügt:

### 1. **Google Calendar Integration** 📅
- Sprachbefehle erstellen automatisch Kalendereinträge
- Verwendet Ollama (Llama 3.2) für natürliche Sprachverarbeitung
- OAuth2 Integration für Google Calendar API

### 2. **CalendarAgent** 🤖
- Interpretiert Sprachbefehle wie "Erstelle ein Meeting morgen um 14 Uhr"
- Extrahiert Datum, Uhrzeit, Titel automatisch
- Erstellt Kalendereinträge in Google Calendar

### 3. **Neue Komponenten**
- `GoogleCalendarConnect.tsx` - OAuth2 Login im Frontend
- `agent.py` - KI-Agent für Befehlsinterpretation
- Neuer Endpoint `/process-command` im Whisper-Server

## 🚀 Setup-Schritte

### Schritt 1: Ollama installieren ⚠️ **ERFORDERLICH**

Ollama ist noch nicht installiert. Du benötigst es für die KI-Funktionen:

1. **Download**: https://ollama.com/download (Windows-Version)
2. **Installieren**: Führe den Installer aus
3. **Modell laden**:
   ```powershell
   ollama pull llama3.2
   ```
4. **Prüfen**:
   ```powershell
   ollama list
   ```

**Erwartete Ausgabe:**
```
NAME              ID              SIZE      MODIFIED
llama3.2:latest   abc123def       2.0 GB    2 minutes ago
```

### Schritt 2: Dependencies aktualisieren ✅ **ERLEDIGT**

Die Python-Dependencies wurden bereits aktualisiert:
- ✅ `openai` - Für Ollama-Kommunikation
- ✅ `google-auth` - Google OAuth2
- ✅ `google-api-python-client` - Google Calendar API
- ✅ `python-dotenv` - Umgebungsvariablen

### Schritt 3: Whisper-Server neu starten

Der alte Whisper-Server läuft noch. Starte ihn neu mit den neuen Features:

```powershell
# Stoppe den alten Server (Ctrl+C im Terminal)
# Dann starte neu:
cd services\whisper-server
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

**Oder verwende das neue restart-Script:**
```powershell
cd services\whisper-server
bash restart_agent.sh  # Für Linux/Mac
# Für Windows: Manuell neu starten
```

### Schritt 4: Google OAuth konfigurieren (Optional)

Für die Google Calendar Integration benötigst du:

1. **Google Cloud Console**: https://console.cloud.google.com/
2. **Projekt erstellen**
3. **Google Calendar API aktivieren**
4. **OAuth Client ID erstellen**:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:8080`
   - Authorized redirect URIs: `http://localhost:8080`
5. **Client ID kopieren**

**Im Frontend konfigurieren** (bereits erledigt in `App.tsx`):
```typescript
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
```

## 🎯 Wie es funktioniert

### Workflow

```
1. User spricht: "Erstelle ein Meeting morgen um 14 Uhr"
   ↓
2. Whisper transkribiert → "Erstelle ein Meeting morgen um 14 Uhr"
   ↓
3. User klickt "Befehl ausführen"
   ↓
4. Frontend sendet zu /process-command
   ↓
5. CalendarAgent (Ollama) interpretiert:
   {
     "intent": "create_event",
     "event": {
       "summary": "Meeting",
       "start": "2025-11-26T14:00:00",
       "end": "2025-11-26T15:00:00"
     }
   }
   ↓
6. Google Calendar API erstellt Termin
   ↓
7. User erhält Bestätigung
```

### Beispiel-Befehle

| Befehl | Ergebnis |
|--------|----------|
| "Erstelle ein Meeting morgen um 14 Uhr" | Termin am nächsten Tag, 14:00-15:00 |
| "Termin mit Tom übermorgen um 10 Uhr für Projektplanung" | Termin in 2 Tagen, 10:00-11:00, Titel: "Termin mit Tom", Beschreibung: "Projektplanung" |
| "Meeting heute Nachmittag um 15:30" | Termin heute, 15:30-16:30 |

## 🧪 Testen

### Test 1: Ollama prüfen
```powershell
ollama list
```

### Test 2: Whisper-Server prüfen
```powershell
curl http://localhost:9000/transcribe-file
```

### Test 3: Befehl testen (nach Ollama-Installation)
```powershell
curl -X POST http://localhost:9000/process-command -H "Content-Type: application/json" -d "{\"text\":\"Erstelle ein Meeting morgen um 14 Uhr\"}"
```

**Erwartete Antwort:**
```json
{
  "status": "success",
  "message": "Termin erstellt: https://calendar.google.com/...",
  "data": { ... }
}
```

## 📝 Wichtige Dateien

### Neue Dateien
- `services/whisper-server/agent.py` - KI-Agent für Kalenderbefehle
- `services/whisper-server/restart_agent.sh` - Restart-Script
- `src/components/GoogleCalendarConnect.tsx` - OAuth-Login
- `SETUP_GUIDE.md` - Vollständige Setup-Anleitung

### Geänderte Dateien
- `services/whisper-server/server.py` - Neuer `/process-command` Endpoint
- `services/whisper-server/requirements.txt` - Neue Dependencies
- `src/App.tsx` - Google OAuth Provider
- `src/components/CalSpeakBuddy.tsx` - "Befehl ausführen" Button

## 🔧 Troubleshooting

### "Ollama not running"
```powershell
# Prüfe ob Ollama läuft
ollama list

# Starte Ollama (falls installiert)
ollama serve
```

### "Calendar Agent not initialized"
- Stelle sicher dass Ollama läuft
- Prüfe ob `llama3.2` Modell geladen ist
- Starte Whisper-Server neu

### "Google Login ungültig"
- Gehe zu Settings → Weitere Features
- Klicke "Mit Google verbinden"
- Logge dich ein

## 🎉 Zusammenfassung

**Bereits erledigt:**
- ✅ Dependencies aktualisiert
- ✅ Merge-Konflikt gelöst
- ✅ Code analysiert

**Noch zu tun:**
1. ⚠️ **Ollama installieren** (siehe Schritt 1)
2. ⚠️ **Whisper-Server neu starten**
3. 🔧 **Google OAuth konfigurieren** (optional, für echte Kalendereinträge)

**Nach Ollama-Installation:**
- Whisper-Server neu starten
- Frontend ist bereits bereit
- Teste mit Sprachbefehlen!

---

**Viel Erfolg! 🚀**
