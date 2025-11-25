# 🤖 Local AI Calendar Assistant - Setup Guide

This project uses a **Local AI Stack** to interpret voice commands and manage your Google Calendar.
It consists of:
1.  **Frontend**: React + Vite (UI & Audio Recording)
2.  **Backend**: Python FastAPI (Whisper Speech-to-Text & Command Processing)
3.  **AI**: Ollama (Llama 3.2 for reasoning) + Faster-Whisper (for transcription)

---

## ✅ Prerequisites

Before you start, ensure you have the following installed:

1.  **Node.js & npm**: [Download here](https://nodejs.org/)
2.  **Python 3.10+**: [Download here](https://www.python.org/)
3.  **Ollama**: [Download here](https://ollama.com/)

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <YOUR_REPO_URL>
cd cal-speak-buddy
```

### 2. Setup Local AI (Ollama)
Install and run the Llama 3.2 model (required for command interpretation):
```bash
ollama pull llama3.2
ollama run llama3.2
# Keep this terminal window open or ensure Ollama is running in the background
```

### 3. Setup Backend (Python)
The backend handles speech recognition and communicates with Ollama.

```bash
cd services/whisper-server

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Return to root
cd ../..
```

### 4. Setup Frontend (React)
```bash
npm install
```

---

## ⚙️ Configuration (Google OAuth)

To allow the app to access your Google Calendar, you need a Google Cloud Project.

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **Google Calendar API**.
4.  Go to **APIs & Services > Credentials**.
5.  Create **OAuth Client ID**:
    *   Application type: **Web application**
    *   Name: `CalSpeakBuddy`
    *   **Authorized JavaScript origins**: `http://localhost:8080` (or `http://localhost:5173` if Vite defaults to that)
    *   **Authorized redirect URIs**: `http://localhost:8080`
6.  Copy your **Client ID**.
7.  Open `src/App.tsx` in your editor.
8.  Paste your Client ID:
    ```typescript
    const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
    ```

---

## 🚀 Running the App

You need to run both the Backend and Frontend.

### Terminal 1: Backend
```bash
cd services/whisper-server
./restart_agent.sh
# Or manually:
# source .venv/bin/activate
# uvicorn server:app --host 0.0.0.0 --port 9000 --reload
```
*Wait until you see "Application startup complete". The first run downloads the Whisper model (~500MB - 1.5GB).*

### Terminal 2: Frontend
```bash
npm run dev
```

---

## 🎤 Usage

1.  Open `http://localhost:8080` in your browser.
2.  Go to **Settings (⚙️) > Weitere Features**.
3.  Click **"Mit Google verbinden"** and log in.
4.  Go back to the main page.
5.  Click the **Microphone** and say something like:
    > *"Erstelle ein Meeting morgen um 14 Uhr für Projektplanung"*
6.  Check the transcript and click **"Befehl ausführen"**.

Enjoy your Local AI Assistant! 🚀
