import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;

export const getRedisClient = () => {
  if (redisClient) return redisClient;

  let redisUrl = process.env.REDIS_URL;
  if (redisUrl && redisUrl.startsWith('redis-cli -u ')) {
    redisUrl = redisUrl.replace('redis-cli -u ', '').trim();
    console.log('🧹 Automatically sanitized REDIS_URL by removing "redis-cli -u " command prefix.');
  }

  if (!redisUrl || redisUrl === 'mock') {
    console.log('⚠️ REDIS_URL not set or set to mock. Using ioredis-mock for local in-memory caching and INCR counters...');
    redisClient = new RedisMock();
    redisClient.isMock = true;
    return redisClient;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 1) {
          console.warn('⚠️ Redis connection failed. Switching to ioredis-mock fallback...');
          return null;
        }
        return Math.min(times * 200, 1000);
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected successfully');
    });

    redisClient.on('error', (err) => {
      console.warn(`⚠️ Redis Client Error: ${err.message}. Falling back to ioredis-mock if offline.`);
      if (!redisClient.isMock && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message.includes('connect'))) {
        console.log('🔄 Initializing ioredis-mock fallback due to connection failure...');
        redisClient = new RedisMock();
        redisClient.isMock = true;
      }
    });
  } catch (err) {
    console.warn(`⚠️ Exception initializing Redis: ${err.message}. Using ioredis-mock...`);
    redisClient = new RedisMock();
    redisClient.isMock = true;
  }

  return redisClient;
};

export default getRedisClient;
