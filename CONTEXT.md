# 🤖 Cal-Speak-Buddy: AI Context & Architecture

This document is designed to provide rapid context to **AI Agent Managers** and developers about the project structure, capabilities, and infrastructure.

## 🎯 Project Overview

**Cal-Speak-Buddy** is an intelligent, local-first calendar assistant for businesses. It uses local LLMs (Llama 3.2, Qwen 2.5) and local Speech-to-Text (Faster-Whisper) to interact with Google Calendar and manage business inquiries.

## 🏗️ key Infrastructure

*   **Frontend**: React (Vite) + TypeScript + Shadcn UI.
*   **Backend**: Python (FastAPI) for Whisper Server.
*   **AI Worker**: Node.js worker for handling Ollama inference and Supabase queue processing.
*   **Database**: Supabase (PostgreSQL) for storing tickets, users, and company profiles.
*   **Local AI**: Ollama (running Llama 3.2 or Qwen 2.5) + Faster-Whisper.

## 📂 Directory Structure

*   **/src**: Frontend source code (pages, components, hooks).
*   **/services**: Backend services.
    *   `/whisper-server`: Python FastAPI server for local transcription.
    *   `/ollama-worker`: Node.js worker that polls Supabase for new tasks and runs Ollama inference.
*   **/supabase**: Database migrations and configuration.

## 🔑 Key Features for Agents to Know

1.  **Ticket System**: The core logic revolves around "Tickets" (inquiries). Agents should look at `src/components/dashboard` to understand how these are visualized.
2.  **Voice Command**: Implemented via `Whisper`. The frontend records audio, sends it to `localhost:9000`, receiving text back.
3.  **RAG / Knowledge**: The system uses a company profile (in Supabase) to generate context-aware answers.

## 🚀 Deployment & Handoff

*   **Startup**: ` ./start_all.sh` is the single source of truth for starting the dev environment.
*   **Docs**:
    *   `SETUP_GUIDE.md`: For detailed installation steps.
    *   `INFRASTRUCTURE.md`: For deep dive into data flow.
    *   `FEATURES.md`: For a list of user-facing features.
