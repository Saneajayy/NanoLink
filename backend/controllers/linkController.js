import Link from '../models/Link.js';
import QrCode from '../models/QrCode.js';
import PLAN_LIMITS from '../constants/planLimits.js';
import cacheService from '../services/cacheService.js';
import qrService from '../services/qrService.js';
import crypto from 'crypto';

// Helper to generate random 6-character alphanumeric slug
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

// @desc    Create a new short link (The single shared link creation endpoint per Section 2)
// @route   POST /api/links
// @access  Private
export const createLink = async (req, res) => {
  try {
    const user = req.user;
    const { originalUrl, customAlias, slug: customSlug, title, generateQr, qrOptions, utmParams } = req.body;

    if (!originalUrl || !originalUrl.trim()) {
      return res.status(400).json({ error: 'Please provide a valid destination URL.' });
    }

    // Ensure URL has http/https prefix
    let destinationUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(destinationUrl)) {
      destinationUrl = 'https://' + destinationUrl;
    }

    // 1. Check Monthly Link Creation Quota
    const limitConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
    if (user.monthlyLinkCount >= limitConfig.linksPerMonth) {
      return res.status(403).json({
        error: 'QUOTA_EXCEEDED',
        message: `You have reached your monthly limit of ${limitConfig.linksPerMonth} links on the ${user.plan.toUpperCase()} plan. Upgrade to unlock more capacity!`
      });
    }

    // 2. Handle Custom Back-Half / Alias
    let slug;
    let isCustomAlias = false;
    const requestedSlug = customAlias || customSlug;

    if (requestedSlug && requestedSlug.trim()) {
      isCustomAlias = true;
      slug = requestedSlug.trim();

      // Enforce Custom Back-Half Quota on Free Tier
      if (limitConfig.customBackHalvesPerMonth !== null && user.monthlyCustomBackHalfCount >= limitConfig.customBackHalvesPerMonth) {
        return res.status(403).json({
          error: 'QUOTA_EXCEEDED',
          message: `You have reached your monthly limit of ${limitConfig.customBackHalvesPerMonth} custom back-halves on the Free plan. Upgrade to Core for unlimited custom aliases!`
        });
      }

      // Validate slug syntax (alphanumeric, dash, underscore, 3-30 chars)
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug)) {
        return res.status(400).json({ error: 'Custom alias must be between 3 and 30 characters and contain only letters, numbers, hyphens, or underscores.' });
      }

      // Check against reserved words
      const reservedWords = ['api', 'auth', 'r', 'dashboard', 'login', 'signup', 'pricing', 'stats', 'billing', 'settings', 'admin'];
      if (reservedWords.includes(slug.toLowerCase())) {
        return res.status(400).json({ error: 'This alias is a reserved system word. Please choose another.' });
      }

      // Check if alias already exists
      const existingLink = await Link.findOne({ slug: { $regex: new RegExp(`^${slug}$`, 'i') } });
      if (existingLink) {
        return res.status(400).json({ error: 'This custom back-half alias is already taken. Please pick another.' });
      }
    } else {
      slug = await generateRandomSlug();
    }

    // 3. Handle UTM Builder (Core Plan Only)
    let processedUtm = {};
    if (utmParams && Object.values(utmParams).some(val => val && val.trim())) {
      if (!limitConfig.utmBuilder) {
        return res.status(403).json({
          error: 'QUOTA_EXCEEDED',
          message: 'The UTM Builder is available exclusively on the Core plan. Upgrade to bake analytics parameters directly into your links!'
        });
      }

      processedUtm = {
        source: utmParams.source?.trim() || '',
        medium: utmParams.medium?.trim() || '',
        campaign: utmParams.campaign?.trim() || '',
        term: utmParams.term?.trim() || '',
        content: utmParams.content?.trim() || ''
      };

      // Bake UTM parameters into originalUrl at creation time per Section 3
      try {
        const urlObj = new URL(destinationUrl);
        if (processedUtm.source) urlObj.searchParams.set('utm_source', processedUtm.source);
        if (processedUtm.medium) urlObj.searchParams.set('utm_medium', processedUtm.medium);
        if (processedUtm.campaign) urlObj.searchParams.set('utm_campaign', processedUtm.campaign);
        if (processedUtm.term) urlObj.searchParams.set('utm_term', processedUtm.term);
        if (processedUtm.content) urlObj.searchParams.set('utm_content', processedUtm.content);
        destinationUrl = urlObj.toString();
      } catch (e) {
        console.warn('Failed to parse URL for UTM baking:', e);
      }
    }

    // 4. Handle Inline QR Code Generation Quota & Styling (Section 2 & 5)
    if (generateQr) {
      if (user.monthlyQrCodeCount >= limitConfig.qrCodesPerMonth) {
        return res.status(403).json({
          error: 'QUOTA_EXCEEDED',
          message: `You have reached your monthly limit of ${limitConfig.qrCodesPerMonth} QR Codes on the ${user.plan.toUpperCase()} plan. Upgrade to create more!`
        });
      }

      // Verify advanced styling isn't attempted on Free plan
      if (limitConfig.qrCustomization === 'basic' && qrOptions) {
        if (qrOptions.pattern || qrOptions.cornerStyle || qrOptions.frame) {
          return res.status(403).json({
            error: 'QUOTA_EXCEEDED',
            message: 'Advanced QR styling (patterns, corner styles, frames) is available exclusively on the Core plan.'
          });
        }
      }
    }

    // 5. Create Link Document
    const link = await Link.create({
      slug,
      originalUrl: destinationUrl,
      customAlias: isCustomAlias,
      owner: user._id,
      title: title?.trim() || destinationUrl.replace(/^https?:\/\//i, '').substring(0, 40),
      utmParams: processedUtm
    });

    // 6. Generate QR Code if requested
    let qrCode = null;
    if (generateQr) {
      qrCode = await qrService.createQrForLink(link, user, qrOptions || {});
      user.monthlyQrCodeCount += 1;
    }

    // 7. Increment User Quota Counters
    user.monthlyLinkCount += 1;
    if (isCustomAlias) {
      user.monthlyCustomBackHalfCount += 1;
    }
    await user.save();

    // 8. Cache redirect in Redis (URL + ID) for ultra-fast lookup per Section 8
    await cacheService.cacheRedirect(slug, destinationUrl, link._id);

    res.status(201).json({
      link: link.toJSON(),
      qrCode: qrCode ? qrCode.toJSON() : null,
      quotas: {
        linksUsed: user.monthlyLinkCount,
        linksLimit: limitConfig.linksPerMonth,
        customBackHalvesUsed: user.monthlyCustomBackHalfCount,
        customBackHalvesLimit: limitConfig.customBackHalvesPerMonth,
        qrCodesUsed: user.monthlyQrCodeCount,
        qrCodesLimit: limitConfig.qrCodesPerMonth
      }
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Server error creating short link.' });
  }
};

// @desc    Get paginated list of current user's links
// @route   GET /api/links
// @access  Private
export const getLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sort = req.query.sort || '-createdAt';

    const query = { owner: req.user._id, isActive: true };
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Link.countDocuments(query);
    const links = await Link.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('qrCodeId');

    res.json({
      links: links.map(l => l.toJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Server error fetching links.' });
  }
};

// @desc    Get single link detail
// @route   GET /api/links/:id
// @access  Private
export const getLinkById = async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, owner: req.user._id }).populate('qrCodeId');
    if (!link || !link.isActive) {
      return res.status(404).json({ error: 'Link not found.' });
    }
    res.json(link.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching link detail.' });
  }
};

