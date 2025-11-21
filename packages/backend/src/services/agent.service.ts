import type {
  AgentDocument,
  AgentMcpServers,
  AgentSection,
  AgentVersionDocument,
  CreateAgentRequest,
  UpdateAgentMetadataRequest,
} from '@agentage/shared';
import { isMarkdownWithFrontmatter, parseAgentMarkdown } from '@agentage/shared';
import { randomUUID } from 'crypto';
import * as semver from 'semver';
import type { LoggerService, Service } from './app.services';
import type { TypedDb } from './typed-db';

export interface ListAgentsFilter {
  page: number;
  limit: number;
  visibility?: 'public' | 'private' | 'all';
  owner?: string;
  tag?: string;
  sort?: 'downloads' | 'updated' | 'created' | 'name';
}

export interface SearchFilter {
  page: number;
  limit: number;
  visibility?: 'public' | 'private' | 'all';
}

export interface AgentListResult {
  agents: AgentDocument[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Agent Service
 */
export interface AgentService extends Service {
  // Agent CRUD
  publishAgent(userId: string, data: CreateAgentRequest): Promise<AgentDocument>;
  getAgent(owner: string, name: string, userId?: string): Promise<AgentDocument | null>;
  updateAgentMetadata(
    owner: string,
    name: string,
    userId: string,
    data: UpdateAgentMetadataRequest
  ): Promise<AgentDocument>;
  deleteAgent(owner: string, name: string, userId: string): Promise<void>;

  // Version management
  getAgentVersion(
    owner: string,
    name: string,
    version: string,
    userId?: string
  ): Promise<AgentVersionDocument | null>;
  listAgentVersions(owner: string, name: string, userId?: string): Promise<AgentVersionDocument[]>;
  deleteAgentVersion(owner: string, name: string, version: string, userId: string): Promise<void>;

  // Listing & Search
  listAgents(filters: ListAgentsFilter, userId?: string): Promise<AgentListResult>;
  searchAgents(query: string, filters: SearchFilter, userId?: string): Promise<AgentListResult>;

  // Statistics
  incrementDownloads(agentId: string, version?: string): Promise<void>;

  // MCP Server queries
  findByMcpServer(
    serverName: string,
    page?: number,
    limit?: number,
    userId?: string
  ): Promise<AgentListResult>;
  findWithMcpServers(page?: number, limit?: number, userId?: string): Promise<AgentListResult>;
}

/**
 * Create Agent Service
 */
export function createAgentService(db: TypedDb, logger: LoggerService): AgentService {
  return {
    async initialize() {
      logger.info('Agent service initialized');
    },

    async publishAgent(userId: string, data: CreateAgentRequest): Promise<AgentDocument> {
      const agentsCollection = db.collection('agents');
      const versionsCollection = db.collection('agent_versions');
      const usersCollection = db.collection('users');

      // Get user info
      const user = await usersCollection.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const agentId = randomUUID();

      // Parse content if markdown
      let agentVersion: string | undefined;
      let tools: string[] | undefined;
      let mcpServers: AgentMcpServers | undefined;
      let sections: AgentSection[] | undefined;
      const contentType = data.contentType || 'markdown';

      if (contentType === 'markdown' && isMarkdownWithFrontmatter(data.content)) {
        try {
          const parsed = parseAgentMarkdown(data.content);
          agentVersion = parsed.frontmatter.version;
          tools = parsed.frontmatter.tools;
          mcpServers = parsed.mcpServers;
          sections = parsed.sections;

          // Validate frontmatter name matches request name
          if (parsed.frontmatter.name !== data.name) {
            logger.warn('Frontmatter name differs from request name', {
              frontmatterName: parsed.frontmatter.name,
              requestName: data.name,
            });
          }

          // Use frontmatter description if not provided
          if (!data.description && parsed.frontmatter.description) {
            data.description = parsed.frontmatter.description;
          }
        } catch (error) {
          logger.error('Failed to parse agent markdown', { error });
          throw new Error('Invalid agent markdown format');
        }
      }

      // Check if agent already exists
      // owner in agents collection is stored as a string GUID (user._id)
      const existingAgent = await agentsCollection.findOne({
        name: data.name,
        owner: user._id,
      });

      if (existingAgent) {
        // Publishing new version - verify version is greater
        if (!semver.gt(data.version, existingAgent.latestVersion)) {
          throw new Error(
            `Version ${data.version} must be greater than current latest ${existingAgent.latestVersion}`
          );
        }

        // Check if version already exists
        const existingVersion = await versionsCollection.findOne({
          agentId: existingAgent._id,
          version: data.version,
        });

        if (existingVersion) {
          throw new Error(`Version ${data.version} already exists`);
        }

        // Mark old latest as not latest
        await versionsCollection.updateMany(
          { agentId: existingAgent._id, isLatest: true },
          { $set: { isLatest: false } }
        );

        // Create new version
        await versionsCollection.insertOne({
          _id: randomUUID(),
          agentId: existingAgent._id,
          version: data.version,
          content: data.content,
          contentType,
          agentVersion,
          tools,
          mcpServers,
          sections,
          changelog: data.changelog,
          isLatest: true,
          downloads: 0,
          publishedAt: now,
        });

        // Update agent with latest version
        await agentsCollection.updateOne(
          { _id: existingAgent._id },
          {
            $set: {
              latestVersion: data.version,
              latestContent: data.content,
              contentType,
              agentVersion,
              tools,
              mcpServers,
              sections,
              description: data.description || existingAgent.description,
              tags: data.tags || existingAgent.tags,
              readme: data.readme || existingAgent.readme,
              visibility: data.visibility || existingAgent.visibility,
              updatedAt: now,
            },
          }
        );

        const updatedAgent = await agentsCollection.findOne({ _id: existingAgent._id });
        logger.info('New agent version published', {
          agentId: existingAgent._id,
          version: data.version,
        });

        return updatedAgent as AgentDocument;
      } else {
        // Create new agent
        const newAgent = {
          _id: agentId,
          name: data.name,
          // store owner as string GUID
          owner: user._id,
          ownerUsername: user.name || user.email.split('@')[0],
          description: data.description,
          visibility: data.visibility,
          tags: data.tags || [],
          contentType,
          agentVersion,
          tools,
          mcpServers,
          sections,
          readme: data.readme,
          latestVersion: data.version,
          latestContent: data.content,
          totalDownloads: 0,
          stars: 0,
          forks: 0,
          createdAt: now,
          updatedAt: now,
        };

        await agentsCollection.insertOne(newAgent);

        // Create first version
        await versionsCollection.insertOne({
          _id: randomUUID(),
          agentId: agentId,
          version: data.version,
          content: data.content,
          contentType,
          agentVersion,
          tools,
          mcpServers,
          sections,
          changelog: data.changelog,
          isLatest: true,
          downloads: 0,
          publishedAt: now,
        });

        logger.info('New agent created', {
          agentId: agentId,
          name: data.name,
          version: data.version,
        });

        return newAgent as AgentDocument;
      }
    },

    async getAgent(owner: string, name: string, userId?: string): Promise<AgentDocument | null> {
      const agentsCollection = db.collection('agents');

      const agent = await agentsCollection.findOne({
        name,
        ownerUsername: owner,
      });

      if (!agent) {
        return null;
      }

      // Check access permissions
      if (agent.visibility === 'private') {
        if (!userId || agent.owner !== userId) {
          throw new Error('Forbidden: This agent is private');
        }
      }

      return agent as AgentDocument;
    },

    async updateAgentMetadata(
      owner: string,
      name: string,
      userId: string,
      data: UpdateAgentMetadataRequest
    ): Promise<AgentDocument> {
      const agentsCollection = db.collection('agents');

      const agent = await agentsCollection.findOne({
        name,
        ownerUsername: owner,
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      // Verify ownership
      if (agent.owner !== userId) {
        throw new Error('Forbidden: You do not own this agent');
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (data.description !== undefined) updates.description = data.description;
      if (data.visibility !== undefined) updates.visibility = data.visibility;
      if (data.tags !== undefined) updates.tags = data.tags;
      if (data.readme !== undefined) updates.readme = data.readme;

      await agentsCollection.updateOne({ _id: agent._id }, { $set: updates });

      const updatedAgent = await agentsCollection.findOne({ _id: agent._id });
      logger.info('Agent metadata updated', { agentId: agent._id });

      return updatedAgent as AgentDocument;
    },

    async deleteAgent(owner: string, name: string, userId: string): Promise<void> {
      const agentsCollection = db.collection('agents');
      const versionsCollection = db.collection('agent_versions');

      const agent = await agentsCollection.findOne({
        name,
        ownerUsername: owner,
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      if (agent.owner !== userId) {
        throw new Error('Forbidden: You do not own this agent');
      }

      // Delete all versions
      await versionsCollection.deleteMany({ agentId: agent._id });

      // Delete agent
      await agentsCollection.deleteOne({ _id: agent._id });

      logger.info('Agent deleted', { agentId: agent._id, name });
    },

    async getAgentVersion(
      owner: string,
      name: string,
      version: string,
      userId?: string
    ): Promise<AgentVersionDocument | null> {
      const agentsCollection = db.collection('agents');
      const versionsCollection = db.collection('agent_versions');

      const agent = await agentsCollection.findOne({
        name,
        ownerUsername: owner,
      });

      if (!agent) {
        return null;
      }

      // Check access
      if (agent.visibility === 'private') {
        if (!userId || agent.owner !== userId) {
          throw new Error('Forbidden: This agent is private');
        }
      }

      const versionDoc = await versionsCollection.findOne({
        agentId: agent._id,
        version,
      });

      return versionDoc as AgentVersionDocument | null;
    },

    async listAgentVersions(
      owner: string,
      name: string,
      userId?: string
    ): Promise<AgentVersionDocument[]> {
      const agentsCollection = db.collection('agents');
      const versionsCollection = db.collection('agent_versions');

      const agent = await agentsCollection.findOne({
        name,
        ownerUsername: owner,
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      // Check access
      if (agent.visibility === 'private') {
        if (!userId || agent.owner !== userId) {
          throw new Error('Forbidden: This agent is private');
        }
      }

      const versions = await versionsCollection
        .find({ agentId: agent._id })
        .sort({ publishedAt: -1 })
        .toArray();

      return versions as AgentVersionDocument[];
    },

    async deleteAgentVersion(
      owner: string,
      name: string,
      version: string,
      userId: string
    ): Promise<void> {
      const agentsCollection = db.collection('agents');
      const versionsCollection = db.collection('agent_versions');

      const agent = await agentsCollection.findOne({
        name,
        ownerUsername: owner,
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      if (agent.owner !== userId) {
        throw new Error('Forbidden: You do not own this agent');
      }

      const versionDoc = await versionsCollection.findOne({
        agentId: agent._id,
        version,
      });

      if (!versionDoc) {
        throw new Error('Version not found');
      }

      // Delete the version
      await versionsCollection.deleteOne({ _id: versionDoc._id });

      // If it was latest, promote previous version
      if (versionDoc.isLatest) {
        const previousVersion = (
          await versionsCollection
            .find({ agentId: agent._id })
            .sort({ publishedAt: -1 })
            .limit(1)
            .toArray()
        )[0];

        if (previousVersion) {
          // Mark as latest
          await versionsCollection.updateOne(
            { _id: previousVersion._id },
            { $set: { isLatest: true } }
          );

          // Update agent
          await agentsCollection.updateOne(
            { _id: agent._id },
            {
              $set: {
                latestVersion: previousVersion.version,
                latestContent: previousVersion.content,
                updatedAt: new Date(),
              },
            }
          );
        } else {
          // No versions left, delete agent
          await agentsCollection.deleteOne({ _id: agent._id });
        }
      }

      logger.info('Agent version deleted', {
        agentId: agent._id,
        version,
      });
    },

    async listAgents(filters: ListAgentsFilter, userId?: string): Promise<AgentListResult> {
      const agentsCollection = db.collection('agents');

      // Build query
      const query: Record<string, unknown> = {};

      // Visibility filter
      if (filters.visibility === 'public' || !userId) {
        query.visibility = 'public';
      } else if (filters.visibility === 'private' && userId) {
        query.visibility = 'private';
        query.owner = userId;
      } else if (filters.visibility === 'all' && userId) {
        query.$or = [{ visibility: 'public' }, { visibility: 'private', owner: userId }];
      }

      // Owner filter
      if (filters.owner) {
        query.ownerUsername = filters.owner;
      }

      // Tag filter
      if (filters.tag) {
        query.tags = filters.tag;
      }

      // Count total
      const total = await agentsCollection.countDocuments(query);

      // Build sort
      const sortMap: Record<string, Record<string, 1 | -1>> = {
        downloads: { totalDownloads: -1 },
        updated: { updatedAt: -1 },
        created: { createdAt: -1 },
        name: { name: 1 },
      };
      const sort = sortMap[filters.sort || 'downloads'];

      // Pagination
      const skip = (filters.page - 1) * filters.limit;

      // Query
      const agents = await agentsCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(filters.limit)
        .toArray();

      return {
        agents: agents as AgentDocument[],
        total,
        page: filters.page,
        limit: filters.limit,
        hasMore: skip + filters.limit < total,
      };
    },

    async searchAgents(
      query: string,
      filters: SearchFilter,
      userId?: string
    ): Promise<AgentListResult> {
      const agentsCollection = db.collection('agents');

      // Build search query
      const searchQuery: Record<string, unknown> = {
        $text: { $search: query },
      };

      // Visibility filter
      if (filters.visibility === 'public' || !userId) {
        searchQuery.visibility = 'public';
      } else if (filters.visibility === 'private' && userId) {
        searchQuery.visibility = 'private';
        searchQuery.owner = userId;
      } else if (filters.visibility === 'all' && userId) {
        searchQuery.$or = [{ visibility: 'public' }, { visibility: 'private', owner: userId }];
      }

      // Count total
      const total = await agentsCollection.countDocuments(searchQuery);

      // Pagination
      const skip = (filters.page - 1) * filters.limit;

      // Query with text score
      const agents = await agentsCollection
        .find(searchQuery, { projection: { score: { $meta: 'textScore' } } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(filters.limit)
        .toArray();

      return {
        agents: agents as AgentDocument[],
        total,
        page: filters.page,
        limit: filters.limit,
        hasMore: skip + filters.limit < total,
      };
    },

    async incrementDownloads(agentId: string, version?: string): Promise<void> {
      const agentsCollection = db.collection('agents');
      const versionsCollection = db.collection('agent_versions');

      // Increment agent total
      await agentsCollection.updateOne({ _id: agentId }, { $inc: { totalDownloads: 1 } });

      // Increment version-specific
      const versionQuery: Record<string, unknown> = { agentId };
      if (version) {
        versionQuery.version = version;
      } else {
        versionQuery.isLatest = true;
      }

      await versionsCollection.updateOne(versionQuery, { $inc: { downloads: 1 } });
    },

    async findByMcpServer(
      serverName: string,
      page: number = 1,
      limit: number = 20,
      userId?: string
    ): Promise<AgentListResult> {
      const agentsCollection = db.collection('agents');

      const query: Record<string, unknown> = {
        [`mcpServers.${serverName}`]: { $exists: true },
      };

      // Visibility filter
      if (!userId) {
        query.visibility = 'public';
      } else {
        query.$or = [{ visibility: 'public' }, { visibility: 'private', owner: userId }];
      }

      const total = await agentsCollection.countDocuments(query);
      const skip = (page - 1) * limit;

      const agents = await agentsCollection
        .find(query)
        .sort({ totalDownloads: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        agents: agents as AgentDocument[],
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      };
    },

    async findWithMcpServers(
      page: number = 1,
      limit: number = 20,
      userId?: string
    ): Promise<AgentListResult> {
      const agentsCollection = db.collection('agents');

      const query: Record<string, unknown> = {
        mcpServers: { $exists: true, $ne: null },
      };

      // Visibility filter
      if (!userId) {
        query.visibility = 'public';
      } else {
        query.$or = [{ visibility: 'public' }, { visibility: 'private', owner: userId }];
      }

      const total = await agentsCollection.countDocuments(query);
      const skip = (page - 1) * limit;

      const agents = await agentsCollection
        .find(query)
        .sort({ totalDownloads: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        agents: agents as AgentDocument[],
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      };
    },
  };
}
