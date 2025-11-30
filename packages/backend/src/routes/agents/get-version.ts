import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentVersionToResponse } from '../../utils/agent-response.mapper';

export const getAgentVersionHandler = (serviceProvider: ServiceProvider<AppServiceMap>) => [
  validateRequest({
    params: z.object({
      owner: z.string().min(1),
      name: z.string().min(1),
      version: z.string().regex(/^\d+\.\d+\.\d+$/),
    }),
    serviceProvider,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logger = await serviceProvider.get('logger');
      const agentService = await serviceProvider.get('agent');

      const { owner, name, version } = req.params;
      // Support both JWT auth (userId) and OAuth callback (id/_id)
      const userId = req.user?.userId || req.user?.id || req.user?._id?.toString();

      logger.info('Get agent version requested', { owner, name, version, userId });

      const versionDoc = await agentService.getAgentVersion(owner, name, version, userId);

      if (!versionDoc) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Version '${version}' of agent '${owner}/${name}' not found`,
        });
      }

      const response = mapAgentVersionToResponse(versionDoc);

      res.json({
        success: true,
        data: response,
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
