/**
 * Authentication Routes
 * OAuth authentication with JWT token generation
 * Implements stateless JWT-based authentication flow
 */

import { Request, Response, Router } from 'express';
import passport from 'passport';
import { createJwtAuthMiddleware } from '../../middleware/jwt-auth.middleware';
import type { AppServiceMap } from '../../services';
import type { ServiceProvider } from '../../services/app.services';

export const getAuthRouter = (serviceProvider: ServiceProvider<AppServiceMap>) => {
  const router = Router();

  // Initialize JWT auth middleware
  let jwtAuthMiddleware: ReturnType<typeof createJwtAuthMiddleware>;

  const initMiddleware = async () => {
    if (!jwtAuthMiddleware) {
      const jwtService = await serviceProvider.get('jwt');
      const userService = await serviceProvider.get('user');
      jwtAuthMiddleware = createJwtAuthMiddleware({ jwtService, userService });
    }
    return jwtAuthMiddleware;
  };

  // ===================================================================
  // GitHub OAuth Routes
  // ===================================================================

  router.get('/github', async (req: Request, res: Response, next) => {
    try {
      const logger = await serviceProvider.get('logger');
      logger.info('GitHub OAuth initiated', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    async (req: Request, res: Response, next) => {
      try {
        const logger = await serviceProvider.get('logger');
        const jwtService = await serviceProvider.get('jwt');
        const config = await serviceProvider.get('config');

        if (!req.user) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

        // Generate JWT token
        const token = jwtService.generateToken({
          userId: req.user.id || req.user._id?.toString() || '',
          email: req.user.email,
          role: req.user.role,
        });

        logger.info('GitHub OAuth callback successful - JWT generated', {
          userId: req.user.id,
          email: req.user.email,
        });

        // Redirect to frontend with token
        const frontendFqdn = config.get('FRONTEND_FQDN', 'localhost:3000');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const redirectUrl = `${protocol}://${frontendFqdn}/auth/callback?token=${token}`;
        res.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    }
  );

  // ===================================================================
  // Google OAuth Routes
  // ===================================================================

  router.get('/google', async (req: Request, res: Response, next) => {
    try {
      const logger = await serviceProvider.get('logger');
      logger.info('Google OAuth initiated', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req: Request, res: Response, next) => {
      try {
        const logger = await serviceProvider.get('logger');
        const jwtService = await serviceProvider.get('jwt');
        const config = await serviceProvider.get('config');

        if (!req.user) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

        // Generate JWT token
        const token = jwtService.generateToken({
          userId: req.user.id || req.user._id?.toString() || '',
          email: req.user.email,
          role: req.user.role,
        });

        logger.info('Google OAuth callback successful - JWT generated', {
          userId: req.user.id,
          email: req.user.email,
        });

        // Redirect to frontend with token
        const frontendFqdn = config.get('FRONTEND_FQDN', 'localhost:3000');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const redirectUrl = `${protocol}://${frontendFqdn}/auth/callback?token=${token}`;
        res.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    }
  );

  // ===================================================================
  // User Info & Management Routes (JWT-protected)
  // ===================================================================

  router.post('/logout', async (req: Request, res: Response) => {
    // For JWT, logout is handled client-side by removing the token
    // Server doesn't maintain sessions
    res.json({
      message: 'Logged out successfully',
      success: true,
    });
  });

  router.get('/me', async (req: Request, res: Response, next) => {
    try {
      const middleware = await initMiddleware();

      await middleware.requireAuth(req, res, async () => {
        const logger = await serviceProvider.get('logger');
        const userService = await serviceProvider.get('user');

        if (!req.user?.userId) {
          return res.status(401).json({
            error: 'Not authenticated',
            message: 'User not found in token',
          });
        }

        // Get full user data from database
        const userDoc = await userService.getUserById(req.user.userId);

        if (!userDoc) {
          return res.status(404).json({
            error: 'User not found',
            message: 'User account no longer exists',
          });
        }

        // Return safe user data
        const safeUser = {
          id: userDoc._id!,
          email: userDoc.email,
          name: userDoc.name,
          avatar: userDoc.avatar,
          role: userDoc.role,
          providers: Object.keys(userDoc.providers),
          createdAt: userDoc.createdAt,
          updatedAt: userDoc.updatedAt,
        };

        logger.info('User info retrieved', { userId: safeUser.id });

        res.json({
          user: safeUser,
          authenticated: true,
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Authentication status check
  router.get('/status', async (req: Request, res: Response) => {
    const middleware = await initMiddleware();

    await middleware.optionalAuth(req, res, async () => {
      res.json({
        authenticated: req.user?.isAuthenticated || false,
        user: req.user?.isAuthenticated
          ? {
              userId: req.user.userId,
              email: req.user.email,
              role: req.user.role,
            }
          : null,
      });
    });
  });

  // Get user's linked providers
  router.get('/providers', async (req: Request, res: Response, next) => {
    try {
      const middleware = await initMiddleware();

      await middleware.requireAuth(req, res, async () => {
        const userService = await serviceProvider.get('user');

        if (!req.user?.userId) {
          return res.status(401).json({ error: 'Not authenticated' });
        }

        const providers = await userService.getProviders(req.user.userId);

        res.json({
          providers,
        });
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
