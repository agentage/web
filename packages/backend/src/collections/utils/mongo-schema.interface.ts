/**
 * MongoDB schema validation interfaces
 * Type definitions for document validation system
 */

export interface DocumentValidator<T> {
  validate: (data: unknown) => T;
  validatePartial: (data: unknown) => Partial<T>;
  safeParse: (data: unknown) => { success: boolean; data?: T; error?: string };
}

export interface ValidatedCollection<T = Record<string, unknown>> {
  // Standard CRUD operations with automatic validation
  find: (query: Record<string, unknown>) => Promise<T[]>;
  findOne: (query: Record<string, unknown>) => Promise<T | null>;
  insertOne: (doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  updateOne: (query: Record<string, unknown>, update: Partial<T>) => Promise<T | null>;
  deleteOne: (query: Record<string, unknown>) => Promise<boolean>;

  // Validation utilities
  validateDocument: (doc: unknown) => T;
  safeParse: (doc: unknown) => { success: boolean; data?: T; error?: string };

  // Raw operations (bypass validation for system operations)
  insertOneRaw: (doc: T) => Promise<T>;
  updateOneRaw: (query: Record<string, unknown>, update: Partial<T>) => Promise<T | null>;
}

export interface IndexDefinition {
  collection: string;
  key: Record<string, 1 | -1>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    name?: string;
    background?: boolean;
  };
}

export type MongoDocumentBase = {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
};
