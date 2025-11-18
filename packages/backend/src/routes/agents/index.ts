/**
 * Agents Routes
 * API endpoints for agent management
 */

import { Router } from 'express';
import { createAuthMiddleware } from '../../middleware/auth.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { deleteAgentHandler } from './delete';
import { getAgentHandler } from './get-agent';
import { getAgentVersionHandler } from './get-version';
import { getListAgentsHandler } from './list';
import { publishAgentHandler } from './publish';
import { searchAgentsHandler } from './search';
import { updateAgentMetadataHandler } from './update-metadata';
import { getAgentVersionsHandler } from './versions';

export const getAgentsRouter = (serviceProvider: ServiceProvider<AppServiceMap>) => {
  const router = Router();
  const auth = createAuthMiddleware(serviceProvider);

  // Public routes
  router.get('/', ...getListAgentsHandler(serviceProvider));
  router.get('/search', ...searchAgentsHandler(serviceProvider));
  router.get('/:owner/:name', ...getAgentHandler(serviceProvider));
  router.get('/:owner/:name/versions', ...getAgentVersionsHandler(serviceProvider));
  router.get('/:owner/:name/versions/:version', ...getAgentVersionHandler(serviceProvider));

  // Protected routes
  router.post('/', auth.requireAuth, ...publishAgentHandler(serviceProvider));
  router.patch('/:owner/:name', auth.requireAuth, ...updateAgentMetadataHandler(serviceProvider));
  router.delete('/:owner/:name', auth.requireAuth, ...deleteAgentHandler(serviceProvider));

  return router;
};

export * from './delete';
export * from './get-agent';
export * from './get-version';
export * from './list';
export * from './publish';
export * from './search';
export * from './update-metadata';
export * from './versions';
