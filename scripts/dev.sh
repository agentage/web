#!/bin/bash
set -e

echo "🚀 Starting Agentage Development Environment"
echo "============================================"

# Set environment variables for development
export NODE_ENV="development"
export PORT="3001"
export HOST="localhost"

# Frontend environment variables
export NEXT_PUBLIC_API_URL="http://localhost:3001"
export BACKEND_API_URL="http://localhost:3001"

# Load secrets from .env file if available (selectively, without overriding NODE_ENV)
if [[ -f ".env" ]]; then
    echo "📄 Loading secrets from .env file..."
    export $(grep -E "^(JWT_SECRET|JWT_EXPIRES_IN|GITHUB_CLIENT_ID|GITHUB_CLIENT_SECRET|GITHUB_CALLBACK_URL|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_CALLBACK_URL|MONGODB_URL|DATABASE_URL)=" .env | xargs)
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
exec npx concurrently \
    --names "backend,frontend" \
    --prefix "[{name}]" \
    --prefix-colors "blue,green" \
    "npm run dev --workspace=@agentage/backend" \
    "npm run dev --workspace=@agentage/frontend"
