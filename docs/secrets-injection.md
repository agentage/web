# Secrets Injection During Deployment

This document explains how application secrets are injected during deployment via the CI/CD pipeline.

## Overview

The application uses a secure secrets injection pattern that:
1. Stores secrets as JSON in GitHub Secrets
2. Converts them to environment variables during deployment
3. Injects them into Docker services via `.env` files

This approach follows the same pattern as the example project in `/example`.

## Secret Configuration Files

### Local Development

For local development, use `app-secrets.local.json`:

```json
{
  "oauth": {
    "github": {
      "client_id": "your_github_oauth_app_client_id",
      "client_secret": "your_github_oauth_app_client_secret"
    },
    "microsoft": {
      "client_id": "your_microsoft_app_client_id",
      "client_secret": "your_microsoft_app_client_secret"
    },
    "google": {
      "client_id": "your_google_oauth_client_id.googleusercontent.com",
      "client_secret": "your_google_oauth_client_secret"
    }
  },
  "mongodb_uri": "mongodb://mongodb:27017/agentage",
  "jwt_secret": "your_jwt_secret_key_min_32_characters",
  "jwt_expires_in": "7d",
  "github_callback_url": "http://localhost:3000/api/auth/github/callback",
  "google_callback_url": "http://localhost:3000/api/auth/google/callback",
  "microsoft_callback_url": "http://localhost:3000/api/auth/microsoft/callback",
  "frontend_fqdn": "localhost:3000",
  "api_fqdn": "localhost:3001"
}
```

### Development Environment

Template: `app-secrets.dev.json`
- Used for development deployments
- Domain: `dev.agentage.io`
- API Domain: `api.dev.agentage.io`

### Production Environment

Template: `app-secrets.prod.json`
- Used for production deployments
- Domain: `agentage.io`
- API Domain: `api.agentage.io`

## Deployment Pipeline

### 1. GitHub Secrets Setup

Store the appropriate secrets JSON in GitHub Secrets:

**For Development:**
```bash
# Set the APP_SECRETS_JSON secret with content from app-secrets.dev.json
gh secret set APP_SECRETS_JSON < app-secrets.dev.json
```

**For Production:**
```bash
# Set the APP_SECRETS_JSON secret with content from app-secrets.prod.json
gh secret set APP_SECRETS_JSON < app-secrets.prod.json
```

### 2. Deployment Workflow

The deployment workflow (`.github/workflows/deploy.yml`) passes the secrets to the deployment action:

```yaml
- name: Deploy Application
  uses: ./.github/workflows/actions/deploy-application
  with:
    environment: 'development'
    secrets-json: ${{ secrets.APP_SECRETS_JSON || '{}' }}
    # ... other inputs
```

### 3. Secrets Conversion

The deployment action (`.github/workflows/actions/deploy-application/action.yml`) converts the JSON to `.env` format:

```bash
# Parse JSON and convert to .env format
echo '${{ inputs.secrets-json }}' | jq -r '
  # Handle nested oauth structure
  if has("oauth") then
    (.oauth | to_entries[] | 
      (.key | ascii_upcase) + "_CLIENT_ID=" + .value.client_id,
      (.key | ascii_upcase) + "_CLIENT_SECRET=" + .value.client_secret
    ),
    # Handle direct properties
    (to_entries[] | select(.key != "oauth") | 
      (.key | ascii_upcase) + "=" + (.value | tostring)
    )
  else
    # Flat structure fallback
    to_entries[] | (.key | ascii_upcase) + "=" + (.value | tostring)
  end
' > deployment-temp/.env
```

### 4. Environment Variable Mapping

The JSON structure is converted to environment variables:

**Input (JSON):**
```json
{
  "oauth": {
    "github": {
      "client_id": "abc123",
      "client_secret": "secret456"
    }
  },
  "jwt_secret": "my-secret-key",
  "frontend_fqdn": "dev.agentage.io"
}
```

**Output (.env file):**
```env
GITHUB_CLIENT_ID=abc123
GITHUB_CLIENT_SECRET=secret456
JWT_SECRET=my-secret-key
FRONTEND_FQDN=dev.agentage.io
```

### 5. Docker Service Injection

The `.env` file is:
1. Copied to the remote server
2. Referenced in `docker-compose.yml` via `env_file: - .env`
3. Loaded into Docker services as environment variables

```yaml
backend:
  image: ghcr.io/agentage/web/backend:latest
  env_file:
    - .env
  environment:
    - HOST=0.0.0.0
    - PORT=3001
```

### 6. Application Configuration

The backend's `ConfigService` (`packages/backend/src/services/app.services.ts`) validates and reads these environment variables:

```typescript
async initialize() {
  // Load .env file from workspace root
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

  // Validate required environment variables
  console.log('🔍 Validating backend environment variables...');
  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.error(`❌ Missing required environment variable: ${varName}`);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
```

## Required Environment Variables

The backend requires the following environment variables:

### OAuth Configuration
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

### Database Configuration
- `MONGODB_URI`

### JWT Configuration
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Application Configuration
- `FRONTEND_FQDN`
- `API_FQDN`

### Optional Configuration
- `API_TOKEN` - For admin endpoint protection
- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment name
- `LOG_LEVEL` - Logging level

## Security Best Practices

1. **Never commit secrets files**: All `app-secrets.*.json` files (except `.local`) are in `.gitignore`
2. **Use GitHub Secrets**: Store production secrets in GitHub environment secrets
3. **Secure file permissions**: The deployment script sets `.env` to `chmod 600`
4. **Rotate secrets regularly**: Update OAuth secrets and JWT keys periodically
5. **Use strong JWT secrets**: Minimum 32 characters for JWT_SECRET
6. **Environment-specific secrets**: Use different OAuth apps for dev/prod

## Troubleshooting

### Missing Environment Variables

If deployment fails with "Missing required environment variables":

1. Check GitHub Secrets has `APP_SECRETS_JSON` set
2. Verify the JSON structure matches the expected format
3. Ensure all required fields are present in the JSON

### Service Update Issues

If services don't pick up new environment variables:

1. Force service update: `docker service update --force <service-name>`
2. Check service logs: `docker service logs <service-name>`
3. Verify `.env` file on server: `cat /opt/agentage/development/.env`

### OAuth Configuration

If OAuth callbacks fail:

1. Verify callback URLs match in GitHub/Google/Microsoft app settings
2. Check `FRONTEND_FQDN` is correct for the environment
3. Ensure DNS is properly configured

## References

- Example implementation: `/example/` directory
- Deployment workflow: `.github/workflows/deploy.yml`
- Deployment action: `.github/workflows/actions/deploy-application/action.yml`
- Backend config service: `packages/backend/src/services/app.services.ts`
- Docker compose: `docker-compose.yml`
