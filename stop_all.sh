#!/bin/bash

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping all Cal-Speak-Buddy services...${NC}"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${RED}Killing process $pid on port $port...${NC}"
        kill -9 $pid
    else
        echo -e "${GREEN}Port $port is already free.${NC}"
    fi
}

# 1. Stop Frontend (Port 5173)
kill_port 5173

# 2. Stop Whisper Server (Port 9000)
kill_port 9000

# 3. Stop Ollama Worker (Process name search)
echo "Checking for Ollama Worker..."
# We look for the node/tsx process running the worker
pkill -f "tsx index.ts" && echo -e "${RED}Killed Ollama Worker process.${NC}" || echo -e "${GREEN}No Ollama Worker found.${NC}"
pkill -f "node index.ts" && echo -e "${RED}Killed Ollama Worker process.${NC}"

# 4. Cleanup
echo -e "${GREEN}✅ All project services stopped.${NC}"
