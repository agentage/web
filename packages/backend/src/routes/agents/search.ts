import { searchAgentsQuerySchema } from '@agentage/shared';
import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentToListResponse } from '../../utils/agent-response.mapper';

export const searchAgentsHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    query: searchAgentsQuerySchema,
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      const query = req.query.q as string;
      const filters = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        visibility: req.query.visibility as 'public' | 'private' | 'all' | undefined,
      };

      const userId = (req.user as { id: string } | undefined)?.id;

      logger.info('Search agents requested', { query, filters, userId });

      const result = await agentService.searchAgents(query, filters, userId);
      const mappedAgents = result.agents.map(mapAgentToListResponse);

      res.json({
        agents: mappedAgents,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
];
