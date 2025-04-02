#!/bin/bash

# Stop any running containers from the app
docker-compose down

# Build and start the containers in detached mode with a longer timeout
COMPOSE_HTTP_TIMEOUT=300 docker-compose up -d --build

# Show the running containers
docker ps

echo ""
echo "TheraStack Application is running!"
echo "Backend API: http://localhost:8000"
echo "Frontend: http://localhost:3001"
echo ""
echo "To view logs:"
echo "  Backend logs: docker logs -f ai_automation_app-backend-1"
echo "  Frontend logs: docker logs -f ai_automation_app-frontend-1"
echo ""
echo "To stop the application:"
echo "  docker-compose down"