import mongoose from 'mongoose';
import { config } from './env';
import logger from './logger';
import dns from 'node:dns';   


dns.setServers(['1.1.1.1', '8.8.8.8']);

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to:', config.mongoose.url);
    await mongoose.connect(config.mongoose.url, {
     
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('MongoDB connected');
  } catch (error) {
    console.error(error);
    logger.error('MongoDB connection error');
    throw error;  
  }
};