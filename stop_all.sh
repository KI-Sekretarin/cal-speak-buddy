#!/bin/bash

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping all CalSpeakBuddy services...${NC}"

# Function to kill process on port
kill_port() {
    local port=$1
    echo "Checking port $port..."
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${RED}Killing process $pid on port $port...${NC}"
        kill -9 $pid
    else
        echo -e "${GREEN}Port $port is already free.${NC}"
    fi
}

# 1. Stop Frontend (Port 8080)
kill_port 8080

# 2. Stop Whisper Server (Port 9000)
kill_port 9000

# 3. Stop Ollama Worker (Process name search)
echo "Checking for Ollama Worker..."
# We look for the node process running the worker index.ts
pkill -f "ts-node index.ts" && echo -e "${RED}Killed Ollama Worker process.${NC}" || echo -e "${GREEN}No Ollama Worker found.${NC}"

# 4. Stop Ollama (Optional - usually system wide, but we effectively stop the project usage)
# Uncomment the next line if you want to stop the Ollama server itself
# pkill ollama

echo -e "${GREEN}✅ All project services stopped.${NC}"
