import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  process.exit(1);
});

async function startServer() {
  try {
    await connectDatabase();
    logger.info('PostgreSQL connected successfully');

    await connectRedis();
    logger.info('Redis connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
    });

    process.on('unhandledRejection', (error: Error) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', error);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();