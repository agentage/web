# GitHub Secrets Setup Guide

To enable automated deployment via GitHub Actions, you need to configure the following secrets in your repository.

## Required Secrets

Go to your repository on GitHub:
`https://github.com/agentage/web/settings/secrets/actions`

Add these secrets:

### 1. SSH_HOST
The hostname or IP address of your deployment server.

**Value:** `dev.agentage.io` or your server's IP address

### 2. SSH_USERNAME
The SSH user for connecting to your server.

**Value:** Your server username (e.g., `root` or `ubuntu`)

### 3. SSH_PRIVATE_KEY
The private SSH key for authenticating to your server.

**How to get it:**
```bash
# On your local machine, display your private key:
cat ~/.ssh/id_rsa
# OR if you use ed25519:
cat ~/.ssh/id_ed25519

# Copy the entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

**Note:** Make sure this key is authorized on your server:
```bash
# On your server, check if the public key is in authorized_keys:
cat ~/.ssh/authorized_keys
```

### 4. SSH_PORT (Optional)
The SSH port if not using default port 22.

**Default:** `22`

## Verification

After adding secrets, you can verify them by:
1. Go to repository **Settings → Secrets and variables → Actions**
2. You should see all 3-4 secrets listed (values are hidden)
3. Push to `main` branch to trigger the workflow
4. Check **Actions** tab to see the deployment progress

## Server Prerequisites

Before deploying, ensure your server has:

1. **Docker & Docker Compose installed:**
   ```bash
   docker --version
   docker compose version
   ```

2. **Traefik running** (for production deployment with SSL):
   ```bash
   docker ps | grep traefik
   docker network ls | grep traefik-public
   ```

3. **Directory structure:**
   ```bash
   mkdir -p /opt/agentage
   cd /opt/agentage
   ```

4. **Environment file** (`.env`):
   ```bash
   # Create .env file on server
   cat > /opt/agentage/.env << EOF
   NODE_ENV=production
   DOMAIN=dev.agentage.io
   API_SUBDOMAIN=api
   EOF
   ```

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# 1. SSH to your server
ssh user@dev.agentage.io

# 2. Clone or pull the repository
cd /opt
git clone https://github.com/agentage/web.git agentage
cd agentage

# 3. Build images
docker build --target backend -t ghcr.io/agentage/web/backend:latest .
docker build --target frontend -t ghcr.io/agentage/web/frontend:latest .

# 4. Start services
docker compose up -d

# 5. Check status
docker compose ps
docker compose logs -f
```

## Testing the Deployment

After deployment, verify:

```bash
# Health check
curl https://api.dev.agentage.io/api/health

# Status check
curl https://api.dev.agentage.io/api/status

# Frontend
curl https://dev.agentage.io

# Check in browser
# - https://dev.agentage.io
# - https://dev.agentage.io/about
# - https://dev.agentage.io/status
```

## Troubleshooting

### Docker containers not starting:
```bash
docker compose logs backend
docker compose logs frontend
```

### Traefik not routing:
```bash
# Check Traefik dashboard (if enabled)
# Check labels on containers
docker inspect agentage-backend | grep -A 20 Labels
```

### SSL certificate issues:
```bash
# Check Traefik certificates
docker compose logs traefik | grep certificate
```

### Port conflicts:
```bash
# Check what's using ports 3000 and 3001
sudo lsof -i :3000
sudo lsof -i :3001
```
