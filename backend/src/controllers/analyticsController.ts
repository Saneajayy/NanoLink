import { Request, Response } from 'express';
import Link from '../models/Link';
import ClickEvent from '../models/ClickEvent';
import QRCode from 'qrcode';

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

export const getLinkAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { range = '30d' } = req.query;
    const user = (req as any).user;
    
    const plan = user.plan === 'core' ? 'core' : 'free';
    const limits = PLAN_LIMITS[plan];

    const link = await Link.findOne({ _id: id, owner: user._id });
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }

    // Determine date range
    const now = new Date();
    let startDate = new Date();
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);
    else if (range === 'all') startDate = new Date(0); // Beginning of time

    // Enforce analytics retention limit based on plan
    const retentionDate = new Date();
    retentionDate.setDate(now.getDate() - limits.analyticsRetentionDays);

    if (startDate < retentionDate) {
      startDate = retentionDate;
    }

    // Aggregations
    const matchStage = {
      linkId: link._id,
      timestamp: { $gte: startDate }
    };

    // 1. Clicks over time (grouped by day)
    const clicksOverTime = await ClickEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Referrers
    const referrers = await ClickEvent.aggregate([
      { $match: matchStage },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3. Devices
    const devices = await ClickEvent.aggregate([
      { $match: matchStage },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Countries (Skipped in Free Plan as per spec)
    let countries = [];
    if (user.plan === 'paid') {
      countries = await ClickEvent.aggregate([
        { $match: matchStage },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    }

    res.json({
      clicksOverTime,
      referrers,
      devices,
      countries,
      totalClicksInRange: clicksOverTime.reduce((acc, curr) => acc + curr.clicks, 0)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    const plan = user.plan === 'core' ? 'core' : 'free';
    const limits = PLAN_LIMITS[plan];

    const link = await Link.findOne({ _id: id, owner: user._id });
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }

    if (link.qrCodeUrl) {
      res.json({ qrCodeUrl: link.qrCodeUrl });
      return;
    }

    if (user.monthlyQrCodeCount >= limits.qrCodesPerMonth) {
      res.status(403).json({ error: 'QUOTA_EXCEEDED', limitType: 'qrCodesPerMonth', message: 'Monthly QR Code limit reached. Please upgrade to a higher plan.' });
      return;
    }

    const url = `${req.protocol}://${req.get('host')}/r/${link.slug}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    link.qrCodeUrl = qrCodeDataUrl;
    await link.save();

    // Import User model at the top of this file if not already imported. Wait, I should add the import.
    // I will use require or mongoose.model here to avoid import issues if I can't easily add it to the top right now.
    // Actually, I can just use User model from mongoose since it's registered.
    const User = require('../models/User').default;
    await User.findByIdAndUpdate(user._id, { $inc: { monthlyQrCodeCount: 1 } });

    res.json({ qrCodeUrl: qrCodeDataUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
