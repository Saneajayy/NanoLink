import { Request, Response } from 'express';
import Link from '../models/Link';
import ClickEvent from '../models/ClickEvent';
import redisClient from '../config/redis';
import crypto from 'crypto';

export const handleRedirect = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const cacheKey = `link:${slug}`;
    let originalUrl = null;
    let linkId = null;

    // 1. Try to get from Redis Cache
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        originalUrl = parsed.originalUrl;
        linkId = parsed._id;
      }
    } catch (redisError) {
      console.warn('Redis Cache Miss/Error on get:', redisError);
    }

    // 2. Fallback to MongoDB if not in cache
    if (!originalUrl) {
      const link = await Link.findOne({ slug });
      if (!link || !link.isActive) {
        res.status(404).send('Link not found or inactive');
        return;
      }
      originalUrl = link.originalUrl;
      linkId = link._id;

      // Populate Redis
      try {
        await redisClient.setex(cacheKey, 3600, JSON.stringify({ originalUrl, _id: linkId }));
      } catch (redisError) {
        console.warn('Redis Cache Set Error:', redisError);
      }
    }

    // 3. Fire-and-forget Analytics Logging
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    const userAgent = req.headers['user-agent'] || '';
    
    // Simple device detection
    let device: 'desktop' | 'mobile' | 'other' | 'tablet' = 'desktop';
    if (/mobile/i.test(userAgent)) device = 'mobile';
    if (/tablet/i.test(userAgent)) device = 'tablet';

    ClickEvent.create({
      linkId,
      referrer: req.headers.referer || 'direct',
      device,
      browser: userAgent,
      ipHash,
      // country would be determined via a GeoIP lookup on the IP. Skipping for MVP.
      country: 'Unknown'
    }).catch(err => console.error('Failed to log click event:', err));

    // 4. Increment Clicks
    // Spec: Increment Link.totalClicks via Redis INCR
    try {
      await redisClient.incr(`clicks:${linkId}`);
    } catch (redisError) {
      // Fallback if redis fails
      Link.updateOne({ _id: linkId }, { $inc: { totalClicks: 1 } }).catch(console.error);
    }

    // 5. Redirect immediately
    res.redirect(originalUrl);

  } catch (error: any) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
};
