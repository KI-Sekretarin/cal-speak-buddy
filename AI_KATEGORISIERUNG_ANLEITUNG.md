# 🤖 AI-Kategorisierung Setup - Schritt für Schritt

Komplette Anleitung zur Einrichtung der lokalen KI-Kategorisierung für Inquiry-Einträge.

## 📋 Was wird eingerichtet?

Wenn ein neuer Eintrag in der `inquiries`-Tabelle erstellt wird:
1. **Supabase Trigger** erkennt neuen Eintrag mit `ai_category = NULL`
2. **Edge Function** wird aufgerufen
3. **Lokaler AI-Service** (Ollama) kategorisiert den Eintrag
4. **ai_category** wird in Datenbank aktualisiert

```
Neuer Inquiry → Trigger → Edge Function → AI-Service (Port 9001) → Update DB
```

## 🚀 Schritt 1: Ollama installieren

### Windows Installation

1. **Download Ollama**
   - Gehe zu https://ollama.com/download
   - Lade Windows-Version herunter
   - Installiere Ollama (wird automatisch als Service gestartet)

2. **Modell herunterladen**
   
   Öffne PowerShell und führe aus:
   ```powershell
   ollama pull llama3.2:3b
   ```
   
   Das lädt das Modell herunter (~2GB). Warte bis "success" erscheint.

3. **Installation prüfen**
   ```powershell
   ollama list
   ```
   
   Du solltest `llama3.2:3b` in der Liste sehen.

### Alternative Modelle

- **Schneller, kleiner**: `ollama pull llama3.2:1b` (~1GB)
- **Bessere Qualität**: `ollama pull mistral:7b` (~4GB)

## 🚀 Schritt 2: AI-Service starten

1. **Öffne neues PowerShell-Terminal**

2. **Navigiere zum Projekt**
   ```powershell
   cd c:\Daten\Schule-Analog\5CHIT\ITP\Projekt\cal-speak-buddy
   ```

3. **Starte AI-Service**
   ```powershell
   cd services\ai-categorization
   powershell -ExecutionPolicy Bypass -File .\start.ps1
   ```

4. **Warte auf Meldung**
   ```
   AI-Service wird gestartet...
     Model: llama3.2:3b
     Port: 9001
   
   INFO: Application startup complete.
   ```

**Wichtig:** Lass dieses Terminal-Fenster offen!

## 🧪 Schritt 3: AI-Service testen

Öffne ein **neues** PowerShell-Terminal:

### Test 1: Health Check
```powershell
curl http://localhost:9001/healthz
```

**Erwartete Ausgabe:**
```json
{
  "status": "ok",
  "model": "llama3.2:3b",
  "ollama_available": true
}
```

### Test 2: Kategorisierung testen

**Technische Anfrage:**
```powershell
curl -X POST http://localhost:9001/categorize -H "Content-Type: application/json" -d "{\"subject\":\"App stürzt ab\",\"message\":\"Die App friert ein wenn ich auf Speichern klicke\"}"
```

**Erwartete Kategorie:** `technical`

**Rechnungsanfrage:**
```powershell
curl -X POST http://localhost:9001/categorize -H "Content-Type: application/json" -d "{\"subject\":\"Rechnung\",\"message\":\"Ich habe eine Frage zu meiner letzten Rechnung\"}"
```

**Erwartete Kategorie:** `billing`

## 🗄️ Schritt 4: Supabase Edge Function deployen

### Lokale Entwicklung (empfohlen)

1. **Supabase CLI installieren** (falls noch nicht vorhanden)
   ```powershell
   npm install -g supabase
   ```

2. **Supabase lokal starten**
   ```powershell
   cd c:\Daten\Schule-Analog\5CHIT\ITP\Projekt\cal-speak-buddy
   supabase start
   ```

3. **Edge Function lokal deployen**
   ```powershell
   supabase functions serve process-inquiries-kategorien --env-file supabase/.env.local
   ```

4. **Umgebungsvariablen setzen** (in `supabase/.env.local`)
   ```
   AI_SERVICE_URL=http://host.docker.internal:9001
   ```

### Produktion (Cloud)

> [!WARNING]
> Für Produktion muss der AI-Service öffentlich erreichbar sein (z.B. via Cloudflare Tunnel oder ngrok), da Supabase Edge Functions in der Cloud nicht auf `localhost` zugreifen können.

## 🔄 Schritt 5: End-to-End Test

### Voraussetzungen
- ✅ Ollama läuft
- ✅ AI-Service läuft (Port 9001)
- ✅ Supabase lokal läuft
- ✅ Edge Function deployed

### Test durchführen

