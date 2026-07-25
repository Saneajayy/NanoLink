import getRedisClient from '../config/redis.js';
import Link from '../models/Link.js';
import QrCode from '../models/QrCode.js';
import ClickEvent from '../models/ClickEvent.js';

let workerInterval = null;

export const startAnalyticsWorker = (intervalMs = 30000) => {
  if (workerInterval) {
    clearInterval(workerInterval);
  }

  console.log(`⏱️ Starting background analytics worker (flushing Redis counters & event stream every ${intervalMs / 1000}s)...`);

  workerInterval = setInterval(async () => {
    try {
      const redis = getRedisClient();

      // 1. Flush Link click counters in batch per Section 8
      let linkKeys = [];
      if (redis.isMock) {
        const allKeys = await redis.keys('counter:link:*');
        linkKeys = allKeys;
      } else {
        let cursor = '0';
        do {
          const res = await redis.scan(cursor, 'MATCH', 'counter:link:*', 'COUNT', 100);
          cursor = res[0];
          linkKeys.push(...res[1]);
        } while (cursor !== '0');
      }

      for (const key of linkKeys) {
        const valStr = await redis.get(key);
        const count = parseInt(valStr, 10);
        if (count > 0) {
          await redis.decrby(key, count);
          const linkId = key.replace('counter:link:', '');
          await Link.findByIdAndUpdate(linkId, { $inc: { totalClicks: count } }).catch(e => {
            console.warn(`Failed to update totalClicks for link ${linkId}:`, e.message);
          });
        } else if (count === 0) {
          await redis.del(key);
        }
      }

      // 2. Flush QR scan counters in batch per Section 8
      let qrKeys = [];
      if (redis.isMock) {
        const allKeys = await redis.keys('counter:qr:*');
        qrKeys = allKeys;
      } else {
        let cursor = '0';
        do {
          const res = await redis.scan(cursor, 'MATCH', 'counter:qr:*', 'COUNT', 100);
          cursor = res[0];
          qrKeys.push(...res[1]);
        } while (cursor !== '0');
      }

      for (const key of qrKeys) {
        const valStr = await redis.get(key);
        const count = parseInt(valStr, 10);
        if (count > 0) {
          await redis.decrby(key, count);
          const qrId = key.replace('counter:qr:', '');
          await QrCode.findByIdAndUpdate(qrId, { $inc: { totalScans: count } }).catch(e => {
            console.warn(`Failed to update totalScans for qr ${qrId}:`, e.message);
          });
        } else if (count === 0) {
          await redis.del(key);
        }
      }

      // 3. Batch flush raw click/scan events from Redis list 'events:stream' into MongoDB per Section 8 point 4
      const batchSize = 1000;
      const eventsBatch = [];
      for (let i = 0; i < batchSize; i++) {
        const raw = await redis.lpop('events:stream');
        if (!raw) break;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.timestamp) parsed.timestamp = new Date(parsed.timestamp);
          eventsBatch.push(parsed);
        } catch (e) {
          console.warn('Failed to parse queued event JSON:', e.message);
        }
      }

      if (eventsBatch.length > 0) {
        await ClickEvent.insertMany(eventsBatch, { ordered: false }).catch(e => {
          console.warn('ClickEvent batch insert warning:', e.message);
        });
        if (process.env.NODE_ENV !== 'production') {
          console.log(`⚡ Flushed ${eventsBatch.length} analytics events to ClickEvent collection.`);
        }
      }
    } catch (err) {
      console.error('Analytics batch worker error:', err.message);
    }
  }, intervalMs);

  return workerInterval;
};

export const stopAnalyticsWorker = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('🛑 Stopped analytics worker.');
  }
};

export default startAnalyticsWorker;
