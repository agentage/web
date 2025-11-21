#!/bin/bash
set -e

echo "🚀 Starting Agentage Development Environment"
echo "============================================"

# Set environment variables for development
export NODE_ENV="development"
export PORT="3001"
export HOST="localhost"
export MONGODB_URI="mongodb://localhost:27017/agentage_dev"

# Frontend environment variables
export NEXT_PUBLIC_API_URL="http://localhost:3001"
export BACKEND_API_URL="http://localhost:3001"

# Check if MongoDB dev container is running on port 27017
if ! nc -z localhost 27017 2>/dev/null; then
    echo "🚀 Starting MongoDB for development..."
    docker compose -f docker-compose.dev.yml up -d mongodb-dev

    # Wait for MongoDB to be ready
    echo "⏳ Waiting for MongoDB..."
    for i in {1..30}; do
        if nc -z localhost 27017 2>/dev/null; then
            echo "✅ MongoDB ready!"
            break
        fi
        sleep 1
    done

    if ! nc -z localhost 27017 2>/dev/null; then
        echo "❌ MongoDB failed to start"
        exit 1
    fi
else
    echo "✅ MongoDB already running"
fi

# Load secrets from .env file if available (selectively, without overriding NODE_ENV)
if [[ -f ".env" ]]; then
    echo "📄 Loading secrets from .env file..."
    export $(grep -E "^(JWT_SECRET|JWT_EXPIRES_IN|GITHUB_CLIENT_ID|GITHUB_CLIENT_SECRET|GITHUB_CALLBACK_URL|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_CALLBACK_URL|MONGODB_URI|DATABASE_URL|MICROSOFT_CLIENT_ID|MICROSOFT_CLIENT_SECRET|MICROSOFT_CALLBACK_URL)=" .env | xargs) > /dev/null 2>&1
fi

# Build shared package first
echo "🔧 Building shared package..."
npm run build --workspace=@agentage/shared

echo ""
echo "🎯 Starting development servers..."
echo "  - MongoDB: mongodb://localhost:27017/agentage_dev"
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo ""

# Start backend and frontend concurrently
exec npx concurrently \
    --names "backend,frontend" \
    --prefix "[{name}]" \
    --prefix-colors "blue,green" \
    "npm run dev --workspace=@agentage/backend" \
    "npm run dev --workspace=@agentage/frontend"
