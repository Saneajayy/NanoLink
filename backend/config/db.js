import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
dotenv.config();

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (uri && (uri.includes('<') || uri.includes('>'))) {
      console.warn('⚠️ WARNING: MONGODB_URI contains angle brackets (< or >). Removing `<` and `>` from connection string...');
      uri = uri.replace(/<|>/g, '');
      console.log('🧹 Automatically stripped angle brackets from MONGODB_URI.');
    }

    // If MONGODB_URI is not provided or if connecting fails, fall back to MongoMemoryServer for zero-config local development
    if (!uri || uri === 'memory') {
      console.log('⚠️ MONGODB_URI not set or set to memory. Starting embedded MongoDB instance (MongoMemoryServer)...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`✅ Embedded MongoDB started at ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE || '100', 10),
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (pool size: ${mongoose.connection.client.options.maxPoolSize || 100})`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Attempt fallback if first connection attempt to external URI failed
    if (!mongod && process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Falling back to MongoMemoryServer after connection failure...');
      try {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri, { 
          maxPoolSize: 100,
          minPoolSize: 10,
          socketTimeoutMS: 45000,
          serverSelectionTimeoutMS: 5000
        });
        console.log(`✅ MongoDB Connected via Fallback: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`❌ Embedded MongoDB fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

export default connectDB;
