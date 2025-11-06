import { Router } from 'express';
import type { HealthStatus } from '@agentage/shared';

export const createStatusRouter = (): Router => {
  const router = Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };
    res.json(health);
  });

  // Detailed status endpoint
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
