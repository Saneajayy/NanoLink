import QrCode from '../models/QrCode.js';
import Link from '../models/Link.js';
import PLAN_LIMITS from '../constants/planLimits.js';
import qrService from '../services/qrService.js';
import cacheService from '../services/cacheService.js';

// Helper to generate random slug
const generateRandomSlug = async () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  let exists = true;
  while (exists) {
    slug = '';
    for (let i = 0; i < 6; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const found = await Link.findOne({ slug });
    if (!found) exists = false;
  }
  return slug;
};

// @desc    Create standalone QR code (automatically creates underlying link per Section 5)
// @route   POST /api/qr
// @access  Private
export const createQr = async (req, res) => {
  try {
    const user = req.user;
    const { destinationUrl, title, color, pattern, cornerStyle, frame, linkId } = req.body;

    const limitConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

    // 1. Check Monthly QR Code Quota
    if (user.monthlyQrCodeCount >= limitConfig.qrCodesPerMonth) {
      return res.status(403).json({
        error: 'QUOTA_EXCEEDED',
        message: `You have reached your monthly limit of ${limitConfig.qrCodesPerMonth} QR Codes on the ${user.plan.toUpperCase()} plan. Upgrade to Core for 50 QR codes per month!`
      });
    }

    // 2. Enforce Core Tier Styling Gating per Section 5 & 6.8
    const isAdvancedRequested = (pattern && pattern !== 'squares') || 
                                (cornerStyle && cornerStyle !== 'square') || 
                                (frame && frame !== 'none');
    if (limitConfig.qrCustomization === 'basic' && isAdvancedRequested) {
      return res.status(403).json({
        error: 'QUOTA_EXCEEDED',
        message: 'Advanced QR styling (custom patterns, corner styles, and frames) is available exclusively on the Core plan. Please upgrade to unlock brand customization!'
      });
    }

    let link;
    if (linkId) {
      // Generating QR for an existing short link
      link = await Link.findOne({ _id: linkId, owner: user._id, isActive: true });
      if (!link) {
        return res.status(404).json({ error: 'Associated short link not found.' });
      }
    } else {
      // Standalone QR code creation -> automatically create short link behind the scenes per Section 5
      if (!destinationUrl || !destinationUrl.trim()) {
        return res.status(400).json({ error: 'Please provide a destination URL.' });
      }

      // Check Link quota as well since we are creating an underlying link
      if (user.monthlyLinkCount >= limitConfig.linksPerMonth) {
        return res.status(403).json({
          error: 'QUOTA_EXCEEDED',
          message: `You have reached your monthly limit of ${limitConfig.linksPerMonth} links on the ${user.plan.toUpperCase()} plan.`
        });
      }

      let dest = destinationUrl.trim();
      if (!/^https?:\/\//i.test(dest)) dest = 'https://' + dest;

      const slug = await generateRandomSlug();
      link = await Link.create({
        slug,
        originalUrl: dest,
        customAlias: false,
        owner: user._id,
        title: title?.trim() || `QR for ${dest.replace(/^https?:\/\//i, '').substring(0, 30)}`
      });

      user.monthlyLinkCount += 1;
      await cacheService.cacheRedirect(slug, dest);
    }

    // 3. Generate QR Image Data URI
    const qrOptions = {
      color: color || '#000000',
      pattern: user.plan === 'core' ? pattern || 'squares' : 'squares',
      cornerStyle: user.plan === 'core' ? cornerStyle || 'square' : 'square',
      frame: user.plan === 'core' ? frame || 'none' : 'none',
    };

    const qrCode = await qrService.createQrForLink(link, user, qrOptions);
    if (title && title.trim() && linkId) {
      // If a title was passed for existing link QR, update link title if blank
      if (!link.title) {
        link.title = title.trim();
        await link.save();
      }
    }

    // 4. Increment QR Quota & Save User
    user.monthlyQrCodeCount += 1;
    await user.save();

    res.status(201).json({
      qrCode: qrCode.toJSON(),
      link: link.toJSON(),
      quotas: {
        linksUsed: user.monthlyLinkCount,
        linksLimit: limitConfig.linksPerMonth,
        qrCodesUsed: user.monthlyQrCodeCount,
        qrCodesLimit: limitConfig.qrCodesPerMonth
      }
    });
  } catch (error) {
    console.error('Create QR error:', error);
    res.status(500).json({ error: 'Server error generating QR code.' });
  }
};

// @desc    Get paginated list of user's QR codes
// @route   GET /api/qr
// @access  Private
export const getQrCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sort = req.query.sort || '-createdAt';

    const query = { owner: req.user._id };

    // Find links matching search to filter QR codes by title or destination
    if (search.trim()) {
      const matchingLinks = await Link.find({
        owner: req.user._id,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { originalUrl: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const linkIds = matchingLinks.map(l => l._id);
      query.linkId = { $in: linkIds };
    }

    const total = await QrCode.countDocuments(query);
    const qrCodes = await QrCode.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('linkId');

    // Filter out orphaned QR codes where link was hard-deleted
    const validQrCodes = qrCodes.filter(qr => qr.linkId && qr.linkId.isActive !== false);

    res.json({
      qrCodes: validQrCodes.map(qr => qr.toJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ error: 'Server error fetching QR codes.' });
  }
};

// @desc    Get single QR code detail
// @route   GET /api/qr/:id
// @access  Private
export const getQrById = async (req, res) => {
  try {
    const qrCode = await QrCode.findOne({ _id: req.params.id, owner: req.user._id }).populate('linkId');
    if (!qrCode || !qrCode.linkId || !qrCode.linkId.isActive) {
      return res.status(404).json({ error: 'QR Code not found or associated link is inactive.' });
    }
    res.json(qrCode.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching QR code.' });
  }
};

// @desc    Update QR code styling & regenerate image
// @route   PUT /api/qr/:id
// @access  Private
export const updateQr = async (req, res) => {
  try {
    const user = req.user;
    const { color, pattern, cornerStyle, frame, title, destinationUrl } = req.body;

    const qrCode = await QrCode.findOne({ _id: req.params.id, owner: user._id }).populate('linkId');
    if (!qrCode || !qrCode.linkId || !qrCode.linkId.isActive) {
      return res.status(404).json({ error: 'QR Code not found.' });
    }

    const limitConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

    // Check advanced styling gating
    const isAdvancedRequested = (pattern && pattern !== 'squares') || 
                                (cornerStyle && cornerStyle !== 'square') || 
                                (frame && frame !== 'none');
    if (limitConfig.qrCustomization === 'basic' && isAdvancedRequested) {
      return res.status(403).json({
        error: 'QUOTA_EXCEEDED',
        message: 'Advanced QR styling is available exclusively on the Core plan.'
      });
    }

    if (color !== undefined) qrCode.color = color;
    if (user.plan === 'core') {
      if (pattern !== undefined) qrCode.pattern = pattern;
      if (cornerStyle !== undefined) qrCode.cornerStyle = cornerStyle;
      if (frame !== undefined) qrCode.frame = frame;
    }

    // Update underlying link destination if changed
    const link = qrCode.linkId;
    if (destinationUrl !== undefined && destinationUrl.trim()) {
      let dest = destinationUrl.trim();
      if (!/^https?:\/\//i.test(dest)) dest = 'https://' + dest;
      link.originalUrl = dest;
      await cacheService.cacheRedirect(link.slug, dest);
    }
    if (title !== undefined) {
      link.title = title.trim();
    }
    await link.save();

    // Regenerate QR image with new styles
    const newImageUrl = await qrService.generateQrImage(link.shortUrl, {
      color: qrCode.color,
      pattern: qrCode.pattern,
      cornerStyle: qrCode.cornerStyle,
      frame: qrCode.frame
    });
    qrCode.imageUrl = newImageUrl;

    await qrCode.save();
    res.json(qrCode.toJSON());
  } catch (error) {
    console.error('Update QR error:', error);
    res.status(500).json({ error: 'Server error updating QR code.' });
  }
};

// @desc    Delete QR code
// @route   DELETE /api/qr/:id
// @access  Private
export const deleteQr = async (req, res) => {
  try {
    const qrCode = await QrCode.findOne({ _id: req.params.id, owner: req.user._id });
    if (!qrCode) {
      return res.status(404).json({ error: 'QR Code not found.' });
    }

    // Unlink from Link
    await Link.findByIdAndUpdate(qrCode.linkId, { $unset: { qrCodeId: 1 } });
    await QrCode.deleteOne({ _id: qrCode._id });

    res.json({ message: 'QR Code deleted successfully.', id: qrCode._id });
  } catch (error) {
    console.error('Delete QR error:', error);
    res.status(500).json({ error: 'Server error deleting QR code.' });
  }
};

export default {
  createQr,
  getQrCodes,
  getQrById,
  updateQr,
  deleteQr
};
