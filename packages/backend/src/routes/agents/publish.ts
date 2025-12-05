import { createAgentSchema } from '@agentage/shared';
import { NextFunction, Request, Response } from 'express';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';

export const publishAgentHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    body: createAgentSchema,
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

      // Support both JWT auth (userId) and OAuth callback (id/_id)
      const userId = req.user.userId || req.user.id || req.user._id?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User ID not found in token',
        });
      }

      logger.info('Publish agent requested', { userId, name: req.body.name });

      const agent = await agentService.publishAgent(userId, req.body);

      res.status(201).json({
        success: true,
        agent: {
          name: agent.name,
          owner: agent.ownerUsername,
          version: agent.latestVersion,
          contentHash: agent.latestContentHash,
          visibility: agent.visibility,
          publishedAt: agent.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('must be greater than')) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: error.message,
          });
        }
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: error.message,
          });
        }
      }
      next(error);
    }
  },
];
