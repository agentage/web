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
    tags: agent.tags,
    latestVersion: agent.latestVersion,
    contentType: agent.contentType,
    agentVersion: agent.agentVersion,
    tools: agent.tools,
    hasMcpServers: !!agent.mcpServers && Object.keys(agent.mcpServers).length > 0,
    totalDownloads: agent.totalDownloads,
    stars: agent.stars,
    forks: agent.forks,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

export function mapAgentToDetailResponse(agent: AgentDocument): AgentDetailUiResponse {
  return {
    ...mapAgentToListResponse(agent),
    readme: agent.readme,
    latestContent: agent.latestContent,
    latestContentHash: agent.latestContentHash,
    mcpServers: agent.mcpServers,
    sections: agent.sections,
    versions: [], // Populated separately
  };
}

export function mapAgentVersionToResponse(version: AgentVersionDocument): AgentVersionUiResponse {
  return {
    version: version.version,
    agentVersion: version.agentVersion,
    contentType: version.contentType,
    content: version.content,
    contentHash: version.contentHash,
    tools: version.tools,
    mcpServers: version.mcpServers,
    sections: version.sections,
    changelog: version.changelog,
    downloads: version.downloads,
    publishedAt: version.publishedAt.toISOString(),
    isLatest: version.isLatest,
  };
}
