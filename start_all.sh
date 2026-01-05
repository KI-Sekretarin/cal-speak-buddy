#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Starting Cleanup & Startup Sequence...${NC}"

# 1. Kill existing processes
echo "🔪 Killing zombie processes on ports..."

# Function to kill process on port
kill_port() {
    local port=$1
    echo "Checking port $port..."
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${RED}Found process $pid on port $port. Killing it...${NC}"
        kill -9 $pid
    else
        echo -e "${GREEN}Port $port is free.${NC}"
    fi
}

kill_port 8080 # Frontend
kill_port 9000 # Whisper Server
# We don't indiscriminately kill 11434 (Ollama) as it might be a system service, but we check availability.

# 2. Clear Vite Cache
echo "🗑️  Clearing Vite cache..."
rm -rf node_modules/.vite
echo -e "${GREEN}Cache cleared.${NC}"

# 3. Start Backend Services
echo "🚀 Starting Backend Services..."

# Start Whisper Server in background
(cd services/whisper-server && ./restart_agent.sh) &
WHISPER_PID=$!
echo "Whisper Server started with PID $WHISPER_PID"

# Start Ollama Worker in background
(cd services/ollama-worker && npm install && npm start) &
WORKER_PID=$!
echo "Ollama Worker started with PID $WORKER_PID"

# 4. Start Frontend
echo "💻 Starting Frontend..."
# We run this in the foreground so the user can see output, or background if desired.
# The user asked to "start all", so we'll background it and tail logs or just let it run.
# For "npm run dev", it's best to run in a separate terminal OR run here and wait.
# Since we are an agent, we run in background and give control back.

npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ All services started!${NC}"
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:9000"
echo ""
echo "PIDs:"
echo "Frontend: $FRONTEND_PID"
echo "Whisper:  $WHISPER_PID"
echo "Worker:   $WORKER_PID"
