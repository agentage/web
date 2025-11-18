/**
 * Agents Collection Schema
 *
 * Collection: agents
 * Purpose: AI agents registry with metadata and latest version
 * Documents: Agent metadata with denormalized latest version for performance
 */

// import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { DocumentValidator, IndexDefinition, MongoDocumentBase } from './utils';

// Collection metadata
export const COLLECTION_NAME = 'agents' as const;
export const COLLECTION_DESCRIPTION = 'AI agents registry with metadata and latest version';

/**
 * Agents collection schema
 */
export const agentsCollectionSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  // owner is a string GUID referring to a user id (not Mongo ObjectId)
  owner: z.string(),
  ownerUsername: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'private']),
  tags: z
    .array(
      z
        .string()
        .min(2)
        .max(20)
        .regex(/^[a-z0-9-]+$/)
    )
    .max(10),
  readme: z.string().max(50000).optional(),
  latestVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  latestContent: z.string().max(100000),
  totalDownloads: z.number().int().min(0),
  stars: z.number().int().min(0),
  forks: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Agent document type (shared - uses string _id)
 */
export type AgentsDocument = z.infer<typeof agentsCollectionSchema> & MongoDocumentBase;

/**
 * Agent document type with ObjectId (for backend MongoDB operations)
 */
// For Mongo operations _id will be stored as string GUID too
export type AgentDocumentWithObjectId = Omit<AgentsDocument, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Database indexes for agents collection
 */
export const agentsCollectionIndexes: IndexDefinition[] = [
  {
    collection: COLLECTION_NAME,
    key: { name: 1, owner: 1 },
    options: { unique: true, name: 'unique_agent_per_owner' },
  },
  {
    collection: COLLECTION_NAME,
    key: { ownerUsername: 1 },
    options: { name: 'idx_owner_username' },
  },
  {
    collection: COLLECTION_NAME,
    key: { visibility: 1 },
    options: { name: 'idx_visibility' },
  },
  {
    collection: COLLECTION_NAME,
    key: { tags: 1 },
    options: { name: 'idx_tags' },
  },
  {
    collection: COLLECTION_NAME,
    key: { totalDownloads: -1 },
    options: { name: 'idx_total_downloads' },
  },
  {
    collection: COLLECTION_NAME,
    key: { updatedAt: -1 },
    options: { name: 'idx_updated_at' },
  },
  {
    collection: COLLECTION_NAME,
    key: { createdAt: -1 },
    options: { name: 'idx_created_at' },
  },
];

/**
 * Create validator for agents collection
 */
export const createAgentsValidator = (): DocumentValidator<AgentsDocument> => ({
  validate: (data: unknown) => agentsCollectionSchema.parse(data) as AgentsDocument,
  validatePartial: (data: unknown) => agentsCollectionSchema.partial().parse(data),
  safeParse: (data: unknown) => {
    const result = agentsCollectionSchema.safeParse(data);
    return result.success
      ? { success: true as const, data: result.data as AgentsDocument }
      : { success: false as const, error: result.error.message };
  },
});

/**
 * Agents collection configuration for registry
 */
export const agentsCollectionConfig = {
  name: COLLECTION_NAME,
  validator: createAgentsValidator(),
  description: COLLECTION_DESCRIPTION,
  indexes: agentsCollectionIndexes,
} as const;
