/**
 * Agents Routes
 * API endpoints for agent management
 */

import { Router } from 'express';
import { createJwtAuthMiddleware } from '../../middleware/jwt-auth.middleware';
import { AppServiceMap, ServiceProvider } from '../../services';
import { deleteAgentHandler } from './delete';
import { getAgentHandler } from './get-agent';
import { getAgentVersionHandler } from './get-version';
import { getListAgentsHandler } from './list';
import { getAgentsByMcpServerHandler, getMcpServersHandler } from './mcp-servers';
import { publishAgentHandler } from './publish';
import { searchAgentsHandler } from './search';
import { updateAgentMetadataHandler } from './update-metadata';
import { getAgentVersionsHandler } from './versions';

export const getAgentsRouter = (serviceProvider: ServiceProvider<AppServiceMap>) => {
  const router = Router();

  // Lazy initialization of JWT auth middleware
  let jwtAuth: ReturnType<typeof createJwtAuthMiddleware>;
  const getJwtAuth = async () => {
    if (!jwtAuth) {
      const jwtService = await serviceProvider.get('jwt');
      const userService = await serviceProvider.get('user');
      jwtAuth = createJwtAuthMiddleware({ jwtService, userService });
    }
    return jwtAuth;
  };

  // Public routes
  router.get('/', ...getListAgentsHandler(serviceProvider));
  router.get('/search', ...searchAgentsHandler(serviceProvider));
  router.get('/mcp-servers', ...getMcpServersHandler(serviceProvider));
  router.get('/mcp-servers/:serverName', ...getAgentsByMcpServerHandler(serviceProvider));
  router.get('/:owner/:name', ...getAgentHandler(serviceProvider));
  router.get('/:owner/:name/versions', ...getAgentVersionsHandler(serviceProvider));
  router.get('/:owner/:name/versions/:version', ...getAgentVersionHandler(serviceProvider));

  // Protected routes - use JWT auth middleware
  router.post(
    '/',
    async (req, res, next) => (await getJwtAuth()).requireAuth(req, res, next),
    ...publishAgentHandler(serviceProvider)
  );
  router.patch(
    '/:owner/:name',
    async (req, res, next) => (await getJwtAuth()).requireAuth(req, res, next),
    ...updateAgentMetadataHandler(serviceProvider)
  );
  router.delete(
    '/:owner/:name',
    async (req, res, next) => (await getJwtAuth()).requireAuth(req, res, next),
    ...deleteAgentHandler(serviceProvider)
  );

  return router;
};

export * from './delete';
export * from './get-agent';
export * from './get-version';
export * from './list';
export * from './mcp-servers';
export * from './publish';
export * from './search';
export * from './update-metadata';
export * from './versions';
