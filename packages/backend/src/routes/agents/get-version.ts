import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validation.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { mapAgentToDetailResponse } from '../../utils/agent-response.mapper';

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
      const userId = (req.user as { id: string } | undefined)?.id;

      logger.info('Get agent version requested', { owner, name, version, userId });

      const versionDoc = await agentService.getAgentVersion(owner, name, version, userId);

      if (!versionDoc) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Version '${version}' of agent '${owner}/${name}' not found`,
        });
      }

      // Get agent for metadata
      const agent = await agentService.getAgent(owner, name, userId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Agent '${owner}/${name}' not found`,
        });
      }

      // Combine agent metadata with version content
      const response = {
        ...mapAgentToDetailResponse(agent),
        version: versionDoc.version,
        content: versionDoc.content,
        publishedAt: versionDoc.publishedAt.toISOString(),
      };

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
