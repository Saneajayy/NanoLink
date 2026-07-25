import dotenv from 'dotenv';
dotenv.config();

import getRedisClient from '../config/redis.js';
import cacheService from '../services/cacheService.js';
import { startAnalyticsWorker, stopAnalyticsWorker } from '../services/analyticsWorker.js';

const runTest = async () => {
  console.log('🧪 Starting Section 8 Redis Caching & Queue Architecture Verification...');
  try {
    const redis = getRedisClient();
    console.log(`📡 Redis connected (isMock: ${!!redis.isMock})`);

    // 1. Test Redirect Caching (URL + ID)
    const testSlug = 'test-redis-slug-123';
    const testUrl = 'https://example.com/redis-speed-test';
    const testId = '654321098765432109876543';

    await cacheService.cacheRedirect(testSlug, testUrl, testId);
    console.log(`✅ Cached redirect for slug "${testSlug}"`);

    const cached = await cacheService.getCachedRedirect(testSlug);
    console.log('📦 Retrieved from cache:', cached);
    if (!cached || cached.url !== testUrl || cached.id !== testId) {
      throw new Error('Cache retrieval mismatch!');
    }
    console.log('✅ Cache retrieval verified (URL and linkId match exactly!)');

    // 2. Test Asynchronous Event Queuing
    const mockReq = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36',
        'referer': 'https://twitter.com',
        'x-forwarded-for': '203.0.113.195'
      }
    };

    console.log('⚡ Firing asynchronous event log...');
    cacheService.recordEventAsync(testId, testSlug, mockReq, false, null);

    // Wait 100ms for setTimeout(..., 0) to execute
    await new Promise(r => setTimeout(r, 100));

    const counterVal = await redis.get(`counter:link:${testId}`);
    console.log(`📊 In-memory Redis counter for link "${testId}":`, counterVal);
    if (parseInt(counterVal, 10) !== 1) {
      throw new Error(`Expected counter to be 1, got ${counterVal}`);
    }

    const streamLen = await redis.llen('events:stream');
    console.log(`📥 Events in Redis stream queue "events:stream":`, streamLen);
    if (streamLen < 1) {
      throw new Error('Event stream queue is empty!');
    }

    // 3. Test Cache Invalidation
    await cacheService.removeCachedRedirect(testSlug);
    const afterDelete = await cacheService.getCachedRedirect(testSlug);
    if (afterDelete !== null) {
      throw new Error('Cache deletion failed!');
    }
    console.log('✅ Cache invalidation verified (redirect key removed cleanly).');

    // Clean up test keys
    await redis.del(`counter:link:${testId}`);
    await redis.del('events:stream');

    console.log('\n🌟 ALL SECTION 8 ARCHITECTURAL VERIFICATIONS PASSED SUCCESSFULLY! 🌟');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification test failed:', err);
    process.exit(1);
  }
};

runTest();
