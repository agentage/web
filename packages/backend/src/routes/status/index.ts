/**
 * Status Routes
 * System status and monitoring endpoints
 */

import type { HealthStatus } from '@agentage/shared';
import { Request, Response, Router } from 'express';
import { ServiceProvider } from '../../services';
import { AppServiceMap } from '../../services/app.services';

export const getStatusRouter = (serviceProvider: ServiceProvider<AppServiceMap>) => {
  const router = Router();

  // Detailed status endpoint (new location: /api/status)
  router.get('/', async (req: Request, res: Response) => {
    try {
      const mongoService = await serviceProvider.get('mongo');
      const logger = await serviceProvider.get('logger');

      // Check MongoDB connection
      let mongoStatus = 'disconnected';
      try {
        const dbHealth = await mongoService.healthCheck();
        mongoStatus = dbHealth.connected ? 'connected' : 'disconnected';
      } catch (error) {
        mongoStatus = 'error';
      }

      const statusInfo = {
        status: mongoStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        memory: process.memoryUsage(),
        database: {
          mongodb: mongoStatus,
        },
      };

      logger.info('Status check requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(statusInfo);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      });
    }
  });

  return router;
};

/**
 * Create status router (backward compatible export)
 * This matches the old API signature for backward compatibility
 */
export const createStatusRouter = (): Router => {
  const router = Router();

  // Health check endpoint (backward compatible: /api/health when mounted at /api)
  router.get('/health', (req, res) => {
    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };
    res.json(health);
  });

  // Detailed status endpoint (backward compatible: /api/status when mounted at /api)
  router.get('/status', (req, res) => {
    const status = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      memory: process.memoryUsage(),
    };
    res.json(status);
  });

  return router;
};
