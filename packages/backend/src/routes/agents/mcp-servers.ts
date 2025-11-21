import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentToListResponse } from '../../utils/agent-response.mapper';

export const getMcpServersHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const userId = (req.user as { id: string } | undefined)?.id;

      logger.info('List agents with MCP servers requested', { page, limit, userId });

      const result = await agentService.findWithMcpServers(page, limit, userId);

      res.json({
        success: true,
        data: {
          agents: result.agents.map(mapAgentToListResponse),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            hasMore: result.hasMore,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

export const getAgentsByMcpServerHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    params: z.object({
      serverName: z.string().min(1),
    }),
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      const { serverName } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const userId = (req.user as { id: string } | undefined)?.id;

      logger.info('List agents by MCP server requested', { serverName, page, limit, userId });

      const result = await agentService.findByMcpServer(serverName, page, limit, userId);

      res.json({
        success: true,
        data: {
          serverName,
          agents: result.agents.map(mapAgentToListResponse),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            hasMore: result.hasMore,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
];
