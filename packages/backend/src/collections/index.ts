/**
 * Backend Collections
 * MongoDB collection schemas and types
 */

export {
  COLLECTION_DESCRIPTION as AGENTS_COLLECTION_DESCRIPTION,
  COLLECTION_NAME as AGENTS_COLLECTION_NAME,
  agentsCollectionConfig,
  agentsCollectionIndexes,
  agentsCollectionSchema,
  createAgentsValidator,
  type AgentDocumentWithObjectId,
  type AgentsDocument,
} from './agents.collection';

export {
  COLLECTION_DESCRIPTION as AGENT_VERSIONS_COLLECTION_DESCRIPTION,
  COLLECTION_NAME as AGENT_VERSIONS_COLLECTION_NAME,
  agentVersionsCollectionConfig,
  agentVersionsCollectionIndexes,
  agentVersionsCollectionSchema,
  createAgentVersionsValidator,
  type AgentVersionDocumentWithObjectId,
  type AgentVersionsDocument,
} from './agent-versions.collection';

export {
  createUsersValidator,
  COLLECTION_DESCRIPTION as USERS_COLLECTION_DESCRIPTION,
  COLLECTION_NAME as USERS_COLLECTION_NAME,
  usersCollectionConfig,
  usersCollectionIndexes,
  usersCollectionSchema,
  type UserDocumentWithStringId,
  type UsersDocument,
} from './users.collection';

export * from './utils';
