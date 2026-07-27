import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
 BarChart3, 
 TrendingUp, 
 TrendingDown, 
 MousePointerClick, 
 QrCode, 
 Users, 
 Globe, 
 Download, 
 Calendar, 
 Filter, 
 Monitor, 
 Smartphone, 
 Tablet, 
 Compass, 
 Share2,
 Sparkles,
 ArrowUpRight,
 ArrowDownRight,
 Plus,
 Crown,
 Lock
} from 'lucide-react';
import { 
 ResponsiveContainer, 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis, 
 Tooltip, 
 CartesianGrid, 
 Legend 
} from 'recharts';

const AnalyticsPage = () => {
 const { openCreateLinkModal } = useOutletContext();
 const { isCorePlan } = useAuth();
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const [range, setRange] = useState('7d');
 const [selectedLinkId, setSelectedLinkId] = useState('all');
 const [exporting, setExporting] = useState(false);

 useEffect(() => {
   if (!isCorePlan && (range === '30d' || range === 'all')) {
     setRange('7d');
   }
 }, [isCorePlan, range]);

 const fetchAnalytics = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await axios.get(`/api/analytics?range=${range}&linkId=${selectedLinkId}`);
 setData(res.data);
 } catch (err) {
 console.error('Failed to load analytics:', err);
 setError('Failed to load analytics data. Please try again.');
 } finally {
 setLoading(false);
 }
 }, [range, selectedLinkId]);

 useEffect(() => {
   fetchAnalytics();
   window.addEventListener('nanolink_data_change', fetchAnalytics);
   return () => window.removeEventListener('nanolink_data_change', fetchAnalytics);
 }, [fetchAnalytics]);

 const handleExportCsv = async () => {
 setExporting(true);
 try {
 const res = await axios.get(`/api/analytics/export?range=${range}&linkId=${selectedLinkId}`, {
 responseType: 'blob'
 });
 const url = window.URL.createObjectURL(new Blob([res.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `nanolink-analytics-${range}-${Date.now()}.csv`);
 document.body.appendChild(link);
 link.click();
 link.parentNode.removeChild(link);
 } catch (err) {
 console.error('CSV export failed:', err);
 alert('Failed to generate CSV export.');
 } finally {
 setExporting(false);
 }
 };

 const getDeviceIcon = (dev = '') => {
 const lower = dev.toLowerCase();
 if (lower === 'desktop') return <Monitor className="w-4 h-4 text-[#1A00FF]" />;
 if (lower === 'mobile') return <Smartphone className="w-4 h-4 text-[#FF6206]" />;
 if (lower === 'tablet') return <Tablet className="w-4 h-4 text-[#1A00FF]" />;
 return <Compass className="w-4 h-4 text-[#FF6206]" />;
 };

 const formatChangePill = (val) => {
    if (val === undefined || val === null || isNaN(val)) return null;
    if (val === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-600 rounded-sm">
          0% change
        </span>
      );
    }
    const isPos = val > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 bg-neutral-100 text-xs font-medium border border-neutral-200 rounded-sm ${isPos ? 'text-emerald-700' : 'text-red-600'}`}>
        {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        <span>{Math.abs(val)}% vs prior</span>
      </span>
    );
  };

  const overview = data?.overview || {};
  const timeSeries = data?.timeSeries || [];
  const breakdowns = data?.breakdowns || { device: [], browser: [], referrer: [], country: [] };
  const links = data?.links || [];

  const totalEvents = (overview.totalClicks || 0) + (overview.totalScans || 0);
  const isEmpty = totalEvents === 0;

  return (
    <div className="space-y-8 pb-12 bg-white font-light">
      {/* Header per Section 6.9 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight flex items-center gap-3">
            <span>Analytics & Insights</span>
            <span className="px-2.5 py-0.5 bg-[#FF6206] text-white text-xs font-medium uppercase tracking-wider rounded-sm shadow-sm">
              Live Feed
            </span>
          </h1>
          <p className="text-sm font-light text-neutral-600 mt-1">Track visitor traffic, QR scans, device distributions, and referral sources in real time.</p>
        </div>

        {/* Action Controls: Date Range Picker & CSV Export Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Link Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-2 shadow-sm">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-black focus:outline-none cursor-pointer pr-4 max-w-[180px] truncate"
            >
              <option value="all" className="bg-white text-black">All links (Aggregate)</option>
              {links.map(l => (
                <option key={l._id} value={l._id} className="bg-white text-black">
                  {l.title || l.slug} ({l.shortUrl})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center bg-white border border-neutral-200 p-1 shadow-sm">
            {[
              { id: '7d', label: 'Last 7 days' },
              { id: '30d', label: 'Last 30 days', coreOnly: true },
              { id: 'all', label: 'All time', coreOnly: true }
            ].map((tab) => {
              const isLocked = !isCorePlan && tab.coreOnly;
              return (
                <button
                  key={tab.id}
                  disabled={isLocked}
                  onClick={() => setRange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1 ${
                    range === tab.id
                      ? 'bg-[#FF6206] text-white shadow-sm'
                      : isLocked
                      ? 'text-neutral-400 cursor-not-allowed bg-neutral-50'
                      : 'text-black hover:bg-neutral-100 cursor-pointer'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isLocked && <Crown className="w-3 h-3 text-[#FF6206] shrink-0" title="Core Pro Feature" />}
                </button>
              );
            })}
          </div>

          {/* Export CSV Button per Section 6.9 */}
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-black font-medium text-xs border border-neutral-200 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-black animate-spin rounded-full" />
            ) : (
              <Download className="w-4 h-4 text-neutral-600" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {!isCorePlan && (
        <div className="mb-6 p-4 bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm shadow-sm">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-[#FF6206] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#FF6206] uppercase tracking-wider">Free Plan Limit: 7-Day Analytics Retention</div>
              <div className="text-xs font-normal text-neutral-800 mt-0.5">
                You are currently viewing the last 7 days of analytical history. Upgrade to Core to unlock 30-day history, all-time aggregate data, and unlimited custom UTM campaigns!
              </div>
            </div>
          </div>
          <a
            href="/dashboard/billing"
            className="px-4 py-2 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white text-xs font-medium uppercase tracking-wider transition-all shrink-0 text-center shadow-sm"
          >
            Upgrade to Core
          </a>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-neutral-500 font-normal space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black animate-spin mx-auto rounded-full" />
          <div className="text-sm">Crunching analytics...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 font-medium text-center shadow-sm">
          {error}
        </div>
      ) : isEmpty ? (
        /* Empty State per Section 6.9 */
        <div className="py-20 px-6 text-center bg-neutral-50 border border-dashed border-neutral-300 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-[#FF6206] text-white flex items-center justify-center mx-auto shadow-sm">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black mb-1">No analytical data yet</h3>
            <p className="text-xs font-light text-neutral-600 max-w-sm mx-auto leading-relaxed">
              We haven't recorded any link clicks or QR code scans in this time period. Share your short URLs or physical QR flyers to see real-time traffic start flowing in!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setSelectedLinkId('all')}
              className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black font-medium text-xs border border-neutral-200 transition-colors cursor-pointer shadow-sm"
            >
              Reset Filter to All Links
            </button>
            <button
              onClick={() => openCreateLinkModal()}
              className="px-5 py-2.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Link to Track</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 4 Overview Stat Cards per Section 6.9 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Clicks */}
            <div className="bg-white border border-neutral-200 p-5 relative overflow-hidden group hover:bg-neutral-50 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Link Clicks</span>
                <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 text-[#1A00FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MousePointerClick className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-2">{overview.totalClicks || 0}</div>
              <div className="flex items-center justify-between">
                {formatChangePill(overview.clicksChange)}
                <span className="text-[11px] font-light text-neutral-500">vs prior period</span>
              </div>
            </div>

            {/* 2. Total QR Scans */}
            <div className="bg-white border border-neutral-200 p-5 relative overflow-hidden group hover:bg-neutral-50 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total QR Scans</span>
                <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 text-[#FF6206] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-2">{overview.totalScans || 0}</div>
              <div className="flex items-center justify-between">
                {formatChangePill(overview.scansChange)}
                <span className="text-[11px] font-light text-neutral-500">vs prior period</span>
              </div>
            </div>

            {/* 3. Unique Visitors */}
            <div className="bg-white border border-neutral-200 p-5 relative overflow-hidden group hover:bg-neutral-50 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Unique Visitors</span>
                <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 text-[#1A00FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-2">{overview.uniqueVisitors || 0}</div>
              <div className="text-[11px] font-light text-neutral-500 mt-2">Anonymized SHA-256 IP hashes per Section 3</div>
            </div>

            {/* 4. Top Referrer */}
            <div className="bg-white border border-neutral-200 p-5 relative overflow-hidden group hover:bg-neutral-50 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Top Referrer</span>
                <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 text-[#FF6206] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-black mb-2 truncate" title={overview.topReferrer || 'Direct'}>
                {overview.topReferrer || 'Direct'}
              </div>
              <div className="text-[11px] font-light text-neutral-500 mt-2">Primary source of incoming traffic</div>
            </div>
          </div>

          {/* Main Time-Series Chart (Clicks vs. Scans) per Section 6.9 */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#FF6206]" />
                  <span>Traffic Over Time</span>
                </h2>
                <p className="text-xs font-light text-neutral-600 mt-0.5">Daily breakdown comparing short link clicks against physical QR scans.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#1A00FF] inline-block rounded-sm" />
                  <span className="text-black">Link Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF6206] inline-block rounded-sm" />
                  <span className="text-black">QR Scans</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A00FF" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#1A00FF" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6206" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#FF6206" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#e5e5e5', borderRadius: '4px', color: '#000000', fontSize: '12px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                    itemStyle={{ fontWeight: '600' }}
                    labelStyle={{ color: '#FF6206', fontWeight: '600', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="clicks" name="Link Clicks" stroke="#1A00FF" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                  <Area type="monotone" dataKey="scans" name="QR Scans" stroke="#FF6206" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Breakdown Panels (Grid below main chart) per Section 6.9 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel 1: Device Breakdown */}
            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#FF6206]" />
                  <span>Device Distribution</span>
                </h3>
                <p className="text-xs font-light text-neutral-600 mb-6">Visitor traffic segmented by operating device.</p>

                <div className="space-y-4">
                  {breakdowns.device.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="capitalize flex items-center gap-2 text-black">
                          {getDeviceIcon(item.name)}
                          <span>{item.name}</span>
                        </span>
                        <span className="text-[#FF6206] font-mono font-semibold">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#1A00FF] transition-all duration-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {breakdowns.device.length === 0 && (
                    <div className="text-xs font-light text-neutral-500 text-center py-6">No device data recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 2: Browser Breakdown */}
            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#FF6206]" />
                  <span>Browser Share</span>
                </h3>
                <p className="text-xs font-light text-neutral-600 mb-6">Top browsers used by your visitors.</p>

                <div className="space-y-4">
                  {breakdowns.browser.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-black">{item.name}</span>
                        <span className="text-[#FF6206] font-mono font-semibold">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#FF6206] transition-all duration-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {breakdowns.browser.length === 0 && (
                    <div className="text-xs font-light text-neutral-500 text-center py-6">No browser data recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 3: Referrer Breakdown */}
            <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#FF6206]" />
                  <span>Top Referring Sources</span>
                </h3>
                <p className="text-xs font-light text-neutral-600 mb-6">Where your clicks and scans originated from.</p>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {breakdowns.referrer.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 text-xs rounded-sm">
                      <span className="text-black font-medium truncate max-w-[160px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#FF6206]">
                        <span>{item.count}</span>
                        <span className="text-[10px] text-neutral-500 font-normal">({item.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                  {breakdowns.referrer.length === 0 && (
                    <div className="text-xs font-light text-neutral-500 text-center py-6">No referrer data recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location / Country Breakdown Table per Section 6.9 */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF6206]" />
              <span>Geographic Location Breakdown</span>
            </h3>
            <p className="text-xs font-light text-neutral-600 mb-6">Visitor distribution by country (identified via cloud edge headers).</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Country / Region</th>
                    <th className="py-3 px-4 text-right">Total Visits</th>
                    <th className="py-3 px-4 text-right">Share (%)</th>
                    <th className="py-3 px-4 w-48">Traffic Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs font-normal">
                  {breakdowns.country.map((item) => (
                    <tr key={item.name} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-black flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-[11px] font-mono font-semibold uppercase text-[#FF6206] rounded-sm">
                          {item.name === 'Unknown' ? '??' : item.name.substring(0, 3)}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-black">{item.count}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#FF6206]">{item.percentage}%</td>
                      <td className="py-3.5 px-4">
                        <div className="w-full h-2 bg-neutral-100 overflow-hidden rounded-full">
                          <div
                            className="h-full bg-[#1A00FF] rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {breakdowns.country.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-neutral-500 font-light">
                        No geographic location data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
 );
};

export default AnalyticsPage;
