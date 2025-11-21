/**
 * JWT Authentication Middleware
 * Extracts and verifies JWT tokens from Authorization header
 */

import { NextFunction, Request, Response } from 'express';
import type { JwtService } from '../services/jwt';
import type { UserService } from '../services/user';

export interface JwtAuthMiddleware {
  /**
   * Optional authentication - attaches user if token is valid, but doesn't reject invalid tokens
   */
  optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Required authentication - rejects requests without valid token
   */
  requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * Admin-only authentication - rejects non-admin users
   */
  requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export const createJwtAuthMiddleware = (deps: {
  jwtService: JwtService;
  userService: UserService;
}): JwtAuthMiddleware => {
  const { jwtService, userService } = deps;

  /**
   * Extract token from Authorization header
   */
  const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  };

  /**
   * Optional authentication middleware
   */
  const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req);

      if (!token) {
        // No token provided - continue without user
        return next();
      }

      const verifyResult = jwtService.verifyToken(token);

      if (verifyResult.valid && verifyResult.payload) {
        // Verify user still exists in database
        const user = await userService.getUserById(verifyResult.payload.userId);

        if (user) {
          req.user = {
            userId: verifyResult.payload.userId,
            email: verifyResult.payload.email,
            role: verifyResult.payload.role,
            isAuthenticated: true,
          };
        }
      }

      next();
    } catch (error) {
      // On error, continue without user
      next();
    }
  };

  /**
   * Required authentication middleware
   */
  const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req);

      if (!token) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'No authentication token provided',
        });
        return;
      }

      const verifyResult = jwtService.verifyToken(token);

      if (!verifyResult.valid) {
        res.status(401).json({
          error: 'Invalid token',
          message: verifyResult.expired ? 'Token has expired' : 'Authentication token is invalid',
        });
        return;
      }

      if (!verifyResult.payload) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'Token payload is missing',
        });
        return;
      }

      // Verify user still exists in database
      const user = await userService.getUserById(verifyResult.payload.userId);

      if (!user) {
        res.status(401).json({
          error: 'User not found',
          message: 'User account no longer exists',
        });
        return;
      }

      req.user = {
        userId: verifyResult.payload.userId,
        email: verifyResult.payload.email,
        role: verifyResult.payload.role,
        isAuthenticated: true,
      };

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Authentication error',
        message: 'An error occurred during authentication',
      });
    }
  };

  /**
   * Admin-only authentication middleware
   */
  const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // First check if user is authenticated
      await requireAuth(req, res, () => {
        // Check if user has admin role
        if (!req.user) {
          res.status(401).json({
            error: 'Authentication required',
            message: 'No authentication provided',
          });
          return;
        }

        if (req.user.role !== 'admin') {
          res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required',
          });
          return;
        }

        next();
      });
    } catch (error) {
      res.status(500).json({
        error: 'Authentication error',
        message: 'An error occurred during authentication',
      });
    }
  };

  return {
    optionalAuth,
    requireAuth,
    requireAdmin,
  };
};
