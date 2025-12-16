# E-Mail Integration Setup Guide

## Übersicht
Dieses Modul ermöglicht es, E-Mails von einem verbundenen Google-Konto abzurufen, mittels KI (Ollama) zu analysieren und als Tickets in Supabase zu speichern.

## Voraussetzungen

### 1. Google Cloud Console
Die **Gmail API** muss für das Projekt aktiviert sein.
1.  Gehe zur [Google Cloud Console](https://console.developers.google.com/).
2.  Wähle das entsprechende Projekt aus.
3.  Suche nach "Gmail API" und klicke auf **Aktivieren/Enable**.

### 2. Umgebungsvariablen (.env)
Damit der Server Schreibrechte auf die Datenbank hat (um RLS zu umgehen), wird der `SUPABASE_SERVICE_ROLE_KEY` benötigt.

Stelle sicher, dass deine `.env` Datei im Root-Verzeichnis (und ggf. in `services/whisper-server/.env`) folgende Einträge enthält:

```env
# Supabase URLs (werden für Frontend und Backend genutzt)
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY

# WICHTIG für das Backend (Mail Agent):
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 3. Whisper Server
Der Whisper Server (`services/whisper-server`) muss laufen, da er den `/scan-emails` Endpunkt bereitstellt.

Starten des Servers:
```powershell
powershell -ExecutionPolicy Bypass -File services\whisper-server\start.ps1
```

## Nutzung

1.  Öffne die Anwendung (**Settings -> Features**).
2.  Verbinde dein Google Konto.
    *   **WICHTIG:** Wenn du bereits verbunden warst, **trenne** die Verbindung und verbinde dich neu, um die neuen Berechtigungen (`https://www.googleapis.com/auth/gmail.modify`) zu akzeptieren.
3.  Gehe zum **Admin Dashboard**.
4.  Klicke oben rechts auf den Button **"E-Mails abrufen"**.
5.  Neue E-Mails werden analysiert und erscheinen in der Ticket-Liste (mit "Mail"-Badge).
