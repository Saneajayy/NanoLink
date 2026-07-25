import getRedisClient from '../config/redis.js';
import crypto from 'crypto';

// Hash IP address for privacy per Section 3
const hashIp = (ip) => {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
};

// Parse User-Agent into simple browser and device enum per Section 3
const parseUserAgent = (ua = '') => {
  const lower = ua.toLowerCase();
  let device = 'other';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    device = 'mobile';
  } else if (/Macintosh|Windows|Linux|X11/.test(ua)) {
    device = 'desktop';
  }

  let browser = 'Other';
  if (lower.includes('chrome') && !lower.includes('edge') && !lower.includes('opr')) browser = 'Chrome';
  else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
  else if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('edg')) browser = 'Edge';
  else if (lower.includes('opr') || lower.includes('opera')) browser = 'Opera';

  return { device, browser };
};

// Cache redirect URL and link ID as JSON string in Redis per Section 8
export const cacheRedirect = async (slug, url, linkId = null) => {
  try {
    const redis = getRedisClient();
    const payload = JSON.stringify({ url, id: linkId ? linkId.toString() : null });
    await redis.set(`redirect:${slug}`, payload, 'EX', 3600); // 1 hour TTL
  } catch (err) {
    console.warn(`Cache set error for slug "${slug}":`, err.message);
  }
};

// Get cached redirect from Redis (returns { url, id } or null)
export const getCachedRedirect = async (slug) => {
  try {
    const redis = getRedisClient();
    const raw = await redis.get(`redirect:${slug}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed.url) {
        return parsed;
      }
      // Backward compatibility if plain URL string was stored
      return { url: raw, id: null };
    } catch (e) {
      return { url: raw, id: null };
    }
  } catch (err) {
    console.warn(`Cache get error for slug "${slug}":`, err.message);
    return null;
  }
};

export const removeCachedRedirect = async (slug) => {
  try {
    const redis = getRedisClient();
    await redis.del(`redirect:${slug}`);
  } catch (err) {
    console.warn(`Cache del error for slug "${slug}":`, err.message);
  }
};

// Asynchronous non-blocking event recording using Redis queues (Section 8 point 2, 3, 4)
// NEVER touches MongoDB synchronously!
export const recordEventAsync = (linkId, slug, req, isScan = false, qrCodeId = null) => {
  // Fire and forget — never await inside the redirect route handler
  setTimeout(async () => {
    try {
      const redis = getRedisClient();
      
      // 1. Increment in-memory counter in Redis via INCR (Section 8 point 3)
      if (linkId) {
        await redis.incr(`counter:link:${linkId}`);
      }
      if (isScan && qrCodeId) {
        await redis.incr(`counter:qr:${qrCodeId}`);
      }

      // 2. Extract metadata
      const ua = req.headers['user-agent'] || '';
      const { device, browser } = parseUserAgent(ua);
      const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
      const ipHash = hashIp(rawIp);
      const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

      // 3. Push raw event metadata to Redis list 'events:stream' for batch processing by analytics worker
      const eventData = {
        linkId: linkId ? linkId.toString() : null,
        qrCodeId: (isScan && qrCodeId) ? qrCodeId.toString() : null,
        type: isScan ? 'scan' : 'click',
        timestamp: new Date().toISOString(),
        referrer: referrer.substring(0, 200),
        country: req.headers['cf-ipcountry'] || 'Unknown',
        device,
        browser,
        ipHash
      };

      await redis.rpush('events:stream', JSON.stringify(eventData));
    } catch (err) {
      console.error('Async Redis event queuing failed:', err.message);
    }
  }, 0);
};

export default {
  cacheRedirect,
  getCachedRedirect,
  removeCachedRedirect,
  recordEventAsync
};
