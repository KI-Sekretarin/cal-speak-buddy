
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// IDs from previous setup
const PAGE_ID = "2feac774-8cdb-8004-98f6-efc048b2af52";
const TASKS_DB_ID = "2feac774-8cdb-8120-a02e-f0f8c3d879f9";
const NOTES_DB_ID = "2feac774-8cdb-81ef-aa09-e87bb6fc8f5d";

const MERMAID_CHART = `graph TD
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
    class LocalAI ai;`;

async function enhanceDashboard() {
    console.log("🚀 Starting verification and enhancement of Dashboard...");

    try {
        // 1. Add Content to Dashboard Page
        console.log("📝 Adding content blocks to dashboard...");
        await notion.blocks.children.append({
            block_id: PAGE_ID,
            children: [
                {
                    object: "block",
                    type: "callout",
                    callout: {
                        rich_text: [{ type: "text", text: { content: "Welcome to Cal-Speak-Buddy HQ! This is your central command center." } }],
                        icon: { type: "emoji", emoji: "👋" },
                        color: "blue_background",
                    },
                },
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ type: "text", text: { content: "Quick Links" } }],
                    },
                },
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            { type: "text", text: { content: "Localhost App: " } },
                            { type: "text", text: { content: "http://localhost:8080", link: { url: "http://localhost:8080" } } },
                            { type: "text", text: { content: "\n" } },
                            { type: "text", text: { content: "Swagger API: " } },
                            { type: "text", text: { content: "http://localhost:9000/docs", link: { url: "http://localhost:9000/docs" } } },
                        ],
                    },
                },
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ type: "text", text: { content: "Tech Stack" } }],
                    },
                },
                {
                    object: "block",
                    type: "toggle",
                    toggle: {
                        rich_text: [{ type: "text", text: { content: "Frontend Stack" } }],
                        children: [
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "React 18 & Vite" } }] } },
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Tailwind CSS + Shadcn/UI for styling" } }] } },
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Framer Motion for animations" } }] } },
                        ]
                    },
                },
                {
                    object: "block",
                    type: "toggle",
                    toggle: {
                        rich_text: [{ type: "text", text: { content: "Backend & Data" } }],
                        children: [
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Supabase (PostgreSQL, Auth, Realtime)" } }] } },
                        ]
                    },
                },
                {
                    object: "block",
                    type: "toggle",
                    toggle: {
                        rich_text: [{ type: "text", text: { content: "Local AI" } }],
                        children: [
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Ollama (Llama 3.2)" } }] } },
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Whisper (Speech-to-Text)" } }] } },
                        ]
                    },
                },
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ type: "text", text: { content: "Infrastructure Diagram" } }],
                    },
                },
                {
                    object: "block",
                    type: "code",
                    code: {
                        caption: [],
                        rich_text: [{ type: "text", text: { content: MERMAID_CHART } }],
                        language: "mermaid"
                    }
                }
            ],
        });

        console.log("✅ Added Dashboard Content");

        // 2. Populate Tasks
        const completedTasks = [
            { name: "Setup React Project with Vite", priority: "High" },
            { name: "Configure Supabase Auth & Database", priority: "High" },
            { name: "Implement Authentication (Login/Register)", priority: "High" },
            { name: "Integrate Whisper Service (Local Python)", priority: "High" },
            { name: "Build Ollama Worker (Node.js)", priority: "High" },
            { name: "Implement UI Glassmorphism Design", priority: "Medium" },
            { name: "Setup Realtime Inquiries Updates", priority: "Medium" },
        ];

        const todoTasks = [
            { name: "Refine Voice Interaction (Fix Sticky Sentences)", priority: "High", status: "In Progress" },
            { name: "Expand Knowledge Base for AI", priority: "Medium", status: "To Do" },
            { name: "Dockerize Services (Optional)", priority: "Low", status: "To Do" },
        ];

        console.log("📋 Populating 'Tasks' database...");

        for (const task of completedTasks) {
            await notion.pages.create({
                parent: { database_id: TASKS_DB_ID },
                icon: { type: "emoji", emoji: "✅" },
                properties: {
                    Name: { title: [{ text: { content: task.name } }] },
                    Status: { select: { name: "Done" } },
                    Priority: { select: { name: task.priority } },
                }
            });
        }

        for (const task of todoTasks) {
            await notion.pages.create({
                parent: { database_id: TASKS_DB_ID },
                icon: { type: "emoji", emoji: "🚧" },
                properties: {
                    Name: { title: [{ text: { content: task.name } }] },
                    Status: { select: { name: task.status } },
                    Priority: { select: { name: task.priority } },
                }
            });
        }
        console.log("✅ Populated Tasks");

        // 3. Populate Notes
        console.log("📓 Populating 'Notes' database...");
        await notion.pages.create({
            parent: { database_id: NOTES_DB_ID },
            icon: { type: "emoji", emoji: "📜" },
            properties: {
                Name: { title: [{ text: { content: "Project Requirements & Specifications" } }] },
                Type: { select: { name: "Reference" } },
                Date: { date: { start: new Date().toISOString().split('T')[0] } }
            },
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: "See FEATURES.md for full details." } }]
                    }
                }
            ]
        });
        console.log("✅ Populated Notes");

        console.log("\n🎉 Dashboard enhancement complete!");

    } catch (error) {
        console.error("Error enhancing dashboard:", error);
    }
}

enhanceDashboard();
