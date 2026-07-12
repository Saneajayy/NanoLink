import redisClient from '../config/redis';
import Link from '../models/Link';

export const startClickFlusher = () => {
  // Flush every 30 seconds
  setInterval(async () => {
    try {
      // Get all keys matching clicks:*
      const keys = await redisClient.keys('clicks:*');
      if (keys.length === 0) return;

      for (const key of keys) {
        const clicksStr = await redisClient.get(key);
        if (!clicksStr) continue;
        
        const clicks = parseInt(clicksStr, 10);
        if (clicks > 0) {
          const linkId = key.split(':')[1];
          
          // Update MongoDB
          await Link.updateOne({ _id: linkId }, { $inc: { totalClicks: clicks } });
          
          // Reset Redis counter by decrementing the exact amount we just flushed
          await redisClient.decrby(key, clicks);
        }
      }
    } catch (error) {
      console.error('Error flushing clicks to MongoDB:', error);
    }
  }, 30000);
};
