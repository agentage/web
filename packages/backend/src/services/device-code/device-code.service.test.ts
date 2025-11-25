/**
 * Device Code Service Tests
 */

import { createDeviceCodeService, DeviceCodeService } from './device-code.service';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock dependencies
const mockMongo = {
  getDb: () => ({
    collection: jest.fn(() => ({
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      createIndex: jest.fn().mockResolvedValue('index'),
    })),
    getRawDb: () => ({
      collection: jest.fn(() => ({
        createIndex: jest.fn().mockResolvedValue('index'),
      })),
    }),
  }),
  initialize: jest.fn(),
  healthCheck: jest.fn(),
  disconnect: jest.fn(),
};

const mockJwtService = {
  generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
  verifyToken: jest.fn(),
  decodeToken: jest.fn(),
  initialize: jest.fn(),
};

const mockUserService = {
  getUserById: jest.fn().mockResolvedValue({
    _id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    role: 'user',
  }),
  findOrCreateUser: jest.fn(),
  linkProvider: jest.fn(),
  unlinkProvider: jest.fn(),
  getProviders: jest.fn(),
  updateLastLogin: jest.fn(),
  initialize: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  initialize: jest.fn(),
};

const mockConfig = {
  apiFqdn: 'localhost:3000',
};

describe('DeviceCodeService', () => {
  let service: DeviceCodeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createDeviceCodeService(
      mockMongo as any,
      mockJwtService as any,
      mockUserService as any,
      mockLogger as any,
      mockConfig
    );
  });

  describe('createDeviceCode', () => {
    it('should create a device code with correct format', async () => {
      const result = await service.createDeviceCode('github');

      expect(result).toHaveProperty('device_code');
      expect(result).toHaveProperty('user_code');
      expect(result).toHaveProperty('verification_uri');
      expect(result).toHaveProperty('verification_uri_complete');
      expect(result).toHaveProperty('expires_in');
      expect(result).toHaveProperty('interval');

      // User code should be in XXXX-XXXX format
      expect(result.user_code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);

      // Device code should be base64url encoded
      expect(result.device_code.length).toBeGreaterThan(20);

      // Verification URIs should include the code
      expect(result.verification_uri_complete).toContain(result.user_code);

      // Default values
      expect(result.expires_in).toBe(900);
      expect(result.interval).toBe(5);
    });
  });

  describe('pollForToken', () => {
    it('should return null when authorization is pending', async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue({
          deviceCode: 'test-code',
          userCode: 'ABCD-1234',
          expiresAt: new Date(Date.now() + 60000),
          authorizedAt: null,
        }),
      };
      (mockMongo as any).getDb = () => ({
        collection: () => mockCollection as any,
        getRawDb: () => ({ collection: () => ({ createIndex: jest.fn() }) }),
      });

      const result = await service.pollForToken('test-code');
      expect(result).toBeNull();
    });

    it('should throw expired_token error when code is expired', async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue({
          deviceCode: 'test-code',
          userCode: 'ABCD-1234',
          expiresAt: new Date(Date.now() - 60000), // Expired
        }),
      };
      (mockMongo as any).getDb = () => ({
        collection: () => mockCollection as any,
        getRawDb: () => ({ collection: () => ({ createIndex: jest.fn() }) }),
      });

      await expect(service.pollForToken('test-code')).rejects.toMatchObject({
        error: 'expired_token',
      });
    });

    it('should throw invalid_grant error when code not found', async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      (mockMongo as any).getDb = () => ({
        collection: () => mockCollection as any,
        getRawDb: () => ({ collection: () => ({ createIndex: jest.fn() }) }),
      });

      await expect(service.pollForToken('invalid-code')).rejects.toMatchObject({
        error: 'invalid_grant',
      });
    });

    it('should return token when authorization is complete', async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue({
          deviceCode: 'test-code',
          userCode: 'ABCD-1234',
          expiresAt: new Date(Date.now() + 60000),
          authorizedAt: new Date(),
          userId: 'user-123',
          accessToken: 'access-token-123',
        }),
      };
      (mockMongo as any).getDb = () => ({
        collection: () => mockCollection as any,
        getRawDb: () => ({ collection: () => ({ createIndex: jest.fn() }) }),
      });

      const result = await service.pollForToken('test-code');

      expect(result).toMatchObject({
        access_token: 'access-token-123',
        token_type: 'Bearer',
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });
    });
  });
});
