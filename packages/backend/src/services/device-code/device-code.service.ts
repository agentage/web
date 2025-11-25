/**
 * Device Code Service
 * Manages device authorization codes for CLI authentication
 * Implements OAuth 2.0 Device Authorization Grant (RFC 8628)
 */

import type { DeviceCodeDocument, DeviceCodeResponse, DeviceTokenResponse } from '@agentage/shared';
import { randomBytes, randomUUID } from 'crypto';
import type { LoggerService, MongoService, Service } from '../app.services';
import type { JwtService } from '../jwt';
import type { UserService } from '../user';

export interface DeviceCodeService extends Service {
  /**
   * Create a new device code for CLI authentication
   */
  createDeviceCode(provider: 'github'): Promise<DeviceCodeResponse>;

  /**
   * Get device code by device code string
   */
  getDeviceCode(deviceCode: string): Promise<DeviceCodeDocument | null>;

  /**
   * Get device code by user code
   */
  getDeviceCodeByUserCode(userCode: string): Promise<DeviceCodeDocument | null>;

  /**
   * Authorize a device code after successful OAuth
   */
  authorizeDeviceCode(userCode: string, userId: string): Promise<DeviceTokenResponse | null>;

  /**
   * Poll for token - returns token if authorized, null if pending, throws if error
   */
  pollForToken(deviceCode: string): Promise<DeviceTokenResponse | null>;

  /**
   * Clean up expired device codes
   */
  cleanupExpiredCodes(): Promise<number>;
}

const EXPIRES_IN_SECONDS = 900; // 15 minutes
const POLLING_INTERVAL_SECONDS = 5;

/**
 * Generate a cryptographically random device code (32+ bytes base64url)
 */
function generateDeviceCode(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generate a user-friendly code: XXXX-XXXX
 * Uses only unambiguous characters (no 0/O, 1/I/L)
 */
function generateUserCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
    if (i === 3) code += '-';
  }
  return code;
}

export const createDeviceCodeService = (
  mongo: MongoService,
  jwtService: JwtService,
  userService: UserService,
  logger: LoggerService,
  config: { apiFqdn: string }
): DeviceCodeService => {
  const getCollection = () => {
    const db = mongo.getDb();
    return db.collection('device_codes');
  };

  return {
    async initialize() {
      const db = mongo.getDb();
      // Access raw collection for index creation
      const rawDb = db.getRawDb();
      const collection = rawDb.collection('device_codes');

      // Create TTL index for automatic cleanup
      try {
        await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        await collection.createIndex({ deviceCode: 1 }, { unique: true });
        await collection.createIndex({ userCode: 1 }, { unique: true });
        logger.info('Device code service initialized with TTL index');
      } catch (error) {
        // Indexes might already exist
        logger.debug('Device code indexes already exist or creation failed', { error });
      }
    },

    async createDeviceCode(provider: 'github'): Promise<DeviceCodeResponse> {
      const collection = getCollection();

      const deviceCode = generateDeviceCode();
      const userCode = generateUserCode();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + EXPIRES_IN_SECONDS * 1000);

      const doc: DeviceCodeDocument = {
        _id: randomUUID(),
        deviceCode,
        userCode,
        provider,
        expiresAt,
        createdAt: now,
      };

      await collection.insertOne(doc);

      logger.info('Device code created', {
        userCode,
        provider,
        expiresAt: expiresAt.toISOString(),
      });

      const apiFqdn = config.apiFqdn;
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

      return {
        device_code: deviceCode,
        user_code: userCode,
        verification_uri: `${protocol}://${apiFqdn}/device`,
        verification_uri_complete: `${protocol}://${apiFqdn}/device?code=${userCode}`,
        expires_in: EXPIRES_IN_SECONDS,
        interval: POLLING_INTERVAL_SECONDS,
      };
    },

    async getDeviceCode(deviceCode: string): Promise<DeviceCodeDocument | null> {
      const collection = getCollection();
      return collection.findOne({ deviceCode });
    },

    async getDeviceCodeByUserCode(userCode: string): Promise<DeviceCodeDocument | null> {
      const collection = getCollection();
      // Normalize user code (uppercase, with hyphen)
      const normalizedCode = userCode.toUpperCase().replace(/\s/g, '');
      const formattedCode = normalizedCode.includes('-')
        ? normalizedCode
        : `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;

      return collection.findOne({ userCode: formattedCode });
    },

    async authorizeDeviceCode(
      userCode: string,
      userId: string
    ): Promise<DeviceTokenResponse | null> {
      const collection = getCollection();

      // Find the device code
      const normalizedCode = userCode.toUpperCase().replace(/\s/g, '');
      const formattedCode = normalizedCode.includes('-')
        ? normalizedCode
        : `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;

      const deviceCodeDoc = await collection.findOne({ userCode: formattedCode });

      if (!deviceCodeDoc) {
        logger.warn('Device code not found for authorization', { userCode: formattedCode });
        return null;
      }

      // Check if expired
      if (deviceCodeDoc.expiresAt < new Date()) {
        logger.warn('Device code expired', { userCode: formattedCode });
        return null;
      }

      // Check if already authorized
      if (deviceCodeDoc.authorizedAt) {
        logger.warn('Device code already authorized', { userCode: formattedCode });
        return null;
      }

      // Get user info
      const user = await userService.getUserById(userId);
      if (!user) {
        logger.error('User not found for device authorization', { userId });
        return null;
      }

      // Generate JWT token
      const accessToken = jwtService.generateToken({
        userId: user._id!,
        email: user.email,
        role: user.role,
      });

      // Update device code with authorization
      await collection.updateOne(
        { _id: deviceCodeDoc._id },
        {
          $set: {
            authorizedAt: new Date(),
            userId: user._id!,
            accessToken,
          },
        }
      );

      logger.info('Device code authorized', {
        userCode: formattedCode,
        userId: user._id,
      });

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 86400, // 24 hours (or whatever JWT_EXPIRES_IN is)
        user: {
          id: user._id!,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      };
    },

    async pollForToken(deviceCode: string): Promise<DeviceTokenResponse | null> {
      const collection = getCollection();
      const deviceCodeDoc = await collection.findOne({ deviceCode });

      if (!deviceCodeDoc) {
        throw { error: 'invalid_grant', error_description: 'Invalid or unknown device code' };
      }

      // Check if expired
      if (deviceCodeDoc.expiresAt < new Date()) {
        throw {
          error: 'expired_token',
          error_description: 'The device code has expired. Please restart the login process.',
        };
      }

      // Check if authorized
      if (!deviceCodeDoc.authorizedAt || !deviceCodeDoc.accessToken || !deviceCodeDoc.userId) {
        // Still pending
        return null;
      }

      // Get user info
      const user = await userService.getUserById(deviceCodeDoc.userId);
      if (!user) {
        throw { error: 'server_error', error_description: 'User not found' };
      }

      logger.info('Token retrieved via device code', {
        userId: user._id,
        userCode: deviceCodeDoc.userCode,
      });

      return {
        access_token: deviceCodeDoc.accessToken,
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: user._id!,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      };
    },

    async cleanupExpiredCodes(): Promise<number> {
      const collection = getCollection();
      const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      if (result.deletedCount > 0) {
        logger.info('Cleaned up expired device codes', { count: result.deletedCount });
      }
      return result.deletedCount;
    },
  };
};
