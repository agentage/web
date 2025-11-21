# Authentication Setup Guide

This guide explains how to set up OAuth authentication for the Agentage platform.

## Overview

The authentication system uses:
- **Stateless JWT tokens** - No server-side sessions
- **OAuth providers** - GitHub (primary), Google (optional)
- **Passport.js** - OAuth strategy implementation
- **JWT middleware** - Token validation on protected routes

## Prerequisites

1. Node.js and npm installed
2. MongoDB running locally or remotely
3. GitHub account (for OAuth app registration)
4. Google account (optional, for Google OAuth)

## Setup Instructions

### 1. Install Dependencies

All required dependencies are already in `package.json`. If needed, run:

```bash
cd /home/vreshch/projects/web
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the following variables:

```bash
cp .env.example .env
```

#### Required Variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for OAuth redirects)
FRONTEND_FQDN=localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentage
```

### 3. Set Up GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Agentage (Development)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Add to `.env`:

```bash
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

### 4. Set Up Google OAuth (Optional)

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. Select "Web application"
7. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
8. Copy the **Client ID** and **Client Secret**
9. Add to `.env`:

```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 5. Build and Start the Server

```bash
# Build shared package
cd packages/shared
npm run build

# Start backend in development mode
cd ../backend
npm run dev
```

## API Endpoints

### Public Endpoints (No Authentication)

- `GET /api/auth/github` - Initiate GitHub OAuth login
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout (client-side token removal)

### Protected Endpoints (Require JWT Token)

- `GET /api/auth/me` - Get current user information
- `GET /api/auth/providers` - List linked OAuth providers

### Optional Authentication

- `GET /api/auth/status` - Check authentication status (returns user if authenticated)

## Testing the Authentication Flow

### 1. Test GitHub OAuth

```bash
# In browser, visit:
http://localhost:3001/api/auth/github

# This will:
# 1. Redirect to GitHub for authorization
# 2. After approval, redirect back to callback
# 3. Generate JWT token
# 4. Redirect to frontend with token:
#    http://localhost:3000/auth/callback?token=eyJhbGc...
```

### 2. Test JWT Token

After OAuth login, you'll receive a JWT token. Use it to access protected endpoints:

```bash
# Save the token from the redirect URL
TOKEN="eyJhbGc..."

# Test /me endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me

# Response:
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "user",
    "providers": ["github"],
    "createdAt": "2025-11-19T...",
    "updatedAt": "2025-11-19T..."
  },
  "authenticated": true
}
```

### 3. Test Protected Routes

```bash
# Without token (should fail)
curl http://localhost:3001/api/auth/me
# Response: 401 Unauthorized

# With token (should succeed)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me
# Response: User data
```

## Authentication Flow Diagram

```
User clicks "Login with GitHub"
    ↓
Browser → GET /api/auth/github
    ↓
Redirect to GitHub OAuth
    ↓
User approves on GitHub
    ↓
GitHub → GET /api/auth/github/callback?code=xyz
    ↓
Backend exchanges code for user profile
    ↓
Backend creates/updates user in MongoDB
    ↓
Backend generates JWT token
    ↓
Redirect to frontend with token:
http://localhost:3000/auth/callback?token=eyJhbGc...
    ↓
Frontend stores token in localStorage
    ↓
Frontend uses token for API requests:
Authorization: Bearer eyJhbGc...
```

## JWT Token Structure

The JWT token contains:

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700604800,
  "iss": "agentage.io",
  "aud": "agentage.io"
}
```

- **Expires in**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Signed with**: `JWT_SECRET` from environment

## Security Considerations

### Production Deployment

1. **Use HTTPS**: Always use HTTPS in production
2. **Strong JWT Secret**: Use a random 32+ character secret
3. **Update Callback URLs**: Update OAuth callback URLs to production domain
4. **Rotate Secrets**: Periodically rotate JWT secret
5. **Monitor Failed Attempts**: Log and monitor failed authentication attempts

### Environment-Specific Configurations

```bash
# Development
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
FRONTEND_FQDN=localhost:3000

# Production
GITHUB_CALLBACK_URL=https://api.agentage.io/api/auth/github/callback
FRONTEND_FQDN=agentage.io
```

## Troubleshooting

### Issue: OAuth redirect fails

**Solution**: Check that callback URL in OAuth app settings matches `GITHUB_CALLBACK_URL` in `.env`

### Issue: JWT verification fails

**Solution**: 
- Verify `JWT_SECRET` is set correctly
- Check token hasn't expired (default 7 days)
- Ensure token format is: `Bearer <token>`

### Issue: MongoDB connection error

**Solution**:
```bash
# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI
```

### Issue: CORS errors in browser

**Solution**: Check `FRONTEND_FQDN` matches your frontend URL and CORS is configured in `app.ts`

## Database Collections

### Users Collection

The authentication system creates a `users` collection with this structure:

```typescript
{
  _id: "uuid",
  email: "user@example.com",
  name: "John Doe",
  avatar: "https://...",
  role: "user" | "admin",
  isActive: true,
  providers: {
    github: {
      id: "12345",
      email: "user@example.com",
      connectedAt: Date
    },
    google: {
      id: "67890",
      email: "user@example.com",
      connectedAt: Date
    }
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### Indexes

The following indexes are automatically created:
- `email` (unique)
- `providers.github.id` (unique, sparse)
- `providers.google.id` (unique, sparse)
- `role`
- `isActive`

## Next Steps

After authentication is working:

1. **Frontend Integration**: Implement login UI and token storage
2. **Protected Routes**: Add JWT middleware to routes that require authentication
3. **User Profiles**: Build user profile management features
4. **Admin Panel**: Create admin-only routes using `requireAdmin` middleware

## References

- [Passport.js Documentation](https://www.passportjs.org/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
