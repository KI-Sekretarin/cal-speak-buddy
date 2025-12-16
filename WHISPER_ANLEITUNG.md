# 🎉 Whisper Lokale Transkription - Schnellstart

Die lokale Whisper-Transkription ist jetzt einsatzbereit!

## ✅ Was wurde eingerichtet?

1. **PowerShell-Startskript** (`start.ps1`) für Windows
2. **Whisper-Server** mit FastAPI und faster-whisper
3. **Frontend-Integration** bereits konfiguriert

## 🚀 So startest du die Transkription

### Schritt 1: Whisper-Server starten

Öffne ein PowerShell-Terminal und führe aus:

```powershell
cd services\whisper-server
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

Der Server:
- Erstellt automatisch ein Python Virtual Environment
- Installiert alle Dependencies
- Lädt das Whisper-Modell (beim ersten Mal ~150MB)
- Startet auf Port 9000

**Wichtig:** Lass dieses Terminal-Fenster offen!

### Schritt 2: Frontend starten

Öffne ein **zweites** Terminal und führe aus:

```powershell
npm run dev
```

### Schritt 3: Verwenden

1. Öffne die App im Browser (normalerweise `http://localhost:5173`)
2. Klicke auf das Mikrofon-Symbol
3. Sprich deinen Text
4. Klicke auf "Stopp"
5. Klicke auf "Jetzt transkribieren"
6. Der Text wird automatisch transkribiert! ✨

## 🎯 Features

- ✅ **100% lokal** - Keine Cloud, keine API-Kosten
- ✅ **Schnell** - Transkription in Sekunden
- ✅ **Privat** - Audio verlässt nie deinen Computer
- ✅ **Offline** - Funktioniert ohne Internet
- ✅ **Bearbeitbar** - Du kannst den Text vor dem Senden anpassen

## ⚙️ Konfiguration

Das Whisper-Modell kann in `start.ps1` angepasst werden:

```powershell
$env:WHISPER_MODEL = "base"  # Optionen: tiny, base, small, medium, large-v3
$env:WHISPER_DEVICE = "cpu"  # Oder "cuda" für GPU
$env:WHISPER_COMPUTE_TYPE = "int8"
```

### Model-Empfehlungen:

- **tiny** - Sehr schnell, weniger genau (~75 MB)
- **base** - **EMPFOHLEN** - Guter Kompromiss (~150 MB)
- **small** - Bessere Qualität, langsamer (~500 MB)
- **medium** - Beste Qualität für CPU (~1.5 GB)

## 🔧 Troubleshooting

### Server startet nicht?

Prüfe ob Python installiert ist:
```powershell
py --version
```

### "Port 9000 already in use"?

Finde und beende den Prozess:
```powershell
netstat -ano | findstr :9000
taskkill /PID <PID> /F
```

### Frontend kann Server nicht erreichen?

1. Prüfe ob Server läuft:
   ```powershell
   curl http://localhost:9000/healthz
   ```
2. Stelle sicher, dass beide (Server + Frontend) laufen

## 📝 Workflow

```
Aufnahme → Transkription (lokal) → Bearbeiten → An n8n senden
```

Der komplette Workflow:
1. **Aufnehmen**: Mikrofon-Button drücken
2. **Transkribieren**: Lokaler Whisper-Server verarbeitet Audio
3. **Bearbeiten**: Optional Text anpassen
4. **Senden**: An n8n Webhook für weitere Verarbeitung

---

**Viel Erfolg! 🎉**
