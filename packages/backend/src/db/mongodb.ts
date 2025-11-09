import { Db, MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agentage';

  try {
    client = new MongoClient(uri);
    await client.connect();

    // Extract database name from URI or use default
    const dbName = uri.split('/').pop()?.split('?')[0] || 'agentage';
    db = client.db(dbName);

    console.log(`✅ Connected to MongoDB: ${dbName}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ Disconnected from MongoDB');
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});
