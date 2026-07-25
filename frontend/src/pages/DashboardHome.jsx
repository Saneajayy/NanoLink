import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useOutletContext, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Link2, 
  QrCode, 
  MousePointerClick, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  Plus,
  Check,
  BarChart3
} from 'lucide-react';

const DashboardHome = () => {
  const { user, isCorePlan, getPendingUrl } = useAuth();
  const { openCreateLinkModal } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [quickUrl, setQuickUrl] = useState('');
  const [recentLinks, setRecentLinks] = useState([]);
  const [topLink, setTopLink] = useState(null);
  const [totalClicksAllTime, setTotalClicksAllTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Check for pre-filled URL from homepage or query param per Section 4 & 6.4
  useEffect(() => {
    const checkPending = () => {
      const urlParams = new URLSearchParams(location.search);
      const actionParam = urlParams.get('action');
      const storedUrl = getPendingUrl(true); // Get and clear from sessionStorage

      if (storedUrl) {
        openCreateLinkModal(storedUrl);
        if (actionParam) {
          navigate('/dashboard', { replace: true });
        }
      } else if (actionParam === 'create_link') {
        openCreateLinkModal('');
        navigate('/dashboard', { replace: true });
      }
    };

    checkPending();
  }, [location, navigate, openCreateLinkModal, getPendingUrl]);

  // Fetch recent links & stats
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/links?limit=5&sort=-createdAt');
      const links = res.data.links || [];
      setRecentLinks(links);

      // Compute total clicks and find top performing link this month
      let clicksSum = 0;
      let highestLink = null;
      links.forEach(link => {
        clicksSum += (link.totalClicks || 0);
        if (!highestLink || (link.totalClicks || 0) > (highestLink.totalClicks || 0)) {
          highestLink = link;
        }
      });

      setTotalClicksAllTime(clicksSum);
      setTopLink(highestLink && (highestLink.totalClicks > 0) ? highestLink : (links[0] || null));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Quick-Create Box Submit (Section 2 & 6.4: MUST open modal, never create bare-bones link directly)
  const handleQuickCreateSubmit = (e) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      openCreateLinkModal(quickUrl.trim());
      setQuickUrl('');
    } else {
      openCreateLinkModal('');
    }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute quotas
  const linksUsed = user?.monthlyLinkCount || 0;
  const linksLimit = isCorePlan ? 100 : 50;
  const qrUsed = user?.monthlyQrCodeCount || 0;
  const qrLimit = isCorePlan ? 5 : 2;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-orange-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Creator'}</span>!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what's happening with your short links and QR codes this month.
          </p>
        </div>

        <button
          onClick={() => openCreateLinkModal()}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Link</span>
        </button>
      </div>

      {/* Quick-Create Input Box per Section 2 & 6.4 */}
      <div className="p-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-orange-500/20 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleQuickCreateSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-900/90 rounded-xl">
          <div className="w-full flex-1 flex items-center gap-3 px-3">
            <Link2 className="w-5 h-5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Paste any long URL here to get started (e.g. https://your-website.com/long-campaign)..."
              className="w-full bg-transparent border-none text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-0 py-2.5"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-orange-500 hover:from-indigo-500 hover:to-orange-400 text-white font-bold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Shorten & Customize</span>
          </button>
        </form>
      </div>

      {/* 3 Stat Cards per Section 6.4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat Card 1: Links */}
        <div className="p-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Links Created</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{linksUsed}</span>
            <span className="text-sm font-medium text-slate-500">/ {linksLimit} this month</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (linksUsed / linksLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Stat Card 2: QR Codes */}
        <div className="p-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Codes</span>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{qrUsed}</span>
            <span className="text-sm font-medium text-slate-500">/ {qrLimit} this month</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (qrUsed / qrLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Stat Card 3: Total Clicks */}
        <div className="p-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clicks & Scans</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalClicksAllTime.toLocaleString()}</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5 ml-1">
              <TrendingUp className="w-3.5 h-3.5" /> All time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-4">Real-time Redis event aggregation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Links List (last 3-5) with View all -> per Section 6.4 */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Recent Links</h2>
              </div>
              <Link
                to="/dashboard/links"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Loading recent links...</div>
            ) : recentLinks.length === 0 ? (
              <div className="py-12 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800/80 space-y-3">
                <Link2 className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-400">No links created yet</div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Use the quick-create box above or click below to build your first short link!</p>
                <button
                  onClick={() => openCreateLinkModal()}
                  className="mt-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 font-semibold text-xs rounded-lg transition-colors"
                >
                  Create Your First Link
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLinks.map((link) => (
                  <div
                    key={link._id}
                    className="p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">{link.title || link.slug}</span>
                        {link.customAlias && (
                          <span className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>{link.shortUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">{link.originalUrl}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-white">{link.totalClicks || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-medium">clicks</div>
                      </div>

                      <button
                        onClick={() => handleCopy(link.shortUrl, link._id)}
                        title="Copy short link"
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
                      >
                        {copiedId === link._id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {link.qrCodeId && (
                        <Link
                          to={`/dashboard/qr-codes`}
                          title="View QR Code"
                          className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Link This Month Card per Section 6.4 */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">Top Performing Link</h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Analyzing clicks...</div>
            ) : !topLink ? (
              <div className="py-12 text-center text-slate-500 text-sm">No click activity recorded yet.</div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-base truncate">{topLink.title || topLink.slug}</h3>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full shrink-0">
                      Top #1
                    </span>
                  </div>
                  <a
                    href={topLink.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-indigo-400 block truncate hover:underline"
                  >
                    {topLink.shortUrl}
                  </a>
                  <p className="text-xs text-slate-400 truncate">{topLink.originalUrl}</p>
                </div>

                <div className="flex items-center justify-between px-2">
                  <div>
                    <div className="text-3xl font-extrabold text-white">{topLink.totalClicks || 0}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Total Engagement</div>
                  </div>
                  <Link
                    to="/dashboard/analytics"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500">
              Ranked by real-time click volume across all active links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
