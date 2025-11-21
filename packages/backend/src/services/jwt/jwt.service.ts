import type { JwtPayload, JwtServiceMethods, JwtVerifyResult } from '@agentage/shared';
import jwt from 'jsonwebtoken';
import type { ConfigService, LoggerService, Service } from '../app.services';

export interface JwtService extends Service, JwtServiceMethods {}

export const createJwtService = (config: ConfigService, logger: LoggerService): JwtService => {
  const jwtSecret = config.get('JWT_SECRET');
  const jwtExpiresIn = config.get('JWT_EXPIRES_IN', '7d');

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return {
    async initialize() {
      logger.info('JWT service initialized', {
        expiresIn: jwtExpiresIn,
      });
    },

    generateToken(payload: JwtPayload): string {
      try {
        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: jwtExpiresIn,
          issuer: 'agentage.io',
          audience: 'agentage.io',
        } as jwt.SignOptions);

        logger.debug('JWT token generated', {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          expiresIn: jwtExpiresIn,
        });

        return token;
      } catch (error) {
        logger.error('Failed to generate JWT token', { error });
        throw new Error('Failed to generate authentication token');
      }
    },

    verifyToken(token: string): JwtVerifyResult {
      try {
        const decoded = jwt.verify(token, jwtSecret, {
          issuer: 'agentage.io',
          audience: 'agentage.io',
        }) as JwtPayload;

        return {
          valid: true,
          payload: {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
          },
        };
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          logger.debug('JWT token expired', { error: error.message });
          return {
            valid: false,
            error: 'Token expired',
            expired: true,
          };
        }

        if (error instanceof jwt.JsonWebTokenError) {
          logger.debug('Invalid JWT token', { error: error.message });
          return {
            valid: false,
            error: 'Invalid token',
            expired: false,
          };
        }

        logger.error('JWT verification error', { error });
        return {
          valid: false,
          error: 'Token verification failed',
          expired: false,
        };
      }
    },

    decodeToken(token: string): JwtPayload | null {
      try {
        const decoded = jwt.decode(token) as JwtPayload | null;
        return decoded;
      } catch (error) {
        logger.debug('Failed to decode JWT token', { error });
        return null;
      }
    },
  };
};
