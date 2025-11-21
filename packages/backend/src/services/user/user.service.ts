import type { ProviderProfile, UserDocument } from '@agentage/shared';
import { randomUUID } from 'crypto';
import type { LoggerService, MongoService, Service } from '../app.services';

export interface UserService extends Service {
  /**
   * Find existing user or create new one from OAuth profile
   */
  findOrCreateUser(profile: ProviderProfile): Promise<UserDocument>;

  /**
   * Get user by ID
   */
  getUserById(userId: string): Promise<UserDocument | null>;

  /**
   * Link a new OAuth provider to existing user
   */
  linkProvider(userId: string, profile: ProviderProfile): Promise<UserDocument>;

  /**
   * Unlink an OAuth provider from user
   */
  unlinkProvider(
    userId: string,
    provider: 'google' | 'github' | 'microsoft'
  ): Promise<UserDocument>;

  /**
   * Get user's linked providers
   */
  getProviders(userId: string): Promise<Array<{ name: string; email: string; connectedAt: Date }>>;

  /**
   * Update last login timestamp
   */
  updateLastLogin(userId: string): Promise<void>;
}

export const createUserService = (mongo: MongoService, logger: LoggerService): UserService => {
  return {
    async initialize() {
      // Ensure users collection exists
      const db = mongo.getDb();
      db.collection('users');
      logger.info('User service initialized');
    },

    async findOrCreateUser(profile: ProviderProfile): Promise<UserDocument> {
      const { provider, providerId, email, name, avatar } = profile;
      const db = mongo.getDb();
      const collection = db.collection('users');
      const normalizedEmail = email.toLowerCase();

      // Try to find existing user by email
      const user = await collection.findOne({ email: normalizedEmail });

      if (user) {
        const providerData = user.providers[provider];

        // If provider already linked and matches, just update last login
        if (providerData && providerData.id === providerId) {
          await collection.updateOne(
            { _id: user._id! },
            {
              $set: {
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              },
            }
          );

          logger.info('Existing user logged in', {
            userId: user._id,
            provider,
          });

          return {
            ...user,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          };
        }

        // Auto-link new provider to existing email
        await collection.updateOne(
          { _id: user._id! },
          {
            $set: {
              [`providers.${provider}`]: {
                id: providerId,
                email: normalizedEmail,
                connectedAt: new Date(),
              },
              lastLoginAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        logger.info('Provider auto-linked to existing user', {
          userId: user._id,
          provider,
        });

        const updatedUser = await collection.findOne({ _id: user._id! });
        return updatedUser!;
      }

      // Create new user
      const now = new Date();
      const newUser: UserDocument = {
        _id: randomUUID(),
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        avatar,
        role: 'user',
        isActive: true,
        providers: {
          [provider]: {
            id: providerId,
            email: normalizedEmail,
            connectedAt: now,
          },
        },
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      await collection.insertOne(newUser);

      logger.info('New user created', {
        userId: newUser._id,
        provider,
        email: normalizedEmail,
      });

      return newUser;
    },

    async getUserById(userId: string): Promise<UserDocument | null> {
      const db = mongo.getDb();
      const collection = db.collection('users');
      const result = await collection.findOne({ _id: userId });
      return result;
    },

    async linkProvider(userId: string, profile: ProviderProfile): Promise<UserDocument> {
      const { provider, providerId, email } = profile;
      const db = mongo.getDb();
      const collection = db.collection('users');
      const normalizedEmail = email.toLowerCase();

      // Check if provider is already linked to another account
      const existingUser = await collection.findOne({
        [`providers.${provider}.id`]: providerId,
      });

      if (existingUser && existingUser._id !== userId) {
        throw new Error('This provider is already linked to another account');
      }

      // Get current user
      const currentUser = await collection.findOne({ _id: userId });
      if (!currentUser) {
        throw new Error('User not found');
      }

      if (currentUser.providers[provider]) {
        throw new Error('Provider already linked to this account');
      }

      // Link provider
      await collection.updateOne(
        { _id: userId },
        {
          $set: {
            [`providers.${provider}`]: {
              id: providerId,
              email: normalizedEmail,
              connectedAt: new Date(),
            },
            updatedAt: new Date(),
          },
        }
      );

      logger.info('Provider linked to user', { userId, provider });

      const updatedUser = await collection.findOne({ _id: userId });
      return updatedUser!;
    },

    async unlinkProvider(
      userId: string,
      provider: 'google' | 'github' | 'microsoft'
    ): Promise<UserDocument> {
      const db = mongo.getDb();
      const collection = db.collection('users');

      const user = await collection.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.providers[provider]) {
        throw new Error('Provider not linked to this account');
      }

      // Count linked providers
      const providerCount = Object.keys(user.providers).filter(
        (key) => user.providers[key as keyof typeof user.providers]
      ).length;

      if (providerCount <= 1) {
        throw new Error('Cannot unlink last provider. Link another provider first.');
      }

      // Unlink provider
      await collection.updateOne(
        { _id: userId },
        {
          $unset: { [`providers.${provider}`]: '' },
          $set: { updatedAt: new Date() },
        }
      );

      logger.info('Provider unlinked from user', { userId, provider });

      const updatedUser = await collection.findOne({ _id: userId });
      return updatedUser!;
    },

    async getProviders(
      userId: string
    ): Promise<Array<{ name: string; email: string; connectedAt: Date }>> {
      const db = mongo.getDb();
      const collection = db.collection('users');
      const user = await collection.findOne({ _id: userId });

      if (!user) {
        return [];
      }

      const providers: Array<{ name: string; email: string; connectedAt: Date }> = [];

      if (user.providers.google) {
        providers.push({
          name: 'google',
          email: user.providers.google.email,
          connectedAt: user.providers.google.connectedAt,
        });
      }

      if (user.providers.github) {
        providers.push({
          name: 'github',
          email: user.providers.github.email,
          connectedAt: user.providers.github.connectedAt,
        });
      }

      if (user.providers.microsoft) {
        providers.push({
          name: 'microsoft',
          email: user.providers.microsoft.email,
          connectedAt: user.providers.microsoft.connectedAt,
        });
      }

      return providers;
    },

    async updateLastLogin(userId: string): Promise<void> {
      const db = mongo.getDb();
      const collection = db.collection('users');
      await collection.updateOne(
        { _id: userId },
        {
          $set: {
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    },
  };
};
