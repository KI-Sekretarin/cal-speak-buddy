
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// IDs from previous setup
const PAGE_ID = "2feac774-8cdb-8004-98f6-efc048b2af52";
const TASKS_DB_ID = "2feac774-8cdb-8120-a02e-f0f8c3d879f9";
const NOTES_DB_ID = "2feac774-8cdb-81ef-aa09-e87bb6fc8f5d";

// FIXED Mermaid Chart with Quotes
const MERMAID_CHART = `graph TD
    subgraph Client ["💻 Client (Browser)"]
        UI["React App (Port 8080)"]
        Voice["Voice Input"]
    end

    subgraph Backend ["☁️ Backend (Supabase)"]
        DB[("PostgreSQL DB")]
        Auth["Auth Service"]
        Realtime["Realtime Engine"]
    end

    subgraph LocalAI ["🤖 Local AI Station"]
        Worker["Node.js Ollama Worker"]
        Ollama["Ollama API (Port 11434)"]
        Whisper["Whisper Server (Port 9000)"]
        
        subgraph Models
            Llama["Llama 3.2 Model"]
            WModel["Whisper Base Model"]
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

async function rebuildDashboard() {
    console.log("💎 Starting Premium Dashboard Rebuild (v2 w/ Fixes)...");

    try {
        // 1. Add Divider and V2 Header
        console.log("🎨 Adding Premium Content Blocks...");
        await notion.blocks.children.append({
            block_id: PAGE_ID,
            children: [
                { object: "block", type: "divider", divider: {} },
                {
                    object: "block",
                    type: "heading_1",
                    heading_1: {
                        rich_text: [{ type: "text", text: { content: "✨ Dashboard V2.0" } }],
                        color: "blue"
                    }
                },
                // Hero Section
                {
                    object: "block",
                    type: "callout",
                    callout: {
                        rich_text: [
                            { type: "text", text: { content: "“The best way to predict the future is to create it.”\n\n" }, annotations: { italic: true } },
                            { type: "text", text: { content: "Current Focus: " }, annotations: { bold: true } },
                            { type: "text", text: { content: "Refining Voice Interactions & UI Polish" }, annotations: { code: true, color: "red" } }
                        ],
                        icon: { type: "emoji", emoji: "🚀" },
                        color: "gray_background",
                    },
                },

                // Project Status Board
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ type: "text", text: { content: "📊 Project Status" } }],
                    }
                },
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            { type: "text", text: { content: "Sprint: " }, annotations: { bold: true } },
                            { type: "text", text: { content: "v0.5 Beta  " } },
                            { type: "text", text: { content: " |  " }, annotations: { color: "gray" } },
                            { type: "text", text: { content: "Deadline: " }, annotations: { bold: true } },
                            { type: "text", text: { content: "Feb 28, 2026  " } },
                            { type: "text", text: { content: " |  " }, annotations: { color: "gray" } },
                            { type: "text", text: { content: "Health: " }, annotations: { bold: true } },
                            { type: "text", text: { content: "🟢 On Track" } },
                        ]
                    }
                },

                // The Brain Section
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ type: "text", text: { content: "🧠 The Brain (Knowledge Base)" } }],
                    }
                },
                {
                    object: "block",
                    type: "toggle",
                    toggle: {
                        rich_text: [{ type: "text", text: { content: "🔌 API Endpoints (Swagger)" } }],
                        children: [
                            { object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Base URL: http://localhost:9000" }, annotations: { code: true } }] } },
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "/v1/transcribe" }, annotations: { bold: true } }, { type: "text", text: { content: " - POST audio file" } }] } },
                            { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "/v1/status" }, annotations: { bold: true } }, { type: "text", text: { content: " - GET system health" } }] } },
                        ]
                    }
                },
                {
                    object: "block",
                    type: "toggle",
                    toggle: {
                        rich_text: [{ type: "text", text: { content: "🔑 Environment Variables" } }],
                        children: [
                            { object: "block", type: "code", code: { language: "bash", rich_text: [{ type: "text", text: { content: "VITE_SUPABASE_URL=...\nVITE_SUPABASE_PUBLISHABLE_KEY=..." } }] } },
                            { object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "⚠️ Never commit real keys to Git!" }, annotations: { color: "red", bold: true } }] } },
                        ]
                    }
                },

                // Infrastructure Map
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ type: "text", text: { content: "🏗️ Infrastructure Map (Fixed)" } }],
                    }
                },
                {
                    object: "block",
                    type: "code",
                    code: {
                        caption: [{ type: "text", text: { content: "System Architecture V1" } }],
                        rich_text: [{ type: "text", text: { content: MERMAID_CHART } }],
                        language: "mermaid"
                    }
                }
            ],
        });

        console.log("✅ Added Premium Content");

        // 2. Add More Tasks
        console.log("📋 Adding Sprint Tasks...");
        const additionalTasks = [
            { name: "Fix Mermaid Syntax in Dashboard", priority: "High", status: "Done" },
            { name: "Implement Premium V2 Design", priority: "High", status: "Done" },
            { name: "Deploy to Production", priority: "Medium", status: "To Do" },
            { name: "User Acceptance Testing (UAT)", priority: "Medium", status: "To Do" },
        ];

        for (const task of additionalTasks) {
            await notion.pages.create({
                parent: { database_id: TASKS_DB_ID },
                icon: { type: "emoji", emoji: task.status === "Done" ? "✅" : "📌" },
                properties: {
                    Name: { title: [{ text: { content: task.name } }] },
                    Status: { select: { name: task.status } },
                    Priority: { select: { name: task.priority } },
                }
            });
        }

        // 3. Add Standup Note
        console.log("📓 Adding Daily Standup Note...");
        await notion.pages.create({
            parent: { database_id: NOTES_DB_ID },
            icon: { type: "emoji", emoji: "🗣️" },
            properties: {
                Name: { title: [{ text: { content: "Daily Standup - Feb 05" } }] },
                Type: { select: { name: "Meeting" } },
                Date: { date: { start: new Date().toISOString().split('T')[0] } }
            },
            children: [
                { object: 'block', type: 'to_do', to_do: { rich_text: [{ type: 'text', text: { content: "Discuss Mermaid Syntax Fix" } }], checked: true } },
                { object: 'block', type: 'to_do', to_do: { rich_text: [{ type: 'text', text: { content: "Review V2 Dashboard Design" } }], checked: true } },
            ]
        });

        console.log("\n🎉 Premium Dashboard Rebuild Complete!");

    } catch (error) {
        console.error("Error rebuilding dashboard:", error);
    }
}

rebuildDashboard();
