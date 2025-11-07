# GitHub Secrets Setup Guide

To enable automated deployment via GitHub Actions, you need to configure environment-specific secrets and variables using **GitHub Environments**.

## Setup GitHub Environment

GitHub Environments allow you to configure deployment protection rules and environment-specific secrets/variables.

### Step 1: Create Environment

1. Go to your repository on GitHub
2. Navigate to: `https://github.com/agentage/web/settings/environments`
3. Click **New environment**
4. Name it: `development` (this matches the workflow configuration)
5. Click **Configure environment**

### Step 2: Add Environment Variables and Secrets

In the environment configuration page, add the following:

In the environment configuration page, add the following:

#### Environment Variables (publicly visible)

These are non-sensitive configuration values that can be visible in logs:

##### SSH_HOST
**Type:** Variable  
**Value:** `dev.agentage.io` or your server's IP address  
**Description:** The hostname or IP address of your deployment server

##### SSH_USERNAME  
**Type:** Variable  
**Value:** Your server username (e.g., `root` or `ubuntu`)  
**Description:** The SSH user for connecting to your server

##### SSH_PORT (Optional)
**Type:** Variable  
**Value:** `22` (default)  
**Description:** The SSH port if not using default port 22

#### Environment Secrets (encrypted)

These are sensitive values that will be encrypted and never shown in logs:

##### SSH_PRIVATE_KEY
**Type:** Secret  
**Description:** The private SSH key for authenticating to your server

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

### Step 3: Save Configuration

Click **Save protection rules** to save your environment configuration.

## Alternative: Repository-Level Secrets (Not Recommended)

If you prefer not to use environments, you can add secrets at the repository level, but you'll need to modify the workflow file:

Go to: `https://github.com/agentage/web/settings/secrets/actions`

Add the same secrets/variables listed above, then update `.github/workflows/deploy.yml` to remove the `environment: development` line from the deploy job.

## Verification

After adding secrets and variables, you can verify them by:
1. Go to repository **Settings → Environments → development**
2. You should see all variables and secrets listed (secret values are hidden)
3. Push to `main` branch to trigger the workflow
4. Check **Actions** tab to see the deployment progress

## Multiple Environments (Optional)

You can create additional environments for production:

1. Create a new environment named `production`
2. Add the same variables/secrets with production values:
   - `SSH_HOST`: `agentage.io` (or production server)
   - `SSH_USERNAME`: production server user
   - `SSH_PRIVATE_KEY`: production SSH key
3. Optionally add **Protection rules**:
   - Required reviewers before deployment
   - Wait timer before deployment
   - Deployment branches (e.g., only `main` or `production` branch)

Then modify your workflow to support multiple environments:

```yaml
on:
  push:
    branches:
      - main  # triggers development
      - production  # triggers production
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - development
          - production

jobs:
  deploy:
    environment: ${{ github.event_name == 'workflow_dispatch' && inputs.environment || (github.ref == 'refs/heads/production' && 'production' || 'development') }}
    # ... rest of the job
```

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
