import { createServer } from './app';
import { appServiceProvider } from './services/app.services';

const startServer = async () => {
  try {
    const serviceProvider = appServiceProvider;

    // Initialize all services
    console.log('🔧 Initializing services...');
    await serviceProvider.initialize();

    const { server } = await createServer(serviceProvider);

    const configService = await serviceProvider.get('config');
    const logger = await serviceProvider.get('logger');

    const port = configService.getNumber('PORT', 3001);
    const host = configService.get('HOST') || '0.0.0.0';

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      try {
        // Close MongoDB connection
        const mongoService = await serviceProvider.get('mongo');
        await mongoService.disconnect();
        logger.info('MongoDB connection closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', { error });
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    await new Promise<void>((resolve) => {
      server.listen(port, host, resolve);
    });

    logger.info(`🚀 Backend server listening on ${host}:${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Endpoints:`);
    logger.info(`  - GET /api/health`);
    logger.info(`  - GET /api/status`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer().catch((err) => {
  console.error('Application startup failed:', err);
  process.exit(1);
});
