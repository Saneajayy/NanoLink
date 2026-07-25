import mongoose from 'mongoose';
import ClickEvent from '../models/ClickEvent.js';
import Link from '../models/Link.js';
import QrCode from '../models/QrCode.js';

// Helper to fill missing dates in time-series for Recharts
const generateDateSeries = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  // If startDate is Unix epoch (all time), default to last 30 days for clean chart rendering if no events exist
  if (startDate.getTime() === 0) {
    current = new Date();
    current.setDate(current.getDate() - 30);
  }
  
  const now = new Date(endDate);
  while (current <= now) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// @desc    Get aggregated analytics data for current user (or specific link)
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const { linkId, range = '7d' } = req.query;

    // 1. Find all links owned by user
    const userLinks = await Link.find({ owner: user._id }).select('_id slug shortUrl title totalClicks');
    let targetLinkIds = userLinks.map(l => l._id);

    if (linkId && linkId !== 'all') {
      const isValid = targetLinkIds.some(id => id.toString() === linkId.toString());
      if (!isValid) {
        return res.status(403).json({ error: 'Unauthorized access to specified link analytics.' });
      }
      targetLinkIds = [new mongoose.Types.ObjectId(linkId)];
    }

    // 2. Compute date range
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
      prevStartDate.setDate(now.getDate() - 14);
      prevEndDate.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 30);
      prevStartDate.setDate(now.getDate() - 60);
      prevEndDate.setDate(now.getDate() - 30);
    } else if (range === 'all') {
      startDate = new Date(0); // Epoch
      prevStartDate = new Date(0);
      prevEndDate = new Date(0);
    }

    if (targetLinkIds.length === 0) {
      // Return empty analytics schema if user has created no links yet
      return res.json({
        overview: { totalClicks: 0, clicksChange: 0, totalScans: 0, scansChange: 0, uniqueVisitors: 0, topReferrer: 'None' },
        timeSeries: generateDateSeries(range === 'all' ? new Date(Date.now() - 30*86400000) : startDate, now).map(d => ({ date: d, clicks: 0, scans: 0 })),
        breakdowns: { device: [], browser: [], referrer: [], country: [] },
        links: userLinks
      });
    }

    // 3. Current Period Aggregations
    const currentEvents = await ClickEvent.aggregate([
      { $match: { linkId: { $in: targetLinkIds }, timestamp: { $gte: startDate, $lte: now } } }
    ]);

    let totalClicks = 0;
    let totalScans = 0;
    const uniqueIps = new Set();
    const referrerCounts = {};
    const deviceCounts = {};
    const browserCounts = {};
    const countryCounts = {};
    const timeSeriesMap = {};

    currentEvents.forEach(ev => {
      if (ev.type === 'scan') totalScans++;
      else totalClicks++;

      if (ev.ipHash) uniqueIps.add(ev.ipHash);

      const ref = ev.referrer || 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

      const dev = ev.device || 'other';
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

      const bro = ev.browser || 'Other';
      browserCounts[bro] = (browserCounts[bro] || 0) + 1;

      const ctry = ev.country || 'Unknown';
      countryCounts[ctry] = (countryCounts[ctry] || 0) + 1;

      const dateStr = new Date(ev.timestamp).toISOString().split('T')[0];
      if (!timeSeriesMap[dateStr]) timeSeriesMap[dateStr] = { clicks: 0, scans: 0 };
      if (ev.type === 'scan') timeSeriesMap[dateStr].scans++;
      else timeSeriesMap[dateStr].clicks++;
    });

    // 4. Previous Period Comparisons (for % change stats)
    let clicksChange = 0;
    let scansChange = 0;
    if (range !== 'all') {
      const prevEvents = await ClickEvent.aggregate([
        { $match: { linkId: { $in: targetLinkIds }, timestamp: { $gte: prevStartDate, $lte: prevEndDate } } }
      ]);
      let prevClicks = 0;
      let prevScans = 0;
      prevEvents.forEach(ev => {
        if (ev.type === 'scan') prevScans++;
        else prevClicks++;
      });

      if (prevClicks > 0) clicksChange = Math.round(((totalClicks - prevClicks) / prevClicks) * 100);
      else if (totalClicks > 0) clicksChange = 100;

      if (prevScans > 0) scansChange = Math.round(((totalScans - prevScans) / prevScans) * 100);
      else if (totalScans > 0) scansChange = 100;
    }

    // Top Referrer calculation
    let topReferrer = 'Direct';
    let maxRef = 0;
    Object.entries(referrerCounts).forEach(([k, v]) => {
      if (v > maxRef && k !== 'Direct') {
        maxRef = v;
        topReferrer = k;
      }
    });
    if (maxRef === 0 && referrerCounts['Direct'] > 0) topReferrer = 'Direct';
    if (Object.keys(referrerCounts).length === 0) topReferrer = 'None';

    // 5. Format Breakdowns into sorted arrays with percentages
    const totalEvents = totalClicks + totalScans || 1; // avoid div by 0

    const formatBreakdown = (obj) => {
      return Object.entries(obj)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalEvents) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    };

    // 6. Complete Time-Series dates
    const chartStartDate = (range === 'all' && currentEvents.length > 0)
      ? new Date(Math.min(...currentEvents.map(e => new Date(e.timestamp).getTime())))
      : startDate;

    const dateSeries = generateDateSeries(chartStartDate, now);
    const timeSeries = dateSeries.map(date => ({
      date,
      clicks: timeSeriesMap[date]?.clicks || 0,
      scans: timeSeriesMap[date]?.scans || 0
    }));

    res.json({
      overview: {
        totalClicks,
        clicksChange,
        totalScans,
        scansChange,
        uniqueVisitors: uniqueIps.size,
        topReferrer
      },
      timeSeries,
      breakdowns: {
        device: formatBreakdown(deviceCounts),
        browser: formatBreakdown(browserCounts),
        referrer: formatBreakdown(referrerCounts),
        country: formatBreakdown(countryCounts)
      },
      links: userLinks
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics data.' });
  }
};

