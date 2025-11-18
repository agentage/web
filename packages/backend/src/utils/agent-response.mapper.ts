import type {
  AgentDetailUiResponse,
  AgentDocument,
  AgentUiResponse,
  AgentVersionDocument,
  AgentVersionUiResponse,
} from '@agentage/shared';

export function mapAgentToListResponse(agent: AgentDocument): AgentUiResponse {
  return {
    name: agent.name,
    owner: agent.ownerUsername,
    description: agent.description,
    visibility: agent.visibility,
    latestVersion: agent.latestVersion,
    downloads: agent.totalDownloads,
    tags: agent.tags,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

export function mapAgentToDetailResponse(agent: AgentDocument): AgentDetailUiResponse {
  return {
    name: agent.name,
    owner: agent.ownerUsername,
    description: agent.description,
    visibility: agent.visibility,
    latestVersion: agent.latestVersion,
    downloads: agent.totalDownloads,
    tags: agent.tags,
    readme: agent.readme,
    content: agent.latestContent,
    stats: {
      downloads: agent.totalDownloads,
      stars: agent.stars,
      forks: agent.forks,
    },
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

export function mapAgentVersionToResponse(version: AgentVersionDocument): AgentVersionUiResponse {
  return {
    version: version.version,
    description: version.changelog,
    publishedAt: version.publishedAt.toISOString(),
    downloads: version.downloads,
    isLatest: version.isLatest,
  };
}
