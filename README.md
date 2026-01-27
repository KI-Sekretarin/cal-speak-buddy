# 📅 CalSpeakBuddy - Local AI Calendar Assistant

**🚀 KI-Sekretärin mit 100% lokaler AI-Verarbeitung**

Dieses Projekt nutzt **Local AI (Ollama + Whisper)** um deinen Google Kalender per Sprache zu steuern und bietet einen intelligenten Business-Chat.

## ✨ Features

*   **🎙️ Sprachsteuerung (Natural Mode)**: Freihändiges Erstellen, Bearbeiten und Löschen von Terminen.
*   **🧠 Lokale Intelligenz**: Whisper (Speech-to-Text) und Llama/Qwen (Reasoning) laufen lokal (Datenschutz!).
*   **💬 AI Business Chat**: Chatte mit einer anpassbaren KI über deine Geschäftsdaten.
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

2.  **Backend Dependencies**:
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
    ./start_all.sh
    ```

## 🏗️ Struktur

*   `src/`: React Frontend (Shadcn UI, Vite).
*   `services/whisper-server/`: Python FastAPI Backend für Spracherkennung & Kalender-Logik.
*   `services/ollama-worker/`: TypeScript Worker für Hintergrundaufgaben (E-Mail, Chat).

## 📝 Dokumentation
*   [Setup Guide](./SETUP_GUIDE.md)
*   [Infrastruktur](./INFRASTRUCTURE.md)
*   [Whisper Anleitung](./WHISPER_ANLEITUNG.md)
