#!/bin/bash

# Script para limpeza completa do ambiente Docker

echo "🧹 Cleaning up Mini Gateway Audit Service Docker environment..."

# Parar e remover containers
echo "🛑 Stopping containers..."
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Remover volumes (CUIDADO: isso apagará todos os dados do banco!)
read -p "❓ Do you want to remove volumes (this will delete all database data)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing volumes..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
fi

# Remover imagens relacionadas
read -p "❓ Do you want to remove Docker images? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing images..."
    docker rmi mg-audit-service:latest 2>/dev/null || true
    docker rmi $(docker images | grep mg-audit-service | awk '{print $3}') 2>/dev/null || true
fi

# Limpeza geral do Docker
read -p "❓ Do you want to run Docker system prune? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Running Docker system prune..."
    docker system prune -f
fi

echo "✅ Cleanup completed!"
