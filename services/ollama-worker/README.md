# Local Ollama Worker

This worker connects your online Supabase database with your local Ollama AI to categorize inquiries automatically.

## Setup

1.  **Configure Environment**:
    Open `.env` in this directory and fill in your `SUPABASE_SERVICE_ROLE_KEY`.
    You can find this key in your Supabase Dashboard under Project Settings > API.

2.  **Install Dependencies** (already done):
    ```bash
    npm install
    ```

3.  **Start Ollama**:
    Make sure Ollama is running and the model is pulled:
    ```bash
    ollama serve
    ollama pull llama3.2
    ```

4.  **Run the Worker**:
    ```bash
    npm start
    ```

The worker will now poll your database every 5 seconds and categorize new inquiries.
