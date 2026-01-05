# Infrastruktur & Technologie-Stack

Dieses Diagramm zeigt die komplette Architektur des **Cal-Speak-Buddy** / **KI Sekretärin** Projekts. Es ist optimiert für Präsentationen, um den Datenfluss und die verwendeten Technologien klar darzustellen.

## Kern-Komponenten

| Komponente | Technologie-Stack | Beschreibung |
|------------|-------------------|--------------|
| **Frontend** | React, Vite, TailwindCSS, Shadcn UI | Die Benutzeroberfläche für den Nutzer (Dashboard, Kalender, Einstellungen). Kommuniziert mit Supabase und dem lokalen Whisper Dienst. |
| **Whisper Service** | Python, FastAPI, Faster-Whisper | Ein lokaler API-Server (Port 9000), der Sprache in Text umwandelt und Befehle verarbeitet. Fungiert als "Gehirn" der Sprachsteuerung. |
| **Local LLM** | Ollama, Qwen 2.5 14B | Das lokal laufende KI-Modell, das die natürliche Sprache versteht, Befehle interpretiert und E-Mails kategorisiert. |
| **Ollama Worker** | Node.js, TypeScript | Ein Hintergrund-Dienst, der neue Datenbank-Einträge überwacht und sie mithilfe von Ollama automatisch verarbeitet/kategorisiert. |
| **Backend / DB** | Supabase (PostgreSQL) | Die zentrale Datenbank für Benutzerdaten, Einstellungen, Tickets und E-Mails. Beinhaltet auth & storage. |
| **Integrationen** | Google Calendar & Gmail API | Externe Dienste für die Kalenderverwaltung und das E-Mail-Scanning. |

---

## Infrastruktur-Diagramm

```mermaid
graph TD
    %% Styling Definitions
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef ai fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef db fill:#eceff1,stroke:#455a64,stroke-width:2px,stroke-dasharray:5,5

    %% Subgraph: User Device / Local Environment
    subgraph Local_Environment["💻 Lokale Umgebung (Mac)"]
        direction TB
        
        %% Frontend Node
        FE[("🖥️ Frontend (Vite/React)")\nPORT: 8080]:::frontend
        
        %% Backend Core Services
        subgraph Services ["Backend Services"]
            WS[("🎤 Whisper Service (FastAPI)")\nPORT: 9000\n(Python, Faster-Whisper)]:::backend
            OW[("⚙️ Ollama Worker")\n(Node.js Background Process)]:::backend
        end
        
        %% Local AI
        LLM[("🧠 Local LLM (Ollama)")\nPORT: 11434\nModel: Qwen 2.5 14B]:::ai
        
    end

    %% Subgraph: Cloud / External
    subgraph Cloud ["☁️ Externe Cloud Dienste"]
        SUP[("🗄️ Supabase Cloud")\n(PostgreSQL DB, Auth, Storage)]:::db
        G_CAL[("📅 Google Calendar API")]:::external
        G_MAIL[("📧 Gmail API")]:::external
    end

    %% Connections
    
    %% User Interaction
    FE -- "1. Audio / Befehle" --> WS
    FE -- "2. Daten laden (Tickets, Settings)" --> SUP
    FE -- "3. Auth (Login)" --> SUP

    %% Whisper Service Flows
    WS -- "4. Transkription (Audio -> Text)" --> WS
    WS -- "5. Intent Recognition (Text -> JSON)" --> LLM
    WS -- "6. Kalender Aktionen (CRUD)" --> G_CAL
    WS -- "7. E-Mail Scan" --> G_MAIL
    WS -- "8. Mail Inquiries speichern" --> SUP

    %% Ollama Worker Flows
    OW -- "9. Überwacht neue Inquiries" --> SUP
    OW -- "10. Kategorisierung anfragen" --> LLM
    OW -- "11. Update Labels/Status" --> SUP
    
    %% LLM Flows
    LLM -.-> WS
    LLM -.-> OW

```

## Detaillierter Datenfluss

1.  **Sprachsteuerung**: Der Nutzer spricht im Frontend. Das Audio wird an den **Whisper Service** (Python) gesendet.
2.  **Transkription**: Der Whisper Service nutzt `faster-whisper`, um Audio offline in Text umzuwandeln.
3.  **Verstehen (NLU)**: Der Text wird an **Ollama** gesendet. Das Modell (`qwen2.5:14b`) extrahiert die Absicht (z.B. "Termin um 14 Uhr erstellen").
4.  **Aktion**:
    *   **Kalender**: Der Whisper Service ruft die **Google Calendar API** auf, um den Termin einzutragen.
    *   **E-Mail**: Der Whisper Service (über `mail_agent.py`) ruft Mails von **Gmail** ab und speichert sie in **Supabase**.
5.  **Hintergrund-Verarbeitung**: Der **Ollama Worker** sieht neue E-Mails in Supabase, sendet den Inhalt zur Analyse an **Ollama** und speichert Tags/Kategorien (z.B. "Spam", "Wichtig") zurück in die Datenbank.
