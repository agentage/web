# Agents API Specification v2.0

## Overview

This specification describes the Agents API endpoints for the Agentage Registry. Version 2.0 adds support for GitHub Copilot agent format with YAML frontmatter, MCP server configurations, and tool integrations.

## Base URL

```
https://api.agentage.io/api/agents
```

## Authentication

Most endpoints are public (read-only). Write operations require JWT authentication via `Authorization: Bearer <token>` header.

---

## Endpoints

### 1. List Agents

**GET** `/api/agents`

List all agents with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Results per page
- `visibility` (string: 'public' | 'private' | 'all') - Filter by visibility
- `owner` (string) - Filter by owner username
- `tag` (string) - Filter by tag
- `sort` (string: 'downloads' | 'updated' | 'created' | 'name', default: 'downloads') - Sort order

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "name": "my-agent",
        "owner": "username",
        "description": "Agent description",
        "visibility": "public",
        "tags": ["chatbot", "assistant"],
        "latestVersion": "2025-01-15",
        "contentType": "markdown",
        "agentVersion": "1.0.0",
        "tools": ["web-search", "calculator"],
        "hasMcpServers": true,
        "totalDownloads": 150,
        "stars": 25,
        "forks": 5,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

### 2. Search Agents

**GET** `/api/agents/search`

Full-text search across agents.

**Query Parameters:**
- `q` (string, required) - Search query
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `visibility` (string: 'public' | 'private' | 'all')

**Response:** Same structure as List Agents

### 3. Get Agent Details

**GET** `/api/agents/:owner/:name`

Get detailed information about a specific agent.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "my-agent",
    "owner": "username",
    "description": "Agent description",
    "visibility": "public",
    "tags": ["chatbot", "assistant"],
    "latestVersion": "2025-01-15",
    "contentType": "markdown",
    "agentVersion": "1.0.0",
    "tools": ["web-search", "calculator"],
    "hasMcpServers": true,
    "readme": "# My Agent\n\nDetailed documentation...",
    "latestContent": "---\nname: my-agent\n...\n---\n\n# Instructions\n...",
    "mcpServers": {
      "web-search": {
        "type": "http",
        "url": "https://api.example.com/mcp",
        "headers": {
          "Authorization": "Bearer {{API_KEY}}"
        },
        "tools": ["search", "browse"]
      },
      "local-tools": {
        "type": "stdio",
        "command": "node",
        "args": ["./tools/server.js"],
        "env": {
          "NODE_ENV": "production"
        },
        "tools": ["calculator", "time"]
      }
    },
    "sections": [
      {
        "title": "Instructions",
        "level": 1,
        "startLine": 5,
        "endLine": 20
      }
    ],
    "totalDownloads": 150,
    "stars": 25,
    "forks": 5,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T00:00:00.000Z",
    "versions": [
      {
        "version": "2025-01-15",
        "agentVersion": "1.0.0",
        "publishedAt": "2025-01-15T00:00:00.000Z",
        "downloads": 50,
        "isLatest": true
      },
      {
        "version": "2025-01-01",
        "agentVersion": "0.9.0",
        "publishedAt": "2025-01-01T00:00:00.000Z",
        "downloads": 100,
        "isLatest": false
      }
    ]
  }
}
```

### 4. Get Agent Version

**GET** `/api/agents/:owner/:name/versions/:version`

Get a specific version of an agent.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "2025-01-15",
    "agentVersion": "1.0.0",
    "contentType": "markdown",
    "content": "---\nname: my-agent\n...\n---\n\n# Instructions\n...",
    "tools": ["web-search", "calculator"],
    "mcpServers": {
      "web-search": {
        "type": "http",
        "url": "https://api.example.com/mcp"
      }
    },
    "sections": [
      {
        "title": "Instructions",
        "level": 1,
        "startLine": 5,
        "endLine": 20
      }
    ],
    "changelog": "Added new features",
    "downloads": 50,
    "publishedAt": "2025-01-15T00:00:00.000Z",
    "isLatest": true
  }
}
```

### 5. List Agent Versions

**GET** `/api/agents/:owner/:name/versions`

List all versions of an agent.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "my-agent",
    "owner": "username",
    "versions": [
      {
        "version": "2025-01-15",
        "agentVersion": "1.0.0",
        "contentType": "markdown",
        "content": "...",
        "tools": ["web-search"],
        "mcpServers": {...},
        "sections": [...],
        "changelog": "...",
        "downloads": 50,
        "publishedAt": "2025-01-15T00:00:00.000Z",
        "isLatest": true
      }
    ]
  }
}
```

### 6. Publish Agent (Protected)

**POST** `/api/agents`

Publish a new agent or new version of an existing agent.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "name": "my-agent",
  "description": "Agent description",
  "visibility": "public",
  "version": "2025-01-15",
  "content": "---\nname: my-agent\ndescription: Agent description\nversion: 1.0.0\ntools:\n  - web-search\nmcp-servers:\n  web-search:\n    type: http\n    url: https://api.example.com/mcp\n---\n\n# Instructions\n...",
  "contentType": "markdown",
  "readme": "# My Agent\n\nDocumentation...",
  "tags": ["chatbot", "assistant"],
  "changelog": "Initial release"
}
```

