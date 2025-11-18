import { listAgentsQuerySchema } from '@agentage/shared';
import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentToListResponse } from '../../utils/agent-response.mapper';

export const getListAgentsHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    query: listAgentsQuerySchema,
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      const filters = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        visibility: req.query.visibility as 'public' | 'private' | 'all' | undefined,
        owner: req.query.owner as string | undefined,
        tag: req.query.tag as string | undefined,
        sort: (req.query.sort as 'downloads' | 'updated' | 'created' | 'name') || 'downloads',
      };

      const userId = (req.user as any)?.id;

      logger.info('List agents requested', { filters, userId });

      const result = await agentService.listAgents(filters, userId);
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
