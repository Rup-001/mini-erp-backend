// const dns = require('dns');
// dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import { config } from './env';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    console.log(config.mongoose.url);
    await mongoose.connect(config.mongoose.url);
    logger.info('MongoDB connected');
  } catch (error) {
    console.log(error);
    logger.error('MongoDB connection error');
    process.exit(1);
  }
};
