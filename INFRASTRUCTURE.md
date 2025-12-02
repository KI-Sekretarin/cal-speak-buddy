# Infrastructure Diagram

This diagram illustrates the infrastructure and data flow of the **Cal Speak Buddy** project.

```mermaid
graph TD
    subgraph Client ["User Device (Browser)"]
        UI[React Frontend]
        Mic[Microphone]
    end

    subgraph Local_Machine ["Local Machine (Dev Environment)"]
        subgraph Backend_Speech ["Speech Service (Python)"]
            FastAPI[FastAPI Server Port 9000]
            Whisper[Faster-Whisper Model]
        end

        subgraph Backend_AI ["AI Worker (Node.js)"]
            Worker[Ollama Worker]
        end

        subgraph AI_Engine ["AI Engine"]
            Ollama[Ollama Service Port 11434]
            Llama[Llama 3.2 Model]
        end
    end

    subgraph Cloud_Services ["Cloud Services"]
        subgraph Supabase_Cloud ["Supabase"]
            Auth[Authentication]
            DB[(PostgreSQL DB)]
            Storage[File Storage]
            Realtime[Realtime API]
        end

        subgraph Google_Cloud ["Google Cloud"]
            GCal[Google Calendar API]
        end
    end

    subgraph External_Automation ["Automation"]
        n8n[n8n Workflow Automation]
    end

    %% Data Flow Connections
    Mic -->|Audio Stream| UI
    UI -->|Audio File Upload| FastAPI
    FastAPI -->|Transcribe| Whisper
    Whisper -->|Text Transcript| FastAPI
    FastAPI -->|Transcript JSON| UI

    UI -->|Read/Write Data| DB
    UI -->|Auth Request| Auth
    UI -->|Direct API Call| GCal
    UI -.->|Webhook| n8n

    Worker -->|Polls for Tasks| DB
    Worker -->|Update Result| DB
    Worker -->|Generate Prompt| Ollama
    Ollama -->|Inference| Llama
    Llama -->|Response| Ollama
    Ollama -->|JSON Response| Worker

    %% Realtime updates
    Realtime -.->|Notify Updates| UI
    DB -.->|Trigger Event| Realtime

    %% Styling
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef local fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef cloud fill:#e0f2f1,stroke:#004d40,stroke-width:2px;
    classDef db fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;

    class UI,Mic client;
    class FastAPI,Whisper,Worker,Ollama,Llama local;
    class Auth,Storage,Realtime,GCal cloud;
    class DB db;
```

## Component Description

### 1. Client (Frontend)
- **React + Vite**: The main user interface running in the browser.
- **Microphone**: Captures user voice commands.
- **Direct Integrations**: Communicates directly with Supabase (for data) and Google Calendar (via OAuth).

### 2. Speech Service (Python)
- **FastAPI**: Exposes an API on port 9000.
- **Faster-Whisper**: Runs locally to transcribe audio to text with high accuracy.
- **Flow**: Receives audio from frontend -> Transcribes -> Returns text.

### 3. AI Worker (Node.js)
- **Ollama Worker**: A background service that polls the Supabase database for new inquiries or tasks.
- **Logic**: It picks up tasks, sends prompts to the local Ollama instance, and saves the AI-generated response back to the database.

### 4. AI Engine (Local)
- **Ollama**: Runs the Llama 3.2 model locally on port 11434.
- **Privacy**: All reasoning happens locally; no data is sent to external AI providers (like OpenAI).

### 5. Cloud Services
- **Supabase**: Acts as the backend-as-a-service.
    - **PostgreSQL**: Stores user profiles, inquiries, and application state.
    - **Auth**: Handles user login and session management.
    - **Realtime**: Pushes updates to the frontend when the AI Worker completes a task.
- **Google Calendar**: Accessed directly by the frontend using the user's OAuth token to manage events.
