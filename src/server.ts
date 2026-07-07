import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import logger from './config/logger';

const start = async () => {
  await connectDB();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });
};

start();
