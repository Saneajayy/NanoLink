import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
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
  Plus
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [range, setRange] = useState('7d');
  const [selectedLinkId, setSelectedLinkId] = useState('all');
  const [exporting, setExporting] = useState(false);

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
    if (lower === 'desktop') return <Monitor className="w-4 h-4 text-indigo-400" />;
    if (lower === 'mobile') return <Smartphone className="w-4 h-4 text-orange-400" />;
    if (lower === 'tablet') return <Tablet className="w-4 h-4 text-emerald-400" />;
    return <Compass className="w-4 h-4 text-slate-400" />;
  };

  const formatChangePill = (val) => {
    if (val === undefined || val === null || isNaN(val)) return null;
    if (val === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400">
          0% change
        </span>
      );
    }
    const isPos = val > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${isPos ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
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
    <div className="space-y-8 pb-12">
      {/* Header per Section 6.9 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Analytics & Insights</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 text-xs font-bold uppercase tracking-wider">
              Live Feed
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track visitor traffic, QR scans, device distributions, and referral sources in real time.</p>
        </div>

        {/* Action Controls: Date Range Picker & CSV Export Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Link Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer pr-4 max-w-[180px] truncate"
            >
              <option value="all" className="bg-slate-900">All links (Aggregate)</option>
              {links.map(l => (
                <option key={l._id} value={l._id} className="bg-slate-900">
                  {l.title || l.slug} ({l.shortUrl})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {[
              { id: '7d', label: 'Last 7 days' },
              { id: '30d', label: 'Last 30 days' },
              { id: 'all', label: 'All time' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button per Section 6.9 */}
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-indigo-400" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm">Crunching analytics...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-center">
          {error}
        </div>
      ) : isEmpty ? (
        /* Empty State per Section 6.9 */
        <div className="py-20 px-6 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">No analytical data yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We haven't recorded any link clicks or QR code scans in this time period. Share your short URLs or physical QR flyers to see real-time traffic start flowing in!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setSelectedLinkId('all')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Reset Filter to All Links
            </button>
            <button
              onClick={() => openCreateLinkModal()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Link Clicks</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MousePointerClick className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">{overview.totalClicks || 0}</div>
              <div className="flex items-center justify-between">
                {formatChangePill(overview.clicksChange)}
                <span className="text-[11px] text-slate-500">vs prior period</span>
              </div>
            </div>

            {/* 2. Total QR Scans */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total QR Scans</span>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">{overview.totalScans || 0}</div>
              <div className="flex items-center justify-between">
                {formatChangePill(overview.scansChange)}
                <span className="text-[11px] text-slate-500">vs prior period</span>
              </div>
            </div>

            {/* 3. Unique Visitors */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unique Visitors</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-2">{overview.uniqueVisitors || 0}</div>
              <div className="text-[11px] text-slate-500 mt-2">Anonymized SHA-256 IP hashes per Section 3</div>
            </div>

            {/* 4. Top Referrer */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Referrer</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white mb-2 truncate" title={overview.topReferrer || 'Direct'}>
                {overview.topReferrer || 'Direct'}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Primary source of incoming traffic</div>
            </div>
          </div>

          {/* Main Time-Series Chart (Clicks vs. Scans) per Section 6.9 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>Traffic Over Time</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Daily breakdown comparing short link clicks against physical QR scans.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                  <span className="text-slate-300">Link Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" />
                  <span className="text-slate-300">QR Scans</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="clicks" name="Link Clicks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                  <Area type="monotone" dataKey="scans" name="QR Scans" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Breakdown Panels (Grid below main chart) per Section 6.9 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel 1: Device Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-indigo-400" />
                  <span>Device Distribution</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Visitor traffic segmented by operating device.</p>

                <div className="space-y-4">
                  {breakdowns.device.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize flex items-center gap-2 text-slate-200">
                          {getDeviceIcon(item.name)}
                          <span>{item.name}</span>
                        </span>
                        <span className="text-slate-400 font-mono">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {breakdowns.device.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-6">No device data recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 2: Browser Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-400" />
                  <span>Browser Share</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Top browsers used by your visitors.</p>

                <div className="space-y-4">
                  {breakdowns.browser.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-200">{item.name}</span>
                        <span className="text-slate-400 font-mono">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {breakdowns.browser.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-6">No browser data recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel 3: Referrer Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Top Referring Sources</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Where your clicks and scans originated from.</p>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {breakdowns.referrer.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                      <span className="text-white font-medium truncate max-w-[160px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                        <span>{item.count}</span>
                        <span className="text-[10px] text-slate-500">({item.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                  {breakdowns.referrer.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-6">No referrer data recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location / Country Breakdown Table per Section 6.9 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Geographic Location Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">Visitor distribution by country (identified via cloud edge headers).</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Country / Region</th>
                    <th className="py-3 px-4 text-right">Total Visits</th>
                    <th className="py-3 px-4 text-right">Share (%)</th>
                    <th className="py-3 px-4 w-48">Traffic Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {breakdowns.country.map((item) => (
                    <tr key={item.name} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono uppercase text-indigo-300">
                          {item.name === 'Unknown' ? '??' : item.name.substring(0, 3)}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">{item.count}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">{item.percentage}%</td>
                      <td className="py-3.5 px-4">
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {breakdowns.country.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
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