// @desc    Update link title & destination URL (Slug and UTM are NOT editable per Section 5)
// @route   PUT /api/links/:id
// @access  Private
export const updateLink = async (req, res) => {
  try {
    const { title, originalUrl } = req.body;
    const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });

    if (!link || !link.isActive) {
      return res.status(404).json({ error: 'Link not found.' });
    }

    if (title !== undefined) link.title = title.trim();
    if (originalUrl !== undefined && originalUrl.trim()) {
      let dest = originalUrl.trim();
      if (!/^https?:\/\//i.test(dest)) dest = 'https://' + dest;
      link.originalUrl = dest;
      // Update Redis cache with new destination URL and existing ID per Section 8
      await cacheService.cacheRedirect(link.slug, dest, link._id);
    }

    await link.save();
    res.json(link.toJSON());
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Server error updating link.' });
  }
};

// @desc    Soft delete link (set isActive: false per Section 5 & 6.5)
// @route   DELETE /api/links/:id
// @access  Private
export const deleteLink = async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });
    if (!link || !link.isActive) {
      return res.status(404).json({ error: 'Link not found or already deleted.' });
    }

    link.isActive = false;
    await link.save();

    // Remove from Redis cache so public redirect immediately stops resolving per Section 8
    await cacheService.removeCachedRedirect(link.slug);

    if (link.qrCodeId) {
      await QrCode.deleteOne({ _id: link.qrCodeId });
    }

    res.json({ message: 'Link deleted successfully.', id: link._id });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Server error deleting link.' });
  }
};

// @desc    Public Redirect Engine (GET /r/:slug) - Fast, non-blocking click logging per Section 8
// @route   GET /r/:slug
// @access  Public
export const redirectSlug = async (req, res) => {
  const { slug } = req.params;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    // 1. Check Redis Cache First per Section 8 point 1
    const cached = await cacheService.getCachedRedirect(slug);
    let destination = null;
    let linkId = null;

    if (cached && cached.url) {
      destination = cached.url;
      linkId = cached.id;
    }

    if (!destination) {
      // 2. Cache Miss: Fall back to MongoDB
      const link = await Link.findOne({ slug, isActive: true });
      if (!link) {
        // Redirect to branded fallback page per Section 6.12
        return res.redirect(`${clientUrl}/not-found-redirect?slug=${encodeURIComponent(slug)}`);
      }
      destination = link.originalUrl;
      linkId = link._id;

      // Populate Redis Cache with URL and ID per Section 8
      await cacheService.cacheRedirect(slug, destination, linkId);
    } else if (!linkId) {
      // Backward compatibility if ID wasn't in cache
      const link = await Link.findOne({ slug }).select('_id');
      if (link) linkId = link._id;
    }

    // 3. Fire off ClickEvent logging & Redis queue/counter asynchronously without blocking response per Section 8 point 2 & 3
    if (linkId) {
      cacheService.recordEventAsync(linkId, slug, req, false, null);
    }

    // 4. Execute Instant HTTP 302 Redirect
    return res.redirect(destination);
  } catch (error) {
    console.error(`Redirect error for slug ${slug}:`, error.message);
    return res.redirect(`${clientUrl}/not-found-redirect?error=server`);
  }
};

export default {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  redirectSlug
};
