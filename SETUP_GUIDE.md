# 🚀 Cal-Speak-Buddy Setup Guide

This guide will help you set up the **Cal-Speak-Buddy** project from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18 or higher) & **npm**
2.  **Python** (3.10 or higher)
3.  **Ollama** (for local AI)
    *   Download from [ollama.com](https://ollama.com)
    *   Pull the required models:
        ```bash
        ollama pull llama3.2
        ollama pull qwen2.5:14b
        ```
    *   *Note: Ensure Ollama is running in the background.*
4.  **Supabase** (Optional/Remote)
    *   The project is configured to use a remote Supabase instance. Ensure you have the `.env` file with the correct credentials.

## 🛠️ Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd cal-speak-buddy
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend (Whisper) Dependencies:**
    ```bash
    cd services/whisper-server
    # It is recommended to use a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    cd ../..
    ```

4.  **Install Ollama Worker Dependencies:**
    ```bash
    cd services/ollama-worker
    npm install
    cd ../..
    ```

## 🚀 Starting the Application

We have provided a unified startup script for convenience.

### Mac/Linux
Run the following command in the root directory:

```bash
./start_all.sh
```

This script will:
1.  Kill any zombie processes on ports 8080 (Frontend) and 9000 (Whisper).
2.  Clear Vite cache to ensure a clean build.
3.  Start the **Whisper Server** (Speech-to-Text).
4.  Start the **Ollama Worker** (AI Logic).
5.  Start the **Frontend** (React App).

### Windows
Please refer to `WHISPER_ANLEITUNG.md` for detailed PowerShell instructions, or manually start the services in separate terminals:

1.  **Whisper Server:** `cd services/whisper-server && python server.py`
2.  **Ollama Worker:** `cd services/ollama-worker && npm start`
3.  **Frontend:** `npm run dev`

## 🌐 Accessing the App

*   **Frontend:** [http://localhost:8080](http://localhost:8080)
*   **API/Swagger:** [http://localhost:9000/docs](http://localhost:9000/docs)

## 🐛 Troubleshooting

*   **"Port already in use"**: The `start_all.sh` script attempts to free ports. If it fails, manually find the process using `lsof -i :<port>` and kill it.
*   **Ollama connection failed**: Ensure Ollama is running (`ollama serve`).
*   **Missing Dependencies**: Re-run the installation steps above.
