// db.ts — Database connection utility; initializes Mongoose with the configured URI.
import mongoose from 'mongoose';
import { config } from './config';

/**
 * Establishes a connection to the MongoDB database.
 * @returns Promise resolving when connected
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}
