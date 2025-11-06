import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createStatusRouter } from './routes/status';
import { errorHandler } from './middleware/error';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api', createStatusRouter());

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Agentage API',
      version: '1.0.0',
      endpoints: ['/api/health', '/api/status'],
    });
  });

  // Error handling
  app.use(errorHandler);

  return app;
};
