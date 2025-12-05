import { z } from 'zod';

// ============================================================================
// MCP Server Configuration Types
// ============================================================================

export interface McpServerConfigHttp {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
  tools?: string[];
}

export interface McpServerConfigStdio {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
  tools?: string[];
}

export type McpServerConfig = McpServerConfigHttp | McpServerConfigStdio;

export interface AgentMcpServers {
  [serverName: string]: McpServerConfig;
}

// ============================================================================
// Agent Section Metadata
// ============================================================================

export interface AgentSection {
  title: string;
  level: number;
  startLine?: number;
  endLine?: number;
}

// ============================================================================
// Agent Frontmatter
// ============================================================================

export interface AgentFrontmatter {
  name: string;
  description: string;
  version?: string;
  tools?: string[];
  'mcp-servers'?: AgentMcpServers;
}

// ============================================================================
// Base Interfaces
// ============================================================================

export interface AgentDocument {
  // Use string GUID for ids in the DB (e.g. UUID)
  _id: string;
  name: string;
  // owner is stored as a string GUID (not Mongo ObjectId)
  owner: string;
  ownerUsername: string;
  description?: string;
  visibility: 'public' | 'private';
  tags: string[];

  // Content fields
  contentType: 'markdown' | 'plain';
  readme?: string;

  // Frontmatter data
  agentVersion?: string;
  tools?: string[];
  mcpServers?: AgentMcpServers;
  sections?: AgentSection[];

  // Latest version (denormalized for performance)
  latestVersion: string;
  latestContent: string;
  latestContentHash: string; // SHA256 hash of latestContent

  // Statistics
  totalDownloads: number;
  stars: number;
  forks: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentVersionDocument {
  _id: string;
  // agentId references AgentDocument._id (string GUID)
  agentId: string;
  version: string;
  contentType: 'markdown' | 'plain';
  content: string;
  contentHash: string; // SHA256 hash of content
  changelog?: string;

  // Frontmatter data
  agentVersion?: string;
  tools?: string[];
  mcpServers?: AgentMcpServers;
  sections?: AgentSection[];

  isLatest: boolean;
  downloads: number;
  publishedAt: Date;
}
// MCP Server Schemas
export const mcpServerHttpSchema = z.object({
  type: z.literal('http'),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

export const mcpServerStdioSchema = z.object({
  type: z.literal('stdio'),
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

export const mcpServerConfigSchema = z.union([mcpServerHttpSchema, mcpServerStdioSchema]);

export const agentMcpServersSchema = z.record(mcpServerConfigSchema);

// Agent Section Schema
export const agentSectionSchema = z.object({
  title: z.string(),
  level: z.number().min(1).max(6),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
});

// Tools Schema
export const agentToolsSchema = z.array(z.string()).optional();

// ============================================================================
// Validation Schemas
// ============================================================================

export const createAgentSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  visibility: z.enum(['public', 'private']),
  version: z.string().regex(/^\d{4}-\d{2}-\d{2}[a-z]?$/, 'Version must be date-based format (e.g., 2025-10-24 or 2025-10-24a)'),
  content: z.string().min(1, 'Content is required').max(100000, 'Content must not exceed 100KB'),
  contentType: z.enum(['markdown', 'plain']).default('markdown').optional(),
  readme: z.string().max(50000, 'README must not exceed 50KB').optional(),
  tags: z
    .array(
      z
        .string()
        .min(2, 'Tag must be at least 2 characters')
        .max(20, 'Tag must not exceed 20 characters')
        .regex(/^[a-z0-9-]+$/, 'Tags must be lowercase alphanumeric with hyphens')
    )
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  changelog: z.string().max(1000, 'Changelog must not exceed 1000 characters').optional(),
});

export const updateAgentMetadataSchema = z.object({
  description: z.string().min(10).max(500).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  tags: z
    .array(
      z
        .string()
        .min(2)
        .max(20)
        .regex(/^[a-z0-9-]+$/)
    )
    .max(10)
    .optional(),
  readme: z.string().max(50000).optional(),
});

export const listAgentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  visibility: z.enum(['public', 'private', 'all']).optional(),
  owner: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['downloads', 'updated', 'created', 'name']).default('downloads'),
});

export const searchAgentsQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  visibility: z.enum(['public', 'private', 'all']).optional(),
});

// ============================================================================
// Request/Response Types
// ============================================================================

export type CreateAgentRequest = z.infer<typeof createAgentSchema>;
export type UpdateAgentMetadataRequest = z.infer<typeof updateAgentMetadataSchema>;
export type ListAgentsQuery = z.infer<typeof listAgentsQuerySchema>;
export type SearchAgentsQuery = z.infer<typeof searchAgentsQuerySchema>;

export interface AgentUiResponse {
  name: string;
  owner: string;
  description?: string;
  visibility: 'public' | 'private';
  tags: string[];
  latestVersion: string;
  contentType: 'markdown' | 'plain';
  agentVersion?: string;
  tools?: string[];
  hasMcpServers: boolean;
  totalDownloads: number;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDetailUiResponse extends AgentUiResponse {
  readme?: string;
  latestContent: string;
  latestContentHash: string;
  mcpServers?: AgentMcpServers;
  sections?: AgentSection[];
  versions: {
    version: string;
    agentVersion?: string;
    contentHash: string;
    publishedAt: string;
    downloads: number;
    isLatest: boolean;
  }[];
}

export interface AgentVersionUiResponse {
  version: string;
  agentVersion?: string;
  contentType: 'markdown' | 'plain';
  content: string;
  contentHash: string;
  tools?: string[];
  mcpServers?: AgentMcpServers;
  sections?: AgentSection[];
  changelog?: string;
  downloads: number;
  publishedAt: string;
  isLatest: boolean;
}

export interface AgentVersionsListResponse {
  name: string;
  owner: string;
  versions: AgentVersionUiResponse[];
}

// ============================================================================
// Constants
// ============================================================================

export const VISIBILITY_TYPES = ['public', 'private'] as const;
export type VisibilityType = (typeof VISIBILITY_TYPES)[number];

export const SORT_OPTIONS = ['downloads', 'updated', 'created', 'name'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
