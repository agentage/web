/**
 * Authentication Middleware
 * Basic authentication for API endpoints
 */

import { NextFunction, Request, Response } from 'express';
import { ServiceProvider } from '../services';
import { AppServiceMap } from '../services/app.services';

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  return authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
};

/**
 * Create authentication middleware factory
 */
export const createAuthMiddleware = (serviceProvider: ServiceProvider<AppServiceMap>) => {
  return {
    /**
     * Require basic authentication
     * This is a simplified version that checks for a basic token
     */
    requireAuth: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const configService = await serviceProvider.get('config');
        const logger = await serviceProvider.get('logger');

        const token = extractTokenFromHeader(req);

        if (!token) {
          logger.warn('Authentication failed: No token provided', {
            path: req.path,
            method: req.method,
            ip: req.ip,
          });

          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        // Basic token validation (replace with JWT validation when implemented)
        const apiToken = configService.get('API_TOKEN');
        if (apiToken && token !== apiToken) {
          logger.warn('Authentication failed: Invalid token', {
            path: req.path,
            method: req.method,
            ip: req.ip,
          });

          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authentication token',
          });
        }

        // Attach user info to request (placeholder for JWT payload)
        (req as Express.Request & { user?: { id: string; role: string; email: string } }).user = {
          id: 'anonymous',
          role: 'user',
          email: 'anonymous@example.com',
        };

        next();
      } catch (error) {
        await logError(serviceProvider, req, error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Authentication processing failed',
        });
      }
    },

    /**
     * Require specific roles
     */
    requireRole: (roles: string[]) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          const logger = await serviceProvider.get('logger');
          const user = (req as Express.Request & { user?: { id: string; role: string } }).user;

          if (!user) {
            return res.status(401).json({
              error: 'Unauthorized',
              message: 'Authentication required',
            });
          }

          if (!roles.includes(user.role)) {
            logger.warn('Authorization failed: Insufficient permissions', {
              path: req.path,
              method: req.method,
              userId: user.id,
              userRole: user.role,
              requiredRoles: roles,
            });

            return res.status(403).json({
              error: 'Forbidden',
              message: 'Insufficient permissions',
            });
          }

          next();
        } catch (error) {
          await logError(serviceProvider, req, error);
          return res.status(500).json({
            error: 'Internal server error',
            message: 'Authorization processing failed',
          });
        }
      };
    },
  };
};

/**
 * Helper function to log auth errors
 */
async function logError(
  serviceProvider: ServiceProvider<AppServiceMap>,
  req: Request,
  error: unknown
) {
  try {
    const logger = await serviceProvider.get('logger');
    logger.error('Auth middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      userId: (req as Express.Request & { user?: { id: string } }).user?.id,
    });
  } catch {
    // Fallback to console if logger fails
    console.error('Auth middleware error:', error);
  }
}
