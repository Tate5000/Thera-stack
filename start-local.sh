#!/bin/bash
set -e

# Configuration
MODE=$1 # "dev" or "test" or "both"

if [ "$MODE" != "dev" ] && [ "$MODE" != "test" ] && [ "$MODE" != "both" ]; then
    echo "Usage: $0 [dev|test|both]"
    echo "  dev: Start the application in development mode"
    echo "  test: Run tests"
    echo "  both: Run tests then start in development mode"
    exit 1
fi

# Function to start application in development mode
start_dev() {
    echo "Starting application in development mode..."
    
    # Check if Docker is installed and running
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            echo "Starting with Docker..."
            docker-compose up -d
            echo "Application started! Frontend: http://localhost:3000, Backend: http://localhost:8000"
            return
        fi
    fi
    
    # Fallback to starting without Docker
    echo "Docker not available. Starting services directly..."
    
    # Start backend
    echo "Starting backend..."
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    echo "Starting frontend..."
    cd frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo "Application started! Frontend: http://localhost:3000, Backend: http://localhost:8000"
    echo "Press Ctrl+C to stop"
    
    # Wait for Ctrl+C
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Function to run tests
run_tests() {
    echo "Running tests..."
    
    # Backend tests
    echo "Running backend tests..."
    cd backend
    pip install -r requirements.txt
    cd ..
    pytest tests/unit/backend tests/integration
    
    # Frontend tests
    echo "Running frontend tests..."
    cd frontend
    npm install
    npm run test
    cd ..
    
    echo "All tests completed!"
}

# Main execution
if [ "$MODE" == "test" ] || [ "$MODE" == "both" ]; then
    run_tests
fi

if [ "$MODE" == "dev" ] || [ "$MODE" == "both" ]; then
    start_dev
fi