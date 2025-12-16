# 📅 CalSpeakBuddy - Local AI Calendar Assistant

**🚀 [CLICK HERE FOR SETUP GUIDE (SETUP_GUIDE.md)](./SETUP_GUIDE.md)**

This project uses **Local AI (Ollama + Whisper)** to control your Google Calendar via voice and providing an AI Business Chat.

## Features
*   **Voice Commands**: Create, List, Update, and Delete events.
*   **AI Business Chat**: Chat with a customizable AI assistant trained on your company data.
*   **Company Profile**: Manage business details and product catalog for the AI.
*   **Local Privacy**: Speech processing (Whisper) and reasoning (Llama 3.2) run 100% locally.
*   **Google Integration**: Connects securely to your Google Calendar.
*   **Modern UI**: Built with React, Vite, and Shadcn UI.

## 🏗️ Infrastructure & Architecture

For a detailed overview of the project's infrastructure, components, and data flow, please refer to [INFRASTRUCTURE.md](./INFRASTRUCTURE.md).

## Quick Start

1.  **Clone** the repo.
2.  **Follow the [Setup Guide](./SETUP_GUIDE.md)** to install dependencies (Ollama, Python, Node.js).
3.  **Run**:
    *   Backend: `./restart_agent.sh` (in `services/whisper-server`)
    *   Frontend: `npm run dev`

## Technologies
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS
*   **Backend**: Python, FastAPI
*   **AI**: Faster-Whisper, Ollama (Llama 3.2)
