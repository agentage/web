/**
 * Error Handling Middleware
 * Provides automatic try/catch wrapping for route handlers with consistent error responses
 */

import { NextFunction, Request, Response } from 'express';
import type { ServiceProvider } from '../services';
import type { AppServiceMap } from '../services/app.services';

/**
 * Route handler type that can be async or sync
 */
type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response> | void | Response;

/**
 * Create error handling middleware that wraps route handlers in try/catch
 */
export const createErrorHandler = (serviceProvider?: ServiceProvider<AppServiceMap>) => {
  /**
   * Wrap a route handler with automatic error handling
   */
  const wrapHandler = (handler: RouteHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await handler(req, res, next);
        return result;
      } catch (error) {
        await logError(serviceProvider, req, error);

        // Don't send response if already sent
        if (res.headersSent) {
          return next(error);
        }

        // Send error response
        return res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        });
      }
    };
  };

  return {
    /**
     * Wrap a single route handler
     */
    wrap: wrapHandler,

    /**
     * Wrap multiple route handlers (for middleware chains)
     */
    wrapAll: (...handlers: RouteHandler[]) => {
      return handlers.map((handler) => wrapHandler(handler));
    },

    /**
     * Express error handling middleware (should be used as the last middleware)
     */
    errorMiddleware: (error: Error, req: Request, res: Response, next: NextFunction) => {
      logError(serviceProvider, req, error);

      // Don't send response if already sent
      if (res.headersSent) {
        return next(error);
      }

      // Send error response
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      });
    },
  };
};

/**
 * Helper function to log errors consistently
 */
async function logError(
  serviceProvider: ServiceProvider<AppServiceMap> | undefined,
  req: Request,
  error: unknown
) {
  const errorInfo = {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as Express.Request & { user?: { id: string } }).user?.id,
  };

  if (serviceProvider) {
    try {
      const logger = await serviceProvider.get('logger');
      logger.error('Route error', errorInfo);
    } catch (logError) {
      console.error('Failed to log error:', logError);
      console.error('Original error:', error);
    }
  } else {
    console.error('Route error:', errorInfo);
  }
}
