# Agentage.io - Web Platform

> Deployment verification setup for Agentage AI Agent Platform

## 🎯 Purpose

This is a minimal deployment verification setup to test the infrastructure on `dev.agentage.io`. It includes:
- ✅ Frontend (Next.js 14) - Landing, About, and Status pages
- ✅ Backend (Express.js) - Health and status API endpoints
- ✅ Multi-container Docker setup
- ✅ GitHub Actions CI/CD
- ✅ Production-ready deployment configuration

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development servers (both frontend and backend)
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/api/health
```

### Build for Production

```bash
# Build all packages
npm run build

# Test production build locally
docker compose build
docker compose up
```

## 📦 Project Structure

```
web/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   ├── backend/         # Express.js API (status endpoints)
│   └── frontend/        # Next.js application
├── .github/workflows/   # GitHub Actions CI/CD
├── Dockerfile           # Multi-stage build
├── docker-compose.yml   # Container orchestration
└── .env.example         # Environment template
```

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Infrastructure**: Docker, Docker Compose, Traefik
- **CI/CD**: GitHub Actions
- **Deployment**: Hetzner Cloud, Docker Swarm

## 📋 API Endpoints

### Backend (Port 3001)
- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/status` - Detailed system status

### Frontend (Port 3000)
- `/` - Landing page
- `/about` - About page
- `/status` - System status page

## 🚀 Deployment

### Prerequisites
- Hetzner server with Docker Swarm
- Traefik reverse proxy configured
- DNS records pointing to server
- GitHub repository secrets configured

### GitHub Secrets Required
- `SSH_HOST` - Server IP or domain
- `SSH_USERNAME` - SSH user (e.g., deploy)
- `SSH_PRIVATE_KEY` - Private SSH key
- `SSH_PORT` - SSH port (default: 22)

### Deploy via GitHub Actions

Push to `main` branch:
```bash
git add .
git commit -m "feat: deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker images
2. Push to GitHub Container Registry (ghcr.io)
3. SSH to server and deploy

### Manual Deployment

```bash
# Build images
docker build --target backend -t ghcr.io/agentage/web/backend:latest .
docker build --target frontend -t ghcr.io/agentage/web/frontend:latest .

# Push to registry
docker push ghcr.io/agentage/web/backend:latest
docker push ghcr.io/agentage/web/frontend:latest

# Deploy on server
ssh deploy@dev.agentage.io
cd /opt/agentage/web
docker compose pull
docker compose up -d
```

## 🔍 Verification

After deployment, verify:

```bash
# Check SSL
curl -I https://dev.agentage.io

# Check backend health
curl https://dev.agentage.io/api/health

# Check backend status
curl https://dev.agentage.io/api/status | jq

# Check containers
ssh deploy@dev.agentage.io "cd /opt/agentage/web && docker compose ps"

# Check logs
ssh deploy@dev.agentage.io "cd /opt/agentage/web && docker compose logs --tail=50"
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development servers |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run type-check` | TypeScript type checking |
| `npm run clean` | Clean build artifacts |

## 📝 Environment Variables

### Development (.env)
```bash
FRONTEND_FQDN=dev.agentage.io
API_FQDN=api-dev.agentage.io
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production
```bash
FRONTEND_FQDN=dev.agentage.io
API_FQDN=api-dev.agentage.io
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://dev.agentage.io/api
BACKEND_API_URL=http://backend:3001
```

## 🎯 Next Steps

Once deployment is verified:
1. Add MongoDB database
2. Implement authentication
3. Build agent registry features
4. Add more pages and functionality

## 📚 Documentation

- [Deployment Verification Plan](docs/deployment-verification-plan.md)
- [Agentage Requirements](https://github.com/agentage/requirements)

## 🤝 Contributing

This is a minimal verification setup. For the full platform, see the [requirements repository](https://github.com/agentage/requirements).

## 📄 License

MIT © 2025 Agentage Contributors
