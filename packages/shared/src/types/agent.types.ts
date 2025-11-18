import { z } from 'zod';

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
  readme?: string;

  // Latest version (denormalized for performance)
  latestVersion: string;
  latestContent: string;

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
  content: string;
  changelog?: string;
  isLatest: boolean;
  downloads: number;
  publishedAt: Date;
}

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
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be valid semver (e.g., 1.0.0)'),
  content: z.string().min(1, 'Content is required').max(100000, 'Content must not exceed 100KB'),
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
  latestVersion: string;
  downloads: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentDetailUiResponse extends AgentUiResponse {
  readme?: string;
  content: string;
  stats: {
    downloads: number;
    stars: number;
    forks: number;
  };
  dependencies?: {
    tools?: string[];
    models?: string[];
  };
}

export interface AgentVersionUiResponse {
  version: string;
  description?: string;
  publishedAt: string;
  downloads: number;
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
