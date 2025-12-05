/**
 * Agent Versions Collection Schema
 *
 * Collection: agent_versions
 * Purpose: Version history for AI agents
 * Documents: Full version history with content and metadata for each version
 */

// import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { DocumentValidator, IndexDefinition } from './utils';

// Collection metadata
export const COLLECTION_NAME = 'agent_versions' as const;
export const COLLECTION_DESCRIPTION = 'Version history for AI agents';

/**
 * Agent versions collection schema
 */
export const agentVersionsCollectionSchema = z.object({
  // agentId references Agent._id (string GUID)
  agentId: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  content: z.string().max(100000),
  contentHash: z.string().length(64), // SHA256 hex = 64 chars
  changelog: z.string().max(1000).optional(),
  isLatest: z.boolean(),
  downloads: z.number().int().min(0),
  publishedAt: z.date(),
});

/**
 * Agent version document type (shared - uses string _id)
 */
export type AgentVersionsDocument = z.infer<typeof agentVersionsCollectionSchema> & {
  _id?: string;
  publishedAt: Date;
};

/**
 * Agent version document type with ObjectId (for backend MongoDB operations)
 */
// backend representation: ids are string GUIDs
export type AgentVersionDocumentWithObjectId = Omit<
  AgentVersionsDocument,
  '_id' | 'publishedAt'
> & {
  _id: string;
  publishedAt: Date;
};

/**
 * Database indexes for agent_versions collection
 */
export const agentVersionsCollectionIndexes: IndexDefinition[] = [
  {
    collection: COLLECTION_NAME,
    key: { agentId: 1, version: 1 },
    options: { unique: true, name: 'unique_version_per_agent' },
  },
  {
    collection: COLLECTION_NAME,
    key: { agentId: 1, publishedAt: -1 },
    options: { name: 'idx_agent_published' },
  },
  {
    collection: COLLECTION_NAME,
    key: { agentId: 1, isLatest: 1 },
    options: { name: 'idx_agent_latest' },
  },
  {
    collection: COLLECTION_NAME,
    key: { publishedAt: -1 },
    options: { name: 'idx_published_at' },
  },
];

/**
 * Create validator for agent_versions collection
 */
export const createAgentVersionsValidator = (): DocumentValidator<AgentVersionsDocument> => ({
  validate: (data: unknown) => agentVersionsCollectionSchema.parse(data) as AgentVersionsDocument,
  validatePartial: (data: unknown) => agentVersionsCollectionSchema.partial().parse(data),
  safeParse: (data: unknown) => {
    const result = agentVersionsCollectionSchema.safeParse(data);
    return result.success
      ? { success: true as const, data: result.data as AgentVersionsDocument }
      : { success: false as const, error: result.error.message };
  },
});

/**
 * Agent versions collection configuration for registry
 */
export const agentVersionsCollectionConfig = {
  name: COLLECTION_NAME,
  validator: createAgentVersionsValidator(),
  description: COLLECTION_DESCRIPTION,
  indexes: agentVersionsCollectionIndexes,
} as const;
