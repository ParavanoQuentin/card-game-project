#!/bin/bash

# Card Game Full Stack with Logging

echo "🎮 Starting Card Game Full Stack with Logging..."

# Create logs directory if it doesn't exist
mkdir -p backend/logs

# Start the full stack (app + monitoring)
echo "🚀 Starting all services (Frontend, Backend, Grafana, Loki, Promtail, Redis)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ Full stack is ready!"
echo ""
echo "🔗 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Grafana: http://localhost:3010 (admin/admin123)"
echo "   Loki API: http://localhost:3100"
echo "   Redis: localhost:6379"
echo ""
echo "📝 To test the logging system:"
echo "   1. Play the game at http://localhost:3000"
echo "   2. Create games and perform actions"
echo "   3. Check Grafana for logs and metrics at http://localhost:3010"
echo ""
echo "🛑 To stop everything: docker-compose down"
