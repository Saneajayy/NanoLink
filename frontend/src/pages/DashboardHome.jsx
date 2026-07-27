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
 const res = await axios.get('/api/links?limit=4&sort=-createdAt');
 const links = res.data.links || [];
 setRecentLinks(links.slice(0, 4));

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
    window.addEventListener('nanolink_data_change', fetchDashboardData);
    return () => window.removeEventListener('nanolink_data_change', fetchDashboardData);
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
 const qrLimit = isCorePlan ? 50 : 10;

 return (
  <div className="space-y-8 pb-12 bg-white font-light">
    {/* Welcome Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
          Welcome back, <span className="text-[#FF6206]">{user?.name?.split(' ')[0] || 'Creator'}</span>!
        </h1>
        <p className="text-sm text-neutral-600 font-light mt-1">
          Here's what's happening with your short links and QR codes this month.
        </p>
      </div>

      <button
        onClick={() => openCreateLinkModal()}
        className="px-5 py-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Link</span>
      </button>
    </div>

    {/* Quick-Create Input Box per Section 2 & 6.4 */}
    <div className="p-2 bg-neutral-100 border border-neutral-200 shadow-sm">
      <form onSubmit={handleQuickCreateSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white border border-neutral-200">
        <div className="w-full flex-1 flex items-center gap-3 px-3">
          <Link2 className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            placeholder="Paste any long URL here to get started (e.g. https://your-website.com/long-campaign)..."
            className="w-full bg-transparent border-none text-black placeholder-neutral-400 font-normal text-sm focus:outline-none focus:ring-0 py-2.5"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Shorten & Customize</span>
        </button>
      </form>
    </div>

    {/* 3 Stat Cards per Section 6.4 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Stat Card 1: Links */}
      <div className="p-6 bg-white border border-neutral-200 relative overflow-hidden transition-all shadow-sm hover:border-neutral-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-normal text-neutral-500 uppercase tracking-wider">Links Created</span>
          <div className="w-10 h-10 bg-[#1A00FF] text-white flex items-center justify-center font-bold shadow-sm">
            <Link2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">{linksUsed}</span>
          <span className="text-sm font-light text-neutral-500">/ {linksLimit} this month</span>
        </div>
        <div className="w-full bg-neutral-100 h-1.5 mt-4 overflow-hidden">
          <div
            className="bg-[#FF6206] h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (linksUsed / linksLimit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Stat Card 2: QR Codes */}
      <div className="p-6 bg-white border border-neutral-200 relative overflow-hidden transition-all shadow-sm hover:border-neutral-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-normal text-neutral-500 uppercase tracking-wider">QR Codes</span>
          <div className="w-10 h-10 bg-[#FF6206] text-white flex items-center justify-center font-bold shadow-sm">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">{qrUsed}</span>
          <span className="text-sm font-light text-neutral-500">/ {qrLimit} this month</span>
        </div>
        <div className="w-full bg-neutral-100 h-1.5 mt-4 overflow-hidden">
          <div
            className="bg-[#1A00FF] h-full transition-all duration-500"
            style={{ width: `${Math.min(100, (qrUsed / qrLimit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Stat Card 3: Total Clicks */}
      <div className="p-6 bg-white border border-neutral-200 relative overflow-hidden transition-all shadow-sm hover:border-neutral-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-normal text-neutral-500 uppercase tracking-wider">Total Clicks & Scans</span>
          <div className="w-10 h-10 bg-[#1A00FF] text-white flex items-center justify-center font-bold shadow-sm">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-black">{totalClicksAllTime.toLocaleString()}</span>
          <span className="text-xs font-normal text-[#FF6206] flex items-center gap-0.5 ml-1">
            <TrendingUp className="w-3.5 h-3.5" /> All time
          </span>
        </div>
        <p className="text-xs font-light text-neutral-500 mt-4">Real-time Redis event aggregation</p>
      </div>
    </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Links List (last 3-5) with View all -> per Section 6.4 */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-[#FF6206]" />
                <h2 className="text-lg font-bold text-black">Recent Links</h2>
              </div>
              <Link
                to="/dashboard/links"
                className="px-3 py-1.5 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-neutral-500 font-normal text-sm">Loading recent links...</div>
            ) : recentLinks.length === 0 ? (
              <div className="py-12 text-center bg-neutral-50 border border-dashed border-neutral-300 space-y-3">
                <Link2 className="w-8 h-8 text-[#FF6206] mx-auto" />
                <div className="text-sm font-semibold text-black">No links created yet</div>
                <p className="text-xs font-light text-neutral-600 max-w-xs mx-auto">Use the quick-create box above or click below to build your first short link!</p>
                <button
                  onClick={() => openCreateLinkModal()}
                  className="mt-2 px-4 py-2 bg-[#FF6206] text-white font-medium text-xs shadow-sm"
                >
                  Create Your First Link
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLinks.map((link) => (
                  <div
                    key={link._id}
                    className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4 transition-all shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-black text-sm truncate">{link.title || link.slug}</span>
                        {link.customAlias && (
                          <span className="px-1.5 py-0.5 bg-[#FF6206] text-white text-[10px] font-medium uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs font-normal text-[#1A00FF] hover:underline flex items-center gap-1"
                        >
                          <span>{link.shortUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-neutral-300">•</span>
                        <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-xs font-mono font-normal text-[#1A00FF] hover:underline truncate max-w-[200px] sm:max-w-xs">{link.originalUrl}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-black">{link.totalClicks || 0}</div>
                        <div className="text-[10px] text-neutral-500 uppercase font-normal">clicks</div>
                      </div>

                      <button
                        onClick={() => handleCopy(link.shortUrl, link._id)}
                        title="Copy short link"
                        className="p-2.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white transition-all shadow-sm cursor-pointer"
                      >
                        {copiedId === link._id ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Link This Month Card per Section 6.4 */}
        <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <TrendingUp className="w-5 h-5 text-[#FF6206]" />
              <h2 className="text-lg font-bold text-black">Top Performing Link</h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-neutral-500 font-normal text-sm">Analyzing clicks...</div>
            ) : !topLink ? (
              <div className="py-12 text-center text-neutral-500 font-normal text-sm">No click activity recorded yet.</div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-black text-base truncate">{topLink.title || topLink.slug}</h3>
                    <span className="px-2 py-0.5 bg-[#FF6206] text-white text-xs font-medium shrink-0 shadow-sm">
                      Top #1
                    </span>
                  </div>
                  <a
                    href={topLink.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs font-normal text-[#1A00FF] block truncate hover:underline"
                  >
                    {topLink.shortUrl}
                  </a>
                  <a href={topLink.originalUrl} target="_blank" rel="noreferrer" className="text-xs font-mono font-normal text-[#1A00FF] hover:underline truncate block">{topLink.originalUrl}</a>
                </div>

                <div className="flex items-center justify-between px-2">
                  <div>
                    <div className="text-3xl font-bold text-black">{topLink.totalClicks || 0}</div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider font-normal mt-0.5">Total Engagement</div>
                  </div>
                  <Link
                    to="/dashboard/analytics"
                    className="px-4 py-2 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
            <p className="text-[11px] font-light text-neutral-500">
              Ranked by real-time click volume across all active links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
