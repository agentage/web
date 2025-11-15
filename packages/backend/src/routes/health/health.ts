/**
 * Health Check Route
 * Simple health check endpoint
 */

import { Request, Response, Router } from 'express';
import { ServiceProvider } from '../../services';
import { AppServiceMap } from '../../services/app.services';

export const getHealthCheckRouter = (_serviceProvider: ServiceProvider<AppServiceMap>) => {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    });
  });

  return router;
};
