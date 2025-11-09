import { createApp } from './app';
import { connectToMongoDB } from './db/mongodb';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    const app = createApp();

    app.listen(PORT, HOST, () => {
      console.log(`Backend server running on ${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Endpoints:`);
      console.log(`  - GET /api/health`);
      console.log(`  - GET /api/status`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
