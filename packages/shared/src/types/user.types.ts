/**
 * User Types
 * Shared types for user documents and requests
 */

import { z } from 'zod';

/**
 * Provider data schema (OAuth providers)
 */
export const providerDataSchema = z.object({
  id: z.string(),
  email: z.string(),
  connectedAt: z.date(),
});

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
});

/**
 * User document structure in MongoDB
 * Uses string _id (GUID) to match agent schema
 */
export interface UserDocument {
  _id?: string; // GUID
  email: string;
  name?: string;
  avatar?: string;
  verifiedAlias?: string; // Verified username/alias from OAuth provider (e.g., GitHub username)
  role: 'user' | 'admin';
  isActive: boolean;

  // OAuth provider information
  providers: {
    github?: {
      id: string;
      email: string;
      connectedAt: Date;
    };
    google?: {
      id: string;
      email: string;
      connectedAt: Date;
    };
    microsoft?: {
      id: string;
      email: string;
      connectedAt: Date;
    };
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * User document with string ID (for backend)
 */
export interface UserDocumentWithStringId extends Omit<UserDocument, '_id'> {
  _id: string;
} /**
 * OAuth provider profile from authentication
 */
export interface ProviderProfile {
  provider: 'github' | 'google' | 'microsoft';
  providerId: string;
  email: string;
  name?: string;
  avatar?: string;
  username?: string; // Provider-specific username/alias (e.g., GitHub username)
}

/**
 * Safe user data for API responses (excludes sensitive info)
 */
export interface UserApiResponse {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verifiedAlias?: string;
  role: 'user' | 'admin';
  providers: string[]; // Just provider names, not IDs
  createdAt: string;
  updatedAt: string;
}

/**
 * Zod schemas for request validation
 */

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  githubId: z.string().optional(),
  githubUsername: z.string().optional(),
  providers: z
    .object({
      google: providerDataSchema.optional(),
      github: providerDataSchema.optional(),
    })
    .optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  preferences: userPreferencesSchema.optional(),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

/**
 * UI Response types
 */
export interface UserUiResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  verifiedAlias?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserDetailUiResponse extends UserUiResponse {
  isActive: boolean;
  lastLoginAt?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
  };
  updatedAt: string;
}
