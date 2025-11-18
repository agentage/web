import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';

export const deleteAgentHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    params: z.object({
      owner: z.string().min(1),
      name: z.string().min(1),
    }),
    query: z.object({
      version: z.string().optional(),
    }),
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const { owner, name } = req.params;
      const { version } = req.query;
      const userId = (req.user as { id: string }).id;

      if (version) {
        logger.info('Delete agent version requested', { owner, name, version, userId });
        await agentService.deleteAgentVersion(owner, name, version as string, userId);
        res.json({
          success: true,
          message: `Version '${version}' of agent '${name}' deleted`,
        });
      } else {
        logger.info('Delete agent requested', { owner, name, userId });
        await agentService.deleteAgent(owner, name, userId);
        res.json({
          success: true,
          message: `Agent '${name}' deleted`,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
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
