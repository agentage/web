# Agents API - Bruno Collection

Minimal Bruno API test collection for agent endpoints.

## Setup

1. Install Bruno: https://www.usebruno.com/
2. Open this collection in Bruno
3. Configure environment variables:
   - `baseUrl`: Your API base URL (e.g., `http://localhost:3000`)

## Endpoints

### Public Endpoints
- `GET /api/agents` - List agents
- `GET /api/agents/:owner/:name` - Get agent details
- `GET /api/agents/:owner/:name/versions` - List agent versions

### Protected Endpoints (require authentication)
- `POST /api/agents` - Publish agent
- `PATCH /api/agents/:owner/:name` - Update agent metadata
- `DELETE /api/agents/:owner/:name` - Delete agent

## Usage

1. Start with public endpoints to verify API is working
2. Authenticate via your auth flow
3. Test protected endpoints with auth token
4. Update request bodies/params as needed for your test data
