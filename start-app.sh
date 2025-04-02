#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
  echo "Stopping servers..."
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null
  fi
  exit
}

# Register the cleanup function for when the script is terminated
trap cleanup SIGINT SIGTERM

echo "Starting TheraFlow AI Therapy App..."

# Start the backend server
echo "Starting Backend Server..."
cd backend
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
python main.py &
BACKEND_PID=$!
cd ..

# Start the frontend server
echo "Starting Frontend Server..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a bit for servers to start
sleep 3

echo "---------------------------------------------------"
echo "TheraFlow AI Therapy App is running!"
echo "---------------------------------------------------"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all servers"
echo "---------------------------------------------------"

# Keep the script running to allow for Ctrl+C to trigger cleanup
wait