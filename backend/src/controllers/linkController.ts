import { Request, Response } from 'express';
import crypto from 'crypto';
import Link from '../models/Link';
import User from '../models/User';

const generateSlug = (length = 6) => {
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
};

const PLAN_LIMITS = {
  free: {
    linksPerMonth: 50,
    customBackHalvesPerMonth: 3,
    qrCodesPerMonth: 2,
    analyticsRetentionDays: 7,
  },
  core: {
    linksPerMonth: 100,
    customBackHalvesPerMonth: Infinity, // unlimited within the 100 link cap
    qrCodesPerMonth: 5,
    analyticsRetentionDays: 30,
  }
};

export const createLink = async (req: Request, res: Response) => {
  try {
    const { originalUrl, customAlias, title } = req.body;
    const user = (req as any).user;
    
    // Default to free if user plan is not core
    const plan = user.plan === 'core' ? 'core' : 'free';
    const limits = PLAN_LIMITS[plan];

    // Check monthly link limits
    if (user.monthlyLinkCount >= limits.linksPerMonth) {
      res.status(403).json({ error: 'QUOTA_EXCEEDED', limitType: 'linksPerMonth', message: 'Monthly link limit reached. Please upgrade to a higher plan.' });
      return;
    }

    if (customAlias && plan === 'free') {
      // Compute custom back halves created this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const customAliasCount = await Link.countDocuments({
        owner: user._id,
        customAlias: true,
        createdAt: { $gte: startOfMonth }
      });
      if (customAliasCount >= limits.customBackHalvesPerMonth) {
        res.status(403).json({ error: 'QUOTA_EXCEEDED', limitType: 'customBackHalvesPerMonth', message: 'Monthly custom back-half limit reached. Please upgrade to a higher plan.' });
        return;
      }
    }

    // Google Safe Browsing Check
    let isSafe = true;
    if (process.env.SAFE_BROWSING_API_KEY) {
      try {
        const fetch = (await import('node-fetch')).default || global.fetch; // use native fetch
        const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.SAFE_BROWSING_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'nanolink', clientVersion: '1.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: originalUrl }]
            }
          })
        });
        const data = await response.json() as any;
        if (data && data.matches && data.matches.length > 0) {
          isSafe = false;
        }
      } catch (err) {
        console.warn('Safe browsing check failed, proceeding anyway:', err);
      }
    }

    if (!isSafe) {
      res.status(400).json({ message: 'This URL has been flagged as unsafe by Google Safe Browsing.' });
      return;
    }



    let slug = customAlias;
    if (!slug) {
      // Generate a unique slug
      let isUnique = false;
      while (!isUnique) {
        slug = generateSlug(6);
        const existing = await Link.findOne({ slug });
        if (!existing) isUnique = true;
      }
    } else {
      // Check if custom alias is already taken
      const existing = await Link.findOne({ slug });
      if (existing) {
        res.status(400).json({ message: 'Custom alias already in use' });
        return;
      }
    }

    const link = await Link.create({
      originalUrl,
      slug,
      customAlias: !!customAlias,
      owner: user._id,
      title,
      safeBrowsingChecked: true,
    });

    // Increment user's monthly link count
    await User.findByIdAndUpdate(user._id, { $inc: { monthlyLinkCount: 1 } });

    res.status(201).json(link);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLinks = async (req: Request, res: Response) => {
  try {
    const links = await Link.find({ owner: (req as any).user._id }).sort({ createdAt: -1 });
    res.json(links);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLinkById = async (req: Request, res: Response) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, owner: (req as any).user._id });
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }
    res.json(link);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLink = async (req: Request, res: Response) => {
  try {
    const { title, isActive, originalUrl } = req.body;
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, owner: (req as any).user._id },
      { title, isActive, originalUrl },
      { new: true }
    );
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }
    res.json(link);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLink = async (req: Request, res: Response) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, owner: (req as any).user._id });
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }
    res.json({ message: 'Link removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