1. **Erstelle Test-Inquiry**
   
   Öffne Supabase Studio: http://localhost:54323
   
   Gehe zu SQL Editor und führe aus:
   ```sql
   INSERT INTO inquiries (name, email, subject, message, user_id)
   VALUES (
     'Test User',
     'test@example.com',
     'Technisches Problem',
     'Meine App stürzt ständig ab',
     (SELECT id FROM auth.users LIMIT 1)
   );
   ```

2. **Trigger Edge Function manuell** (für Test)
   ```powershell
   curl -X POST http://localhost:54321/functions/v1/process-inquiries-kategorien
   ```

3. **Prüfe Ergebnis**
   ```sql
   SELECT id, subject, ai_category, status 
   FROM inquiries 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

**Erwartetes Ergebnis:**
- `ai_category` sollte `"technical"` sein
- `status` sollte `"open"` sein

## 📊 Wie es funktioniert

### Workflow im Detail

1. **Neuer Inquiry wird erstellt**
   - User füllt Kontaktformular aus
   - Inquiry wird in DB gespeichert mit `ai_category = NULL`

2. **Trigger feuert**
   - Datenbank-Trigger erkennt `ai_category IS NULL`
   - Ruft Edge Function auf

3. **Edge Function verarbeitet**
   - Holt Inquiry-Daten aus DB
   - Sendet `{subject, message}` an AI-Service
   - Erhält `{category, confidence}` zurück

4. **AI-Service kategorisiert**
   - Ollama analysiert Betreff und Nachricht
   - Wählt passende Kategorie aus:
     - `general` - Allgemeine Anfragen
     - `technical` - Technische Probleme
     - `billing` - Rechnungen, Zahlungen
     - `feedback` - Feedback, Vorschläge
     - `other` - Sonstige

5. **Datenbank wird aktualisiert**
   - `ai_category` wird gesetzt
   - `status` wird auf `"open"` gesetzt

### Kategorisierungs-Beispiele

| Betreff | Nachricht | Kategorie |
|---------|-----------|-----------|
| "App stürzt ab" | "Die App friert ein..." | `technical` |
| "Rechnung" | "Ich habe die Rechnung nicht erhalten" | `billing` |
| "Verbesserungsvorschlag" | "Es wäre toll wenn..." | `feedback` |
| "Frage" | "Wie funktioniert...?" | `general` |

## 🔧 Troubleshooting

### AI-Service startet nicht

**Problem:** `ModuleNotFoundError: No module named 'ollama'`

**Lösung:**
```powershell
cd services\ai-categorization
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Ollama nicht verfügbar

**Problem:** `"ollama_available": false`

**Lösung:**
1. Prüfe ob Ollama läuft: `ollama list`
2. Falls nicht, starte Ollama neu
3. Prüfe ob Modell geladen ist: `ollama pull llama3.2:3b`

### Edge Function kann AI-Service nicht erreichen

**Problem:** `AI categorization failed`

**Lösung (lokal):**
1. Prüfe ob AI-Service läuft: `curl http://localhost:9001/healthz`
2. In `supabase/.env.local` verwende: `AI_SERVICE_URL=http://host.docker.internal:9001`
3. Starte Edge Function neu

### Kategorisierung dauert zu lange

**Problem:** Timeout nach 15 Sekunden

**Lösung:**
1. Verwende kleineres Modell: `llama3.2:1b`
2. Ändere in `start.ps1`: `$env:OLLAMA_MODEL = "llama3.2:1b"`
3. Starte AI-Service neu

### Port 9001 bereits belegt

**Problem:** `Address already in use`

**Lösung:**
```powershell
# Finde Prozess
netstat -ano | findstr :9001

# Beende Prozess
taskkill /PID <PID> /F
```

## 📝 Nächste Schritte

Nach erfolgreicher Einrichtung:

1. **Automatischen Trigger einrichten**
   - Erstelle Datenbank-Trigger der Edge Function automatisch aufruft
   - Siehe Supabase-Dokumentation für Trigger

2. **Monitoring einrichten**
   - Überwache AI-Service Logs
   - Prüfe Kategorisierungs-Genauigkeit

3. **Kategorien anpassen**
   - Bearbeite `server.py` um eigene Kategorien hinzuzufügen
   - Passe Prompt an deine Bedürfnisse an

## 🎯 Zusammenfassung

Du hast jetzt:
- ✅ Ollama installiert und konfiguriert
- ✅ Lokalen AI-Service auf Port 9001
- ✅ Supabase Edge Function für Kategorisierung
- ✅ Automatische Kategorisierung neuer Inquiries

**Alle Services müssen laufen:**
1. Ollama (automatisch als Service)
2. AI-Service (Port 9001)
3. Supabase (lokal oder Cloud)
4. Frontend (optional, Port 8080)

---

**Viel Erfolg! 🚀**
