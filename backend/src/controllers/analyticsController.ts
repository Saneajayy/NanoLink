import { Request, Response } from 'express';
import Link from '../models/Link';
import ClickEvent from '../models/ClickEvent';
import QRCode from 'qrcode';

export const getLinkAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { range = '30d' } = req.query;
    const user = (req as any).user;

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

    // Free tier limitation (enforce simple analytics)
    if (user.plan === 'free' && range === 'all') {
      res.status(403).json({ message: 'Full historical analytics require a paid plan.' });
      return;
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

    const link = await Link.findOne({ _id: id, owner: user._id });
    if (!link) {
      res.status(404).json({ message: 'Link not found' });
      return;
    }

    const url = `${req.protocol}://${req.get('host')}/r/${link.slug}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    // Save to link (optional, if we want to cache it in DB)
    if (!link.qrCodeUrl) {
      link.qrCodeUrl = qrCodeDataUrl;
      await link.save();
    }

    res.json({ qrCodeUrl: qrCodeDataUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
