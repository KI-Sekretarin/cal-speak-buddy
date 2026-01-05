# 🏗️ Infrastruktur & Tech Stack

## Tech Stack

### Frontend (Client)
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Animation**: Framer Motion
- **Charts**: Recharts

### Backend & Data
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime Channels
- **Storage**: Supabase Storage

### AI Services (Local)
- **LLM Runner**: Ollama (Running Llama 3.2 model)
- **Worker Service**: Node.js (`ollama-worker`) - Polls Supabase, calls Ollama.
- **Voice Service**: Python (`whisper-server`) - Runs OpenAI Whisper model locally.

### Infrastructure & DevOps
- **Local Dev**: `start_all.sh` orchestrates services.
- **Ports**:
  - Frontend: `8080`
  - Whisper API: `9000`
  - Ollama API: `11434`
  - Supabase Studio: `54323` (if local) / Cloud

---

## 🗺️ Infrastruktur-Diagramm

```mermaid
graph TD
    subgraph Client ["💻 Client (Browser)"]
        UI[React App (Port 8080)]
        Voice[Voice Input]
    end

    subgraph Backend ["☁️ Backend (Supabase)"]
        DB[(PostgreSQL DB)]
        Auth[Auth Service]
        Realtime[Realtime Engine]
    end

    subgraph LocalAI ["🤖 Local AI Station"]
        Worker[Node.js Ollama Worker]
        Ollama[Ollama API (Port 11434)]
        Whisper[Whisper Server (Port 9000)]
        
        subgraph Models
            Llama[Llama 3.2 Model]
            WModel[Whisper Base Model]
        end
    end

    %% Flow Connections
    UI -- "REST / Realtime" --> Backend
    UI -- "Audio Stream" --> Whisper
    Whisper -- "Transcribed Text" --> UI
    
    Worker -- "Polls Inquiries" --> Backend
    Worker -- "Updates Status/Response" --> Backend
    
    Worker -- "Generate Prompt" --> Ollama
    Ollama -- "Inference" --> Llama
    Ollama -- "Completion JSON" --> Worker

    %% Styling
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef ai fill:#fff3e0,stroke:#ff6f00,stroke-width:2px;
    
    class Client client;
    class Backend backend;
    class LocalAI ai;
```

## Datenfluss
1. **Anfrage**: Benutzer sendet Anfrage (via Form/Chat) -> Supabase DB.
2. **Kategorisierung**: `Ollama Worker` erkennt neue Zeile -> Holt Kontext -> Fragt `Ollama` -> Speichert Kategorie in DB.
3. **Antwort**: `Ollama Worker` generiert Antworttext -> Speichert Entwurf in DB.
4. **Anzeige**: Frontend empfängt Update via Realtime -> Zeigt Ergebnis an.
