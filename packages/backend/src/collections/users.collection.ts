/**
 * Users Collection Schema
 *
 * Collection: users
 * Purpose: User accounts and authentication data
 * Documents: User profiles, authentication metadata, and OAuth providers
 */

import { z } from 'zod';
import type { DocumentValidator, IndexDefinition } from './utils';

// Collection metadata
export const COLLECTION_NAME = 'users' as const;
export const COLLECTION_DESCRIPTION = 'User accounts and authentication data';

/**
 * Provider data schema (OAuth providers)
 */
const providerDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  connectedAt: z.date(),
});

/**
 * Users collection schema
 */
export const usersCollectionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  isActive: z.boolean().default(true),
  lastLoginAt: z.date().optional(),
  providers: z.object({
    github: providerDataSchema.optional(),
    google: providerDataSchema.optional(),
    microsoft: providerDataSchema.optional(),
  }),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      emailNotifications: z.boolean().optional(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * User document type (shared - uses string _id)
 */
export type UsersDocument = z.infer<typeof usersCollectionSchema> & {
  _id?: string;
};

/**
 * User document type with string GUID _id (for backend MongoDB operations)
 */
export type UserDocumentWithStringId = Omit<UsersDocument, '_id'> & {
  _id: string;
};

/**
 * Database indexes for users collection
 */
export const usersCollectionIndexes: IndexDefinition[] = [
  {
    collection: COLLECTION_NAME,
    key: { email: 1 },
    options: { unique: true, name: 'email_unique' },
  },
  {
    collection: COLLECTION_NAME,
    key: { 'providers.github.id': 1 },
    options: { unique: true, sparse: true, name: 'github_id_unique' },
  },
  {
    collection: COLLECTION_NAME,
    key: { 'providers.google.id': 1 },
    options: { unique: true, sparse: true, name: 'google_id_unique' },
  },
  {
    collection: COLLECTION_NAME,
    key: { 'providers.microsoft.id': 1 },
    options: { unique: true, sparse: true, name: 'microsoft_id_unique' },
  },
  {
    collection: COLLECTION_NAME,
    key: { isActive: 1 },
    options: { name: 'is_active_index' },
  },
  {
    collection: COLLECTION_NAME,
    key: { role: 1 },
    options: { name: 'role_index' },
  },
];

/**
 * Create validator for users collection
 */
export const createUsersValidator = (): DocumentValidator<UsersDocument> => ({
  validate: (data: unknown) => usersCollectionSchema.parse(data) as UsersDocument,
  validatePartial: (data: unknown) => usersCollectionSchema.partial().parse(data),
  safeParse: (data: unknown) => {
    const result = usersCollectionSchema.safeParse(data);
    return result.success
      ? { success: true as const, data: result.data as UsersDocument }
      : { success: false as const, error: result.error.message };
  },
});

/**
 * Users collection configuration for registry
 */
export const usersCollectionConfig = {
  name: COLLECTION_NAME,
  validator: createUsersValidator(),
  description: COLLECTION_DESCRIPTION,
  indexes: usersCollectionIndexes,
} as const;
