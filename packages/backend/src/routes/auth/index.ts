/**
 * Authentication Routes
 * OAuth authentication with JWT token generation
 * Implements stateless JWT-based authentication flow
 * Includes Device Authorization Grant (RFC 8628) for CLI
 */

import type { DeviceAuthError } from '@agentage/shared';
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

      // Store device code in session state if coming from device flow
      const deviceUserCode = req.query.device_code as string | undefined;

      // Desktop OAuth parameters
      const desktop = req.query.desktop === 'true';
      const callback = req.query.callback as string | undefined;
      const includeProviderToken = req.query.include_provider_token === 'true';

      logger.info('GitHub OAuth initiated', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        isDeviceFlow: !!deviceUserCode,
        isDesktop: desktop,
      });

      // Build state parameter with all flow information
      const stateData: any = {};
      if (deviceUserCode) stateData.device_code = deviceUserCode;
      if (desktop) {
        stateData.desktop = true;
        stateData.callback = callback;
        stateData.include_provider_token = includeProviderToken;
      }
      const state = Object.keys(stateData).length > 0 ? JSON.stringify(stateData) : undefined;

      passport.authenticate('github', {
        scope: ['user:email'],
        state,
      })(req, res, next);
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

        // Parse state parameter for flow information
        let stateData: any = {};
        try {
          const state = req.query.state as string;
          if (state) {
            stateData = JSON.parse(state);
          }
        } catch {
          // Invalid or missing state
        }

        const frontendFqdn = config.get('FRONTEND_FQDN', 'localhost:3000');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

        // Check for desktop flow
        if (stateData.desktop && stateData.callback) {
          // Validate callback is localhost
          try {
            const callbackUrl = new URL(stateData.callback);
            if (callbackUrl.hostname !== 'localhost' && callbackUrl.hostname !== '127.0.0.1') {
              logger.warn('Invalid desktop callback URL - not localhost', {
                callback: stateData.callback,
              });
              return res.status(400).json({ error: 'Invalid callback URL - must be localhost' });
            }

            // Build redirect URL with token
            callbackUrl.searchParams.set('token', token);

            // Include provider token if requested
            if (stateData.include_provider_token && req.user.providerToken) {
              callbackUrl.searchParams.set('github_token', req.user.providerToken);
            }

            logger.info('Redirecting to desktop callback', { callback: callbackUrl.toString() });
            return res.redirect(callbackUrl.toString());
          } catch (error) {
            logger.error('Error parsing desktop callback URL', {
              error,
              callback: stateData.callback,
            });
            return res.status(400).json({ error: 'Invalid callback URL format' });
          }
        }

        // Check if this is from device flow
        if (stateData.device_code) {
          // Redirect to device authorization page with token
          const redirectUrl = `${protocol}://${frontendFqdn}/device/authorize?token=${token}&code=${stateData.device_code}`;
          logger.info('Redirecting to device authorization', {
            deviceUserCode: stateData.device_code,
          });
          return res.redirect(redirectUrl);
        }

        // Regular OAuth flow - redirect to frontend with token
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

      // Desktop OAuth parameters
      const desktop = req.query.desktop === 'true';
      const callback = req.query.callback as string | undefined;
      const includeProviderToken = req.query.include_provider_token === 'true';

      logger.info('Google OAuth initiated', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        isDesktop: desktop,
      });

      // Build state parameter with desktop flow information
      const stateData: any = {};
      if (desktop) {
        stateData.desktop = true;
        stateData.callback = callback;
        stateData.include_provider_token = includeProviderToken;
      }
      const state = Object.keys(stateData).length > 0 ? JSON.stringify(stateData) : undefined;

      passport.authenticate('google', {
        scope: ['profile', 'email'],
        state,
      })(req, res, next);
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

        // Parse state parameter for flow information
        let stateData: any = {};
        try {
          const state = req.query.state as string;
          if (state) {
            stateData = JSON.parse(state);
          }
        } catch {
          // Invalid or missing state
        }

        const frontendFqdn = config.get('FRONTEND_FQDN', 'localhost:3000');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

        // Check for desktop flow
        if (stateData.desktop && stateData.callback) {
          // Validate callback is localhost
          try {
            const callbackUrl = new URL(stateData.callback);
            if (callbackUrl.hostname !== 'localhost' && callbackUrl.hostname !== '127.0.0.1') {
              logger.warn('Invalid desktop callback URL - not localhost', {
                callback: stateData.callback,
              });
              return res.status(400).json({ error: 'Invalid callback URL - must be localhost' });
            }

            // Build redirect URL with token
            callbackUrl.searchParams.set('token', token);

            // Include provider token if requested
            if (stateData.include_provider_token && req.user.providerToken) {
              callbackUrl.searchParams.set('google_token', req.user.providerToken);
            }

            logger.info('Redirecting to desktop callback', { callback: callbackUrl.toString() });
            return res.redirect(callbackUrl.toString());
          } catch (error) {
            logger.error('Error parsing desktop callback URL', {
              error,
              callback: stateData.callback,
            });
            return res.status(400).json({ error: 'Invalid callback URL format' });
          }
        }

        // Redirect to frontend with token
        const redirectUrl = `${protocol}://${frontendFqdn}/auth/callback?token=${token}`;
        res.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    }
  );

  // ===================================================================
  // Microsoft OAuth Routes
  // ===================================================================

  router.get('/microsoft', async (req: Request, res: Response, next) => {
    try {
      const logger = await serviceProvider.get('logger');

      // Desktop OAuth parameters
      const desktop = req.query.desktop === 'true';
      const callback = req.query.callback as string | undefined;
      const includeProviderToken = req.query.include_provider_token === 'true';

      logger.info('Microsoft OAuth initiated', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        isDesktop: desktop,
      });

      // Build state parameter with desktop flow information
      const stateData: any = {};
      if (desktop) {
        stateData.desktop = true;
        stateData.callback = callback;
        stateData.include_provider_token = includeProviderToken;
      }
      const state = Object.keys(stateData).length > 0 ? JSON.stringify(stateData) : undefined;

      passport.authenticate('microsoft', {
        scope: ['user.read'],
        state,
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  });

  router.get(
    '/microsoft/callback',
    passport.authenticate('microsoft', { session: false, failureRedirect: '/login' }),
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

        logger.info('Microsoft OAuth callback successful - JWT generated', {
          userId: req.user.id,
          email: req.user.email,
        });

        // Parse state parameter for flow information
        let stateData: any = {};
        try {
          const state = req.query.state as string;
          if (state) {
            stateData = JSON.parse(state);
          }
        } catch {
          // Invalid or missing state
        }

        const frontendFqdn = config.get('FRONTEND_FQDN', 'localhost:3000');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

        // Check for desktop flow
        if (stateData.desktop && stateData.callback) {
          // Validate callback is localhost
          try {
            const callbackUrl = new URL(stateData.callback);
            if (callbackUrl.hostname !== 'localhost' && callbackUrl.hostname !== '127.0.0.1') {
              logger.warn('Invalid desktop callback URL - not localhost', {
                callback: stateData.callback,
              });
              return res.status(400).json({ error: 'Invalid callback URL - must be localhost' });
            }

            // Build redirect URL with token
            callbackUrl.searchParams.set('token', token);

            // Include provider token if requested
            if (stateData.include_provider_token && req.user.providerToken) {
              callbackUrl.searchParams.set('microsoft_token', req.user.providerToken);
            }

            logger.info('Redirecting to desktop callback', { callback: callbackUrl.toString() });
            return res.redirect(callbackUrl.toString());
          } catch (error) {
            logger.error('Error parsing desktop callback URL', {
              error,
              callback: stateData.callback,
            });
            return res.status(400).json({ error: 'Invalid callback URL format' });
          }
        }

        // Redirect to frontend with token
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
          verifiedAlias: userDoc.verifiedAlias,
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

  // ===================================================================
  // Device Authorization Routes (RFC 8628) - For CLI Authentication
  // ===================================================================

  /**
   * POST /api/auth/device/code
   * Initiates device authorization flow by requesting a device code
   */
  router.post('/device/code', async (req: Request, res: Response, next) => {
    try {
      const logger = await serviceProvider.get('logger');
      const deviceCodeService = await serviceProvider.get('deviceCode');

      const provider = req.body?.provider || 'github';

      // Only support GitHub for now
      if (provider !== 'github') {
        const error: DeviceAuthError = {
          error: 'invalid_request',
          error_description: 'Invalid provider specified. Only "github" is supported.',
        };
        return res.status(400).json(error);
      }

      logger.info('Device code requested', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        provider,
      });

      const deviceCodeResponse = await deviceCodeService.createDeviceCode(provider);

      res.json(deviceCodeResponse);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/auth/device/token
   * Poll this endpoint to check if user has completed authentication
   */
  router.post('/device/token', async (req: Request, res: Response, next) => {
    try {
      const logger = await serviceProvider.get('logger');
      const deviceCodeService = await serviceProvider.get('deviceCode');

      const deviceCode = req.body?.device_code;

      if (!deviceCode) {
        const error: DeviceAuthError = {
          error: 'invalid_request',
          error_description: 'device_code is required',
        };
        return res.status(400).json(error);
      }

      try {
        const tokenResponse = await deviceCodeService.pollForToken(deviceCode);

        if (!tokenResponse) {
          // Still pending authorization
          const error: DeviceAuthError = {
            error: 'authorization_pending',
            error_description: 'The user has not yet completed authorization',
          };
          return res.status(400).json(error);
        }

        logger.info('Device token issued', {
          userId: tokenResponse.user.id,
        });

        res.json(tokenResponse);
      } catch (pollError: unknown) {
        // Handle specific device auth errors
        const err = pollError as DeviceAuthError;
        if (err.error && err.error_description) {
          return res.status(400).json(err);
        }
        throw pollError;
      }
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/auth/device/authorize
   * Called by the frontend to authorize a device code after OAuth login
   */
  router.post('/device/authorize', async (req: Request, res: Response, next) => {
    try {
      const middleware = await initMiddleware();

      await middleware.requireAuth(req, res, async () => {
        const logger = await serviceProvider.get('logger');
        const deviceCodeService = await serviceProvider.get('deviceCode');

        const userCode = req.body?.user_code;

        if (!userCode) {
          return res.status(400).json({
            error: 'invalid_request',
            error_description: 'user_code is required',
          });
        }

        if (!req.user?.userId) {
          return res.status(401).json({
            error: 'unauthorized',
            error_description: 'User not authenticated',
          });
        }

        const result = await deviceCodeService.authorizeDeviceCode(userCode, req.user.userId);

        if (!result) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Invalid, expired, or already used device code',
          });
        }

        logger.info('Device code authorized via API', {
          userId: req.user.userId,
          userCode,
        });

        res.json({
          success: true,
          message: 'Device authorized successfully',
        });
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/auth/device/verify
   * Verify a user code exists and is valid (used by frontend before OAuth redirect)
   */
  router.get('/device/verify', async (req: Request, res: Response, next) => {
    try {
      const deviceCodeService = await serviceProvider.get('deviceCode');

      const userCode = req.query?.code as string;

      if (!userCode) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'code query parameter is required',
        });
      }

      const deviceCodeDoc = await deviceCodeService.getDeviceCodeByUserCode(userCode);

      if (!deviceCodeDoc) {
        return res.status(404).json({
          error: 'invalid_grant',
          error_description: 'Invalid or unknown device code',
        });
      }

      if (deviceCodeDoc.expiresAt < new Date()) {
        return res.status(400).json({
          error: 'expired_token',
          error_description: 'The device code has expired',
        });
      }

      if (deviceCodeDoc.authorizedAt) {
        return res.status(400).json({
          error: 'access_denied',
          error_description: 'The device code has already been used',
        });
      }

      res.json({
        valid: true,
        user_code: deviceCodeDoc.userCode,
        expires_in: Math.floor((deviceCodeDoc.expiresAt.getTime() - Date.now()) / 1000),
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