**Notes:**
- If `contentType` is `markdown` and content has YAML frontmatter, it will be parsed automatically
- Frontmatter fields override request fields where applicable
- For existing agents, `version` must be greater than current `latestVersion`

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "my-agent",
    "owner": "username",
    ...
  }
}
```

### 7. Update Agent Metadata (Protected)

**PATCH** `/api/agents/:owner/:name`

Update agent metadata (description, visibility, tags, readme).

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Request Body:**
```json
{
  "description": "Updated description",
  "visibility": "private",
  "tags": ["updated", "tags"],
  "readme": "# Updated README"
}
```

### 8. Delete Agent (Protected)

**DELETE** `/api/agents/:owner/:name`

Delete an agent and all its versions.

**Headers:**
- `Authorization: Bearer <jwt-token>`

### 9. List Agents with MCP Servers (New in v2.0)

**GET** `/api/agents/mcp-servers`

List all agents that have MCP server configurations.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "name": "my-agent",
        "owner": "username",
        "hasMcpServers": true,
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "hasMore": true
    }
  }
}
```

### 10. List Agents by MCP Server Name (New in v2.0)

**GET** `/api/agents/mcp-servers/:serverName`

List all agents that use a specific MCP server.

**Path Parameters:**
- `serverName` (string) - Name of the MCP server

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "serverName": "web-search",
    "agents": [
      {
        "name": "my-agent",
        "owner": "username",
        "hasMcpServers": true,
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "hasMore": false
    }
  }
}
```

---

## Data Models

### MCP Server Configuration

#### HTTP Server
```typescript
{
  type: 'http';
  url: string;
  headers?: Record<string, string>;
  tools?: string[];
}
```

#### Stdio Server
```typescript
{
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
  tools?: string[];
}
```

### Agent Frontmatter (YAML)

```yaml
name: my-agent
description: Agent description
version: 1.0.0
tools:
  - web-search
  - calculator
mcp-servers:
  web-search:
    type: http
    url: https://api.example.com/mcp
    headers:
      Authorization: Bearer {{API_KEY}}
    tools:
      - search
      - browse
  local-tools:
    type: stdio
    command: node
    args:
      - ./tools/server.js
    tools:
      - calculator
```

### Agent Section Metadata
```typescript
{
  title: string;
  level: number; // 1-6 (heading level)
  startLine?: number;
  endLine?: number;
}
```

---

## Implementation Notes

### Backward Compatibility

- Agents without `contentType` are treated as `contentType: 'plain'`
- Plain text agents work exactly as before
- Frontmatter parsing only applies to markdown agents with YAML frontmatter

### Frontmatter Parsing

- Performed automatically when content is published
- Extracted data stored in database for efficient querying
- Frontmatter `name` should match request `name` (warning logged if different)
- Frontmatter `description` used if request `description` is empty

### MCP Server Discovery

- MCP servers are indexed for efficient querying
- Sparse index on `mcpServers` field (only documents with MCP configs)
- `hasMcpServers` computed field in responses

### Content Types

- `markdown` - YAML frontmatter + Markdown content
- `plain` - Plain text content (legacy format)

### Section Extraction

- Automatically extracts markdown headers (# to ######)
- Includes line number ranges for each section
- Useful for navigation and code editors

---

## Migration

See `scripts/migrate-agents-mcp.js` for database migration script.

**Run migration:**
```bash
MONGODB_URI=<your-uri> node scripts/migrate-agents-mcp.js
```

The migration:
1. Adds indexes for `contentType` and `mcpServers`
2. Sets `contentType='plain'` for existing agents
3. Attempts to detect and mark markdown agents
4. Updates both `agents` and `agent_versions` collections

---

## Version History

### v2.0 (Current)
- Added GitHub Copilot agent format support
- Added MCP server configurations
- Added frontmatter parsing
- Added section extraction
- Added new fields: `contentType`, `agentVersion`, `tools`, `mcpServers`, `sections`
- Added new endpoints: `/api/agents/mcp-servers` and `/api/agents/mcp-servers/:serverName`

### v1.0
- Initial release
- Basic CRUD operations for agents
- Version management
- Search and filtering
