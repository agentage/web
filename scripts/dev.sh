#!/bin/bash
set -e

echo "🚀 Starting Agentage Development Environment"
echo "============================================"

# Set environment variables
export NODE_ENV="development"
export PORT="3001"
export HOST="localhost"

# Frontend environment variables
export NEXT_PUBLIC_API_URL="http://localhost:3001"
export BACKEND_API_URL="http://localhost:3001"

# Check if .env file exists and load additional variables
if [[ -f ".env" ]]; then
    echo "📄 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Build shared package first
echo "🔧 Building shared package..."
npm run build --workspace=@agentage/shared

echo ""
echo "🎯 Starting development servers..."
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo ""

# Start backend and frontend concurrently
exec concurrently \
    --names "backend,frontend" \
    --prefix "[{name}]" \
    --prefix-colors "blue,green" \
    "npm run dev --workspace=@agentage/backend" \
    "npm run dev --workspace=@agentage/frontend"
