/**
 * Typed Database Interface
 * Provides type-safe collection access
 *
 * Usage:
 * ```typescript
 * // Get typed collection - TypeScript knows the document type
 * const agentsCollection = db.collection('agents');
 * // agentsCollection is Collection<AgentDocument>
 *
 * // Insert with type safety
 * await agentsCollection.insertOne({
 *   _id: randomUUID(),
 *   name: 'my-agent',
 *   owner: userId,
 *   // ... other AgentDocument fields
 * });
 *
 * // Find with type safety
 * const agent = await agentsCollection.findOne({ name: 'my-agent' });
 * // agent is AgentDocument | null - fully typed!
 * ```
 */

import type {
  AgentDocument,
  AgentVersionDocument,
  DeviceCodeDocument,
  UserDocument,
} from '@agentage/shared';
import type { Collection, Db } from 'mongodb';

/**
 * Typed collection map
 * Maps collection names to their document types
 */
export interface TypedCollections {
  agents: AgentDocument;
  agent_versions: AgentVersionDocument;
  users: UserDocument;
  device_codes: DeviceCodeDocument;
  // Add other collections here as they are defined
  // sessions: SessionDocument;
}

/**
 * Typed Database wrapper
 * Provides type-safe collection() method
 */
export class TypedDb {
  constructor(private db: Db) {}

  /**
   * Get a typed collection
   * @example
   * const agentsCollection = db.collection('agents'); // Collection<AgentDocument>
   */
  collection<K extends keyof TypedCollections>(name: K): Collection<TypedCollections[K]> {
    return this.db.collection(name) as Collection<TypedCollections[K]>;
  }

  /**
   * Get the raw MongoDB database for operations that need direct access
   * (e.g., index creation)
   */
  getRawDb(): Db {
    return this.db;
  }
}
