import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Don't retry more than 3 times, we want to fallback to MongoDB gracefully
    if (times > 3) {
      console.log('Redis connection failed, giving up.');
      return null;
    }
    return Math.min(times * 50, 2000);
  }
});

redisClient.on('error', (err) => {
  console.warn('Redis Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Redis Connected');
});

export default redisClient;
