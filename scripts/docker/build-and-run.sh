#!/bin/bash

# Script para build e deploy em produção

echo "🚀 Building Mini Gateway Audit Service for Production..."

# Build da imagem Docker
echo "📦 Building Docker image..."
docker build -t mg-audit-service:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"

    # Iniciar serviços
    echo "🚀 Starting services..."
    docker-compose up -d

    if [ $? -eq 0 ]; then
        echo "✅ Services started successfully!"
        echo ""
        echo "📊 Service URLs:"
        echo "   - Audit Service: http://localhost:3002"
        echo "   - Audit Health: http://localhost:3002/audit/health"
        echo "   - RabbitMQ Management: http://localhost:15672 (user: rabbitmq_user, pass: rabbitmq_password)"
        echo "   - PgAdmin: http://localhost:8080 (user: admin@example.com, pass: admin123)"
        echo ""
        echo "📝 To view logs: docker-compose logs -f mg-audit-service"
        echo "🛑 To stop: docker-compose down"
    else
        echo "❌ Failed to start services!"
        exit 1
    fi
else
    echo "❌ Failed to build Docker image!"
    exit 1
fi
