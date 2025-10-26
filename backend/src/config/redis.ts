import Redis from 'ioredis';
import logger from '../utils/logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (error) => {
  logger.error('Redis client error:', error);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.ping();
    logger.info('Redis connection successful');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export const cache = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await redisClient.get(key);
    } catch (error) {
      logger.error('Redis GET error:', { key, error });
      return null;
    }
  },

  set: async (
    key: string,
    value: string,
    expirationSeconds: number = 3600
  ): Promise<void> => {
    try {
      await redisClient.setex(key, expirationSeconds, value);
    } catch (error) {
      logger.error('Redis SET error:', { key, error });
    }
  },

  del: async (key: string): Promise<void> => {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', { key, error });
    }
  },

  delPattern: async (pattern: string): Promise<void> => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error('Redis DEL pattern error:', { pattern, error });
    }
  },

  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', { key, error });
      return false;
    }
  },
};

export default redisClient;