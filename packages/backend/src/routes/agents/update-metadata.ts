import { updateAgentMetadataSchema } from '@agentage/shared';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';

export const updateAgentMetadataHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    params: z.object({
      owner: z.string().min(1),
      name: z.string().min(1),
    }),
    body: updateAgentMetadataSchema,
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
      const userId = (req.user as { id: string }).id;

      logger.info('Update agent metadata requested', { owner, name, userId });

      const agent = await agentService.updateAgentMetadata(owner, name, userId, req.body);

      res.json({
        success: true,
        agent: {
          name: agent.name,
          owner: agent.ownerUsername,
          description: agent.description,
          visibility: agent.visibility,
          updatedAt: agent.updatedAt.toISOString(),
        },
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
