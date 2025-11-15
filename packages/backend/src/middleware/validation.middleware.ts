/**
 * Validation Middleware
 * Zod-based validation middleware for Express routes
 */

import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import type { ServiceProvider } from '../services';
import type { AppServiceMap } from '../services/app.services';

/**
 * Multi-part request validation middleware
 */
export const validateRequest = (options: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  serviceProvider?: ServiceProvider<AppServiceMap>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Array<{ field: string; issues: z.ZodIssue[] }> = [];

      // Validate each part if schema is provided
      if (options.body) {
        const result = options.body.safeParse(req.body);
        if (!result.success) {
          errors.push({ field: 'body', issues: result.error.issues });
        } else {
          req.body = result.data;
        }
      }

      if (options.query) {
        const result = options.query.safeParse(req.query);
        if (!result.success) {
          errors.push({ field: 'query', issues: result.error.issues });
        } else {
          Object.assign(req.query, result.data);
        }
      }

      if (options.params) {
        const result = options.params.safeParse(req.params);
        if (!result.success) {
          errors.push({ field: 'params', issues: result.error.issues });
        } else {
          Object.assign(req.params, result.data);
        }
      }

      if (options.headers) {
        const result = options.headers.safeParse(req.headers);
        if (!result.success) {
          errors.push({ field: 'headers', issues: result.error.issues });
        }
      }

      // Return validation errors if any exist
      if (errors.length > 0) {
        await logValidationError(options.serviceProvider, req, 'Request validation failed', errors);

        const allIssues = errors.flatMap((error) =>
          error.issues.map((issue) => ({
            field: error.field,
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        );

        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request validation failed',
          details: allIssues,
        });
      }

      next();
    } catch (error) {
      await logError(options.serviceProvider, req, 'Validation processing failed', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Validation processing failed',
      });
    }
  };
};

/**
 * Helper function to log validation errors
 */
async function logValidationError(
  serviceProvider: ServiceProvider<AppServiceMap> | undefined,
  req: Request,
  message: string,
  details: z.ZodIssue[] | unknown
) {
  if (serviceProvider) {
    const logger = await serviceProvider.get('logger');
    logger.warn(message, {
      path: req.path,
      method: req.method,
      errors: details,
      ip: req.ip,
    });
  }
}

/**
 * Helper function to log general errors
 */
async function logError(
  serviceProvider: ServiceProvider<AppServiceMap> | undefined,
  req: Request,
  message: string,
  error: unknown
) {
  if (serviceProvider) {
    const logger = await serviceProvider.get('logger');
    logger.error(message, {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }
}

/**
 * Extend Express Request type to include validated data
 */
declare global {
  namespace Express {
    interface Request {
      validatedData?: Record<string, unknown>;
    }
  }
}
