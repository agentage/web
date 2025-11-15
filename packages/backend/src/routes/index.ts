/**
 * Routes Module Exports
 * Central export point for all application routes
 */

import { Router } from 'express';
import { ServiceProvider } from '../services';
import { AppServiceMap } from '../services/app.services';

// Route Modules
import { getHealthCheckRouter } from './health/health';
import { getStatusRouter } from './status';

/**
 * Main router factory that combines all application routes
 */
export const getRouters = (serviceProvider: ServiceProvider<AppServiceMap>) => {
  const router = Router();

  // Health Check Routes
  router.use('/api/health', getHealthCheckRouter(serviceProvider));

  // Status Monitoring Routes
  router.use('/api/status', getStatusRouter(serviceProvider));

  // Future routes will be added here:
  // router.use('/api/auth', getAuthRouter(serviceProvider));
  // router.use('/api/agents', getAgentsRouter(serviceProvider));

  return router;
};

// Individual Route Exports (for testing and selective imports)
export { getHealthCheckRouter } from './health/health';
export { createStatusRouter, getStatusRouter } from './status';
