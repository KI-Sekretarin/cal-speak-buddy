#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Starting Cal-Speak-Buddy Cleanup & Startup Sequence...${NC}"

# Create logs directory
mkdir -p logs

# 1. Kill existing processes
echo "🔪 Killing zombie processes on ports..."

kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${RED}Found process on port $port. Killing $pid...${NC}"
        kill -9 $pid
    fi
}

kill_port 5173 # Frontend (Vite Default)
kill_port 9000 # Whisper Server

# 2. Clear Vite Cache
echo "🗑️  Clearing Vite cache..."
rm -rf node_modules/.vite

# 3. Start Backend Services
echo -e "${CYAN}🚀 Starting Backend Services...${NC}"

# Start Whisper Server
if [ -d "services/whisper-server" ]; then
    echo "Starting Whisper Server (Logging to logs/whisper.log)..."
    (cd services/whisper-server && ./restart_agent.sh) > logs/whisper.log 2>&1 &
    WHISPER_PID=$!
else
    echo -e "${RED}Whisper server directory not found.${NC}"
fi

# Start Ollama Worker
if [ -d "services/ollama-worker" ]; then
    echo "Starting Ollama Worker (Logging to logs/worker.log)..."
    (cd services/ollama-worker && npx tsx index.ts) > logs/worker.log 2>&1 &
    WORKER_PID=$!
else
    echo -e "${RED}Ollama worker directory not found.${NC}"
fi

# 4. Start Frontend
echo -e "${CYAN}💻 Starting Frontend on http://localhost:5173...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ All services started!${NC}"
echo "--------------------------------"
echo "Frontend: http://localhost:5173"
echo "Whisper:  http://localhost:9000"
echo "--------------------------------"
echo "Check /logs directory for details."
echo "PIDs: Frontend:$FRONTEND_PID, Whisper:$WHISPER_PID, Worker:$WORKER_PID"
