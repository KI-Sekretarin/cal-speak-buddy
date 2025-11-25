# Projekt Status & Notizen

## 🚨 Wichtiger Hinweis zu n8n Workflows (Stand: 25.11.2025)

**Status: Workflows verloren / Neuerstellung notwendig**

Wir haben keinen Zugriff mehr auf die alten n8n-Instanzen auf Render (Free Tier Datenbanken wurden pausiert/gelöscht und Export war nicht mehr möglich).

**Konsequenz:**
- Alle alten n8n Workflows sind verloren.
- **Alle Workflows müssen neu erstellt werden.**
- Die Migration von Render ist damit hinfällig, wir starten mit einer frischen n8n-Instanz (lokal oder auf neuem Server).

### Nächste Schritte für n8n:
1. Neue n8n-Instanz aufsetzen (siehe `N8N_WEBHOOK_ANLEITUNG.md` für Webhook-Setup).
2. Workflows basierend auf den Anforderungen neu bauen.
3. Webhook-URLs in der App (`src/components/CalSpeakBuddy.tsx`) aktualisieren.
