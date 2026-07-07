import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import logger from './config/logger';
import dns from 'node:dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const PORT = config.port || 5001;

const start = async () => {
  console.log('🚀 Starting Mini ERP Backend...');

  try {
    await connectDB();
    logger.info('✅ MongoDB connected successfully');
    console.log(`✅ MongoDB connected successfully`);
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed');
    console.error('MongoDB Error:', error.message || error);
  }
};

// ==================== LOCAL DEVELOPMENT ====================
if (config.env === 'development' || process.env.NODE_ENV === 'development') {
  
  // পুরানো সার্ভার আছে কিনা চেক করে নতুন করে শুরু করা
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.log(`💡 Try running: npx kill-port ${PORT}`);
      process.exit(1);
    }
  });

  start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => process.exit(0));
  });

} 
// ==================== VERCEL / PRODUCTION ====================
else {
  start();
  console.log('🌍 Running on Vercel Serverless');
}

export default app;