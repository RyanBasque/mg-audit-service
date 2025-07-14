#!/bin/bash

# Script para desenvolvimento com hot reload

echo "🛠️  Starting Mini Gateway Audit Service in Development Mode..."

# Verificar se existe .env
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Iniciar serviços em modo desenvolvimento
echo "🚀 Starting development services..."
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "🛑 To stop development services: docker-compose -f docker-compose.dev.yml down"
