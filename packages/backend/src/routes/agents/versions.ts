import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentVersionToResponse } from '../../utils/agent-response.mapper';

export const getAgentVersionsHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
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

      logger.info('Get agent versions requested', { owner, name, userId });

      const versions = await agentService.listAgentVersions(owner, name, userId);
      const mappedVersions = versions.map(mapAgentVersionToResponse);

      res.json({
        name,
        owner,
        versions: mappedVersions,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Agent not found') {
          return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
          });
        }
        if (error.message.startsWith('Forbidden')) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: error.message,
          });
        }
      }
      next(error);
    }
  },
];
