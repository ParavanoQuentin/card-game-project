#!/bin/bash

# Aether Beasts Development Startup Script

echo "🚀 Starting Aether Beasts Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if netstat -an | grep ":$1 " > /dev/null 2>&1; then
        echo -e "${YELLOW}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}Starting Backend Server...${NC}"
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}Backend starting on port 3001...${NC}"
    npm run dev &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}Starting Frontend Server...${NC}"
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}Frontend starting on port 3000...${NC}"
    npm start &
    FRONTEND_PID=$!
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${RED}Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Check if ports are available
if ! check_port 3001; then
    echo -e "${RED}Backend port 3001 is in use. Please stop the existing process.${NC}"
    exit 1
fi

if ! check_port 3000; then
    echo -e "${RED}Frontend port 3000 is in use. Please stop the existing process.${NC}"
    exit 1
fi

# Start services
start_backend
start_frontend

echo -e "\n${GREEN}🎮 Aether Beasts is starting up!${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend API: http://localhost:3001${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for user interrupt
wait