// @desc    Export analytics dataset as CSV per Section 6.9
// @route   GET /api/analytics/export
// @access  Private
export const exportCsv = async (req, res) => {
  try {
    const user = req.user;
    const { linkId, range = '7d' } = req.query;

    const userLinks = await Link.find({ owner: user._id });
    const linkMap = {};
    let targetLinkIds = userLinks.map(l => {
      linkMap[l._id.toString()] = { title: l.title || l.slug, shortUrl: l.shortUrl };
      return l._id;
    });

    if (linkId && linkId !== 'all') {
      const isValid = targetLinkIds.some(id => id.toString() === linkId.toString());
      if (!isValid) {
        return res.status(403).json({ error: 'Unauthorized export request.' });
      }
      targetLinkIds = [new mongoose.Types.ObjectId(linkId)];
    }

    const now = new Date();
    let startDate = new Date(0);
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);

    const events = await ClickEvent.find({
      linkId: { $in: targetLinkIds },
      timestamp: { $gte: startDate, $lte: now }
    })
      .sort({ timestamp: -1 })
      .limit(5000);

    // Build CSV header & rows
    let csv = 'Date,Time,Link Title,Short URL,Event Type,Referrer,Device,Browser,Country\n';

    events.forEach(ev => {
      const d = new Date(ev.timestamp);
      const dateStr = d.toISOString().split('T')[0];
      const timeStr = d.toTimeString().split(' ')[0];
      const linkInfo = linkMap[ev.linkId?.toString()] || { title: 'Unknown', shortUrl: 'N/A' };
      
      const escape = (str = '') => `"${str.replace(/"/g, '""')}"`;

      csv += `${escape(dateStr)},${escape(timeStr)},${escape(linkInfo.title)},${escape(linkInfo.shortUrl)},${escape(ev.type)},${escape(ev.referrer)},${escape(ev.device)},${escape(ev.browser)},${escape(ev.country)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="nanolink-analytics-${range}-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Server error generating CSV export.' });
  }
};

export default {
  getAnalytics,
  exportCsv
};
