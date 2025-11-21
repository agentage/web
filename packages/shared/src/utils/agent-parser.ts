import matter from 'gray-matter';
import { z } from 'zod';
import type { AgentFrontmatter, AgentMcpServers, AgentSection } from '../types/agent.types';
import { agentMcpServersSchema } from '../types/agent.types';

export interface ParsedAgent {
  frontmatter: AgentFrontmatter;
  content: string;
  sections: AgentSection[];
  mcpServers?: AgentMcpServers;
}

/**
 * Parse agent markdown file with YAML frontmatter
 */
export function parseAgentMarkdown(content: string): ParsedAgent {
  const { data, content: markdownContent } = matter(content);

  // Validate frontmatter
  const frontmatter = validateFrontmatter(data);

  // Extract sections from markdown
  const sections = extractSections(markdownContent);

  return {
    frontmatter,
    content: markdownContent,
    sections,
    mcpServers: frontmatter['mcp-servers'],
  };
}

/**
 * Validate frontmatter against schema
 */
function validateFrontmatter(data: unknown): AgentFrontmatter {
  const schema = z.object({
    name: z.string(),
    description: z.string(),
    version: z.string().optional(),
    tools: z.array(z.string()).optional(),
    'mcp-servers': agentMcpServersSchema.optional(),
  });

  return schema.parse(data);
}

/**
 * Extract section metadata from markdown content
 */
function extractSections(content: string): AgentSection[] {
  const sections: AgentSection[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      sections.push({
        title: match[2].trim(),
        level: match[1].length,
        startLine: index + 1,
      });
    }
  });

  // Calculate end lines
  for (let i = 0; i < sections.length - 1; i++) {
    sections[i].endLine = sections[i + 1].startLine! - 1;
  }
  if (sections.length > 0) {
    sections[sections.length - 1].endLine = lines.length;
  }

  return sections;
}

/**
 * Serialize agent back to markdown with frontmatter
 */
export function serializeAgentMarkdown(parsed: ParsedAgent): string {
  const frontmatter: Record<string, unknown> = {
    name: parsed.frontmatter.name,
    description: parsed.frontmatter.description,
  };

  if (parsed.frontmatter.version) {
    frontmatter.version = parsed.frontmatter.version;
  }

  if (parsed.frontmatter.tools && parsed.frontmatter.tools.length > 0) {
    frontmatter.tools = parsed.frontmatter.tools;
  }

  if (parsed.mcpServers && Object.keys(parsed.mcpServers).length > 0) {
    frontmatter['mcp-servers'] = parsed.mcpServers;
  }

  return matter.stringify(parsed.content, frontmatter);
}

/**
 * Check if content is markdown with frontmatter
 */
export function isMarkdownWithFrontmatter(content: string): boolean {
  return content.trimStart().startsWith('---');
}

/**
 * Extract description from frontmatter or content
 */
export function extractDescription(content: string): string | undefined {
  try {
    const parsed = parseAgentMarkdown(content);
    return parsed.frontmatter.description;
  } catch {
    // Fallback: try to get first paragraph
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        return trimmed.substring(0, 500);
      }
    }
  }
  return undefined;
}
