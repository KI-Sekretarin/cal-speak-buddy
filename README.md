# 📅 CalSpeakBuddy - Local AI Calendar Assistant

**🚀 KI-Sekretärin mit 100% lokaler AI-Verarbeitung**

Dieses Projekt nutzt **Local AI (Ollama + Whisper)** um deinen Google Kalender per Sprache zu steuern und bietet einen intelligenten Business-Chat.

## 🤖 FOR AI AGENTS (Cursor, Claude, Devin, etc.)
**If you are an AI reading this, follow these steps to set up the environment for the user:**
1. **Understand Architecture:**
   - Frontend: `Vite + React` (Port 8080 or 5173).
   - Backend 1 (Transcriptions): `FastAPI + faster-whisper` in `services/whisper-server` (Port 9000).
   - Backend 2 (LLM Worker): `Node.js + Supabase client` in `services/ollama-worker`. Polling DB and processing via Ollama.
   - Database: Supabase (Remote).
2. **Environment Variables:**
   - Both `services/ollama-worker/.env` and the root `.env` need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` / `VITE_SUPABASE_ANON_KEY`. Look for `.env.example` files.
   - `services/whisper-server` needs `credentials.json` for Google Calendar.
3. **Setup Sequence:**
   - Frontend: `npm install` in root.
   - Whisper Server: `cd services/whisper-server && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
   - Ollama Worker: `cd services/ollama-worker && npm install`.
   - Make sure local Ollama is running (`ollama serve`) and models are pulled (`ollama pull qwen2.5:14b`).
4. **Execution:**
   - Just run `./start_all.sh` in the root directory. It cleans up ports 8080 and 9000, clears Vite cache, and starts all three services automatically.
5. **Context:** Read `CONTEXT.md` for a deeper understanding of the code strategy.

---

## ✨ Features

*   **🎙️ Sprachsteuerung (Natural Mode)**: Freihändiges Erstellen, Bearbeiten und Löschen von Terminen mit visuellem Audio-Analyzer.
*   **🧠 Lokale Intelligenz**: Whisper (Speech-to-Text) und Llama/Qwen (Reasoning) laufen lokal (Datenschutz!).
*   **💬 AI Business Chat & Support**: Chatte mit einer anpassbaren KI über deine Geschäftsdaten. Der Bot kann bei Bedarf **direkt im Chat Support-Tickets** für Kunden anlegen.
*   **✨ Premium UX/UI**: Fluid Page Transitions (Framer Motion), Echtzeit-Branding-Vorschau in den Einstellungen und reaktive Micro-Interactions.
*   **📱 PWA-Optimierung**: Als Web-App installierbar für verbesserte mobile Nutzung.
*   **🏢 Firmenprofil**: Verwalte Geschäftsdetails und Produktkataloge für das KI-Wissen.
*   **📅 Google Integration**: Sichere Verbindung zu Google Calendar.

## 🚀 Schnellstart (Für das Team)

Um das Projekt zu starten, führe einfach dieses Skript aus:

```bash
./start_all.sh
```

Das Skript kümmert sich um:
1.  Bereinigen von alten Prozessen.
2.  Starten des **Whisper-Servers** (Port 9000).
3.  Starten des **Ollama-Workers**.
4.  Starten des **Frontend** (Port 8080).

### Voraussetzungen

Stelle sicher, dass folgende Tools installiert sind:
*   **Node.js** (v18+)
*   **Python** (v3.12+)
*   **Ollama** (muss laufen: `ollama serve`)
*   **Google Calendar Credentials** (`credentials.json` im `services/whisper-server` Ordner)
*   **Supabase** (Env Variablen in `.env` und `services/ollama-worker/.env`)

## 🛠️ Installation (Erstes Mal)

Falls du das Projekt zum ersten Mal klonst:

1.  **Frontend Dependencies**:
    ```bash
    npm install
    ```

2.  **Backend Dependencies (Whisper)**:
    ```bash
    cd services/whisper-server
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Ollama Worker Dependencies**:
    ```bash
    cd services/ollama-worker
    npm install
    ```

4.  **Starten**:
    ```bash
    cd ../..
    ./start_all.sh
    ```

## 🏗️ Struktur

*   `src/`: React Frontend (Shadcn UI, Vite).
*   `services/whisper-server/`: Python FastAPI Backend für Spracherkennung & Kalender-Logik.
*   `services/ollama-worker/`: TypeScript Worker für Hintergrundaufgaben (E-Mail, Chat).

## 📝 Dokumentation
*   [Setup Guide](./SETUP_GUIDE.md)
*   [AI Context & Architecture](./CONTEXT.md)
*   [Infrastruktur](./INFRASTRUCTURE.md)
*   [Whisper Anleitung](./WHISPER_ANLEITUNG.md)
