import { Db, MongoClient } from 'mongodb';
import { TypedDb } from './typed-db';

/**
 * Simple service interface
 */
export interface Service {
  initialize(): Promise<void>;
}

/**
 * Configuration Service
 */
export interface ConfigService extends Service {
  get(key: string, defaultValue?: string): string;
  getNumber(key: string, defaultValue?: number): number;
  getBoolean(key: string, defaultValue?: boolean): boolean;
}

/**
 * Logger Service
 */
export interface LoggerService extends Service {
  info(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
}

/**
 * MongoDB Service
 */
export interface MongoService extends Service {
  getDb(): TypedDb;
  healthCheck(): Promise<{ connected: boolean }>;
  disconnect(): Promise<void>;
}

/**
 * Application service map
 * Add new services here as they are created
 */
export interface AppServiceMap extends Record<string, Service> {
  config: ConfigService;
  logger: LoggerService;
  mongo: MongoService;
  agent: import('./agent.service').AgentService;
  deviceCode: import('./device-code').DeviceCodeService;
  jwt: import('./jwt').JwtService;
  oauth: import('./oauth').OAuthService;
  user: import('./user').UserService;
}

/**
 * Simple service provider implementation
 */
export class ServiceProvider<T extends Record<string, Service>> {
  private services: Map<string, Service> = new Map();
  private initialized = false;

  async get<K extends keyof T>(serviceName: K): Promise<T[K]> {
    const service = this.services.get(serviceName as string);
    if (!service) {
      throw new Error(`Service ${String(serviceName)} not found`);
    }
    return service as T[K];
  }

  register<K extends keyof T>(name: K, service: T[K]): void {
    this.services.set(name as string, service);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    for (const [name, service] of this.services.entries()) {
      console.log(`Initializing service: ${name}`);
      await service.initialize();
    }

    this.initialized = true;
  }
}

/**
 * Create Config Service
 */
function createConfigService(): ConfigService {
  const requiredEnvVars = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GITHUB_CALLBACK_URL',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'MICROSOFT_CALLBACK_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'FRONTEND_FQDN',
    'API_FQDN',
  ];

  return {
    async initialize() {
      // Load .env file from workspace root
      const path = require('path');
      require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

      // Validate required environment variables
      console.log('🔍 Validating backend environment variables...');
      const missingVars: string[] = [];
      const presentVars: string[] = [];

      for (const varName of requiredEnvVars) {
        const value = process.env[varName];
        if (!value) {
          missingVars.push(varName);
          console.error(`❌ Missing required environment variable: ${varName}`);
        } else {
          presentVars.push(varName);
        }
      }

      if (missingVars.length > 0) {
        console.error(`\n❌ Backend configuration validation failed!`);
        console.error(`Missing ${missingVars.length} required environment variables:`);
        missingVars.forEach((varName) => {
          console.error(`  - ${varName}`);
        });
        console.error(
          '\n⚠️  These variables should be set from app-secrets.{env}.json during deployment'
        );
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      console.log(`✅ All ${presentVars.length} required environment variables are set`);
    },
    get(key: string, defaultValue = ''): string {
      return process.env[key] || defaultValue;
    },
    getNumber(key: string, defaultValue = 0): number {
      const value = process.env[key];
      return value ? parseInt(value, 10) : defaultValue;
    },
    getBoolean(key: string, defaultValue = false): boolean {
      const value = process.env[key];
      if (!value) return defaultValue;
      return value.toLowerCase() === 'true' || value === '1';
    },
  };
}

/**
 * Create Logger Service
 */
function createLoggerService(serviceName: string): LoggerService {
  const log = (level: string, message: string, meta?: unknown) => {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${serviceName}] ${level.toUpperCase()}: ${message}${metaStr}`);
  };

  return {
    async initialize() {
      this.info('Logger initialized');
    },
    info(message: string, meta?: unknown) {
      log('info', message, meta);
    },
    error(message: string, meta?: unknown) {
      log('error', message, meta);
    },
    warn(message: string, meta?: unknown) {
      log('warn', message, meta);
    },
    debug(message: string, meta?: unknown) {
      if (process.env.LOG_LEVEL === 'debug') {
        log('debug', message, meta);
      }
    },
  };
}

/**
 * Create Mongo Service
 */
function createMongoService(): MongoService {
  let client: MongoClient | null = null;
  let db: Db | null = null;
  let typedDb: TypedDb | null = null;

  return {
    async initialize() {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agentage';

      try {
        client = new MongoClient(uri);
        await client.connect();

        const dbName = uri.split('/').pop()?.split('?')[0] || 'agentage';
        db = client.db(dbName);
        typedDb = new TypedDb(db);

        console.log(`✅ Connected to MongoDB: ${dbName}`);
      } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
      }
    },

    getDb(): TypedDb {
      if (!typedDb) {
        throw new Error('Database not initialized. Call initialize() first.');
      }
      return typedDb;
    },

    async healthCheck(): Promise<{ connected: boolean }> {
      try {
        if (!db) return { connected: false };
        await db.admin().ping();
        return { connected: true };
      } catch (error) {
        return { connected: false };
      }
    },

    async disconnect(): Promise<void> {
      if (client) {
        await client.close();
        client = null;
        db = null;
        typedDb = null;
        console.log('✅ Disconnected from MongoDB');
      }
    },
  };
}

/**
 * Production service provider
 */
export function createAppServiceProvider(): ServiceProvider<AppServiceMap> {
  const provider = new ServiceProvider<AppServiceMap>();

  const config = createConfigService();
  const logger = createLoggerService('backend');
  const mongo = createMongoService();

  provider.register('config', config);
  provider.register('logger', logger);
  provider.register('mongo', mongo);

  // Agent service will be registered after initialization
  let servicesRegistered = false;
  const originalInitialize = provider.initialize.bind(provider);
  provider.initialize = async function () {
    await originalInitialize();

    // Register services after mongo is initialized
    if (!servicesRegistered) {
      const { createAgentService } = require('./agent.service');
      const { createDeviceCodeService } = require('./device-code');
      const { createJwtService } = require('./jwt');
      const { createUserService } = require('./user');
      const { createOAuthService } = require('./oauth');

      const db = mongo.getDb();

      // Create services
      const agentService = createAgentService(db, logger);
      const jwtService = createJwtService(config, logger);
      const userService = createUserService(mongo, logger);
      const oauthService = createOAuthService(config, userService, logger);
      const deviceCodeService = createDeviceCodeService(mongo, jwtService, userService, logger, {
        apiFqdn: config.get('FRONTEND_FQDN', 'localhost:3000'),
      });

      // Register services
      provider.register('agent', agentService);
      provider.register('deviceCode', deviceCodeService);
      provider.register('jwt', jwtService);
      provider.register('user', userService);
      provider.register('oauth', oauthService);

      // Initialize new services
      await agentService.initialize();
      await deviceCodeService.initialize();
      await jwtService.initialize();
      await userService.initialize();
      await oauthService.initialize();

      servicesRegistered = true;
    }
  };

  return provider;
}

export const appServiceProvider = createAppServiceProvider();
