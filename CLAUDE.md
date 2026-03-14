# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cal-Speak-Buddy** is a local-first AI secretary/calendar assistant with voice control, a chat interface with ticket creation, and employee management. All AI processing runs locally via Ollama and Whisper.

## Commands

### All Services starten/stoppen
```bash
./start_all.sh    # Startet Frontend (5173), Whisper Server (9000), Ollama Worker
./stop_all.sh     # Stoppt alle Services
```

### Frontend (React/Vite)
```bash
npm run dev          # Dev-Server auf Port 5173
npm run build        # Production Build
npm run lint         # ESLint
npm run preview      # Production Build vorschauen
```

### Ollama Worker
```bash
cd services/ollama-worker
npm start            # ts-node index.ts
```

### Whisper Server
```bash
cd services/whisper-server
./start.sh           # oder: uvicorn server:app --host 0.0.0.0 --port 9000
```

### Datenbank
```bash
supabase db push                # Migrationen pushen
supabase functions deploy       # Edge Functions deployen
```

## Architektur

Drei unabhängige Services kommunizieren über Supabase und HTTP:

```
Benutzer spricht → Frontend (React) → Whisper Server (POST /transcribe-file)
                                    → CalendarAgent → Google Calendar API
                                    → Supabase (inquiries Tabelle)

Supabase (neue Inquiry) → Ollama Worker (pollt alle 5s)
                        → Ollama LLM (Kategorisierung, Mitarbeiter-Zuweisung)
                        → Supabase Update (category, assigned_to, response_draft)
                        → Frontend via Realtime-Subscription
```

### Frontend (`/src`)
- React 18 + TypeScript + Vite, UI via Shadcn/UI + TailwindCSS
- Routing: React Router 6, State: React Context (AuthContext, VoiceContext) + TanStack Query
- Authentifizierung: Google OAuth (@react-oauth/google) + Supabase Auth
- Hauptkomponenten: `CalSpeakBuddy.tsx` (Voice-Interface), `ChatWidget.tsx`, `AdminDashboard.tsx`
- Voice Activity Detection: `src/hooks/useVAD.ts`
- Supabase Client: `src/integrations/supabase/client.ts`

### Whisper Server (`/services/whisper-server`)
- FastAPI + Uvicorn auf Port 9000
- `server.py`: Endpoints `/transcribe-file`, `/process-command`, `/healthz`
- `agent.py`: `CalendarAgent` – verarbeitet Sprachbefehle zu Google Calendar Aktionen
- `mail_agent.py`: Gmail-Integration, speichert Emails als Inquiries in Supabase

### Ollama Worker (`/services/ollama-worker`)
- Node.js/TypeScript, pollt Supabase alle 5 Sekunden
- `index.ts`: Holt unbearbeitete Inquiries → Ollama-Inferenz → Supabase Update
- Modell: Qwen 2.5 14B oder Llama 3.2 (konfigurierbar via `.env`)
- Lastrausgleich: verteilt Inquiries anhand von Mitarbeiter-Kapazität aus `employee_profiles`

### Supabase (Datenbank + Backend)
- Wichtige Tabellen: `inquiries`, `employee_profiles`, `ai_company_context`, `chat_messages`, `profiles`
- Edge Functions in `/supabase/functions/`: `process-inquiry`, `send-inquiry-response`, `create-employee`
- Realtime-Subscriptions für Live-Updates im Frontend
- Migrationen: `/supabase/migrations/`

## Umgebungsvariablen

**Frontend** (`.env` / `.env.local`):
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_GOOGLE_CLIENT_ID
```

**Ollama Worker** (`services/ollama-worker/.env`):
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
OLLAMA_CTX=16384
```

**Whisper Server**: Benötigt `credentials.json` (Google OAuth) in `services/whisper-server/`.

## Ports
| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Whisper Server | 9000 |
| Ollama | 11434 |

## Wichtige Hinweise

- **Supabase MCP**: Direkt per MCP-Server verfügbar – für DB-Abfragen und Schema-Änderungen bevorzugt nutzen
- **Typen generieren**: Nach Schema-Änderungen `supabase gen types typescript` ausführen und `src/integrations/supabase/types.ts` aktualisieren
- **Shadcn Komponenten**: Nur via `npx shadcn@latest add <component>` hinzufügen, nicht manuell in `/src/components/ui/` erstellen
- **RLS Policies**: Neue Tabellen brauchen Row Level Security – Policies in `supabase/storage_policies.sql` oder als Migration
- **Keine Cloud-KI**: Alle AI-Verarbeitung läuft lokal (Ollama + Whisper) – kein OpenAI/Anthropic für Kernfunktionen
