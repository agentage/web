import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { AppInstance } from './app.interface';
import { createErrorHandler } from './middleware/error.middleware';
import { getRouters } from './routes';
import { ServiceProvider } from './services';
import { AppServiceMap } from './services/app.services';

export const createServer = async (
  serviceProvider: ServiceProvider<AppServiceMap>
): Promise<AppInstance> => {
  console.log('Creating server...');

  const app = express();

  // Get config service for CORS configuration
  const configService = await serviceProvider.get('config');
  const logger = await serviceProvider.get('logger');
  const frontendFqdn = configService.get('FRONTEND_FQDN') || 'localhost:3000';

  // Security middleware
  app.use(helmet());

  // Configure CORS
  app.use(
    cors({
      origin: [
        `http://${frontendFqdn}`,
        `https://${frontendFqdn}`,
        'http://localhost:3000', // Allow local development
      ],
      credentials: true, // Allow cookies for OAuth
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Add UTF-8 symbols parser
  app.set('query parser', 'simple');

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Agentage API',
      version: process.env.npm_package_version || '1.0.0',
      endpoints: ['/api/health', '/api/status'],
    });
  });

  app.get('/api', (req, res) => {
    res.send('OK');
  });

  // Mount all routes
  app.use('/', getRouters(serviceProvider));

  // Error handling middleware (must be last)
  const errorHandler = createErrorHandler(serviceProvider);
  app.use(errorHandler.errorMiddleware);

  logger.info('Server created successfully');

  return {
    server: app,
    serviceProvider,
  };
};
