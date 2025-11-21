import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentToDetailResponse } from '../../utils/agent-response.mapper';

export const getAgentHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    params: z.object({
      owner: z.string().min(1),
      name: z.string().min(1),
    }),
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      const { owner, name } = req.params;
      const userId = (req.user as { id: string } | undefined)?.id;

      logger.info('Get agent requested', { owner, name, userId });

      const agent = await agentService.getAgent(owner, name, userId);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Agent '${owner}/${name}' not found`,
        });
      }

      // Get versions list
      const versions = await agentService.listAgentVersions(owner, name, userId);

      const mappedAgent = mapAgentToDetailResponse(agent);
      mappedAgent.versions = versions.map((v) => ({
        version: v.version,
        agentVersion: v.agentVersion,
        publishedAt: v.publishedAt.toISOString(),
        downloads: v.downloads,
        isLatest: v.isLatest,
      }));

      res.json({
        success: true,
        data: mappedAgent,
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Forbidden')) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: error.message,
        });
      }
      next(error);
    }
  },
];
