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
    if (lower === 'desktop') return <Monitor className="w-4 h-4 text-green-700" />;
    if (lower === 'mobile') return <Smartphone className="w-4 h-4 text-green-700" />;
    if (lower === 'tablet') return <Tablet className="w-4 h-4 text-green-700" />;
    return <Compass className="w-4 h-4 text-green-700" />;
  };

  const formatChangePill = (val) => {
    if (val === undefined || val === null || isNaN(val)) return null;
    if (val === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-500 rounded-full">
          0% change
        </span>
      );
    }
    const isPos = val > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 text-xs font-bold border rounded-full ${isPos ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
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
    <div className="space-y-8 pb-12 bg-white text-neutral-900 font-light">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <span>Analytics & Insights</span>
            <span className="px-3 py-1 bg-green-50 text-green-800 border border-green-200 text-xs font-bold uppercase tracking-wider rounded-full font-mono">
              Live Feed
            </span>
          </h1>
          <p className="text-sm font-light text-neutral-500 mt-1">Track visitor traffic, QR scans, device distributions, and referral sources in real time.</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Link Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-2 rounded-lg">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-neutral-900 focus:outline-none cursor-pointer pr-4 max-w-[180px] truncate"
            >
              <option value="all" className="bg-white text-neutral-900">All links (Aggregate)</option>
              {links.map(l => (
                <option key={l._id} value={l._id} className="bg-white text-neutral-900">
                  {l.title || l.slug} ({l.shortUrl})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center bg-white border border-neutral-200 p-1 rounded-lg">
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
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                    range === tab.id
                      ? 'bg-green-700 text-white'
                      : isLocked
                      ? 'text-neutral-400 cursor-not-allowed bg-neutral-100'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isLocked && <Crown className="w-3 h-3 text-amber-500 shrink-0" title="Core Pro Feature" />}
                </button>
              );
            })}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 font-semibold text-xs border border-neutral-200 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-green-700 animate-spin rounded-full" />
            ) : (
              <Download className="w-4 h-4 text-neutral-500" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {!isCorePlan && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Free Plan Limit: 7-Day Analytics Retention</div>
              <div className="text-xs font-light text-neutral-600 mt-0.5">
                You are currently viewing the last 7 days of analytical history. Upgrade to Core to unlock 30-day history, all-time aggregate data, and unlimited custom UTM campaigns!
              </div>
            </div>
          </div>
          <a
            href="/dashboard/billing"
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-all shrink-0 text-center"
          >
            Upgrade to Core
          </a>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-neutral-500 font-normal space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-green-700 animate-spin mx-auto rounded-full" />
          <div className="text-sm">Crunching analytics...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 font-medium text-center rounded-xl">
          {error}
        </div>
      ) : isEmpty ? (
        <div className="py-20 px-6 text-center bg-neutral-50 border border-dashed border-neutral-300 rounded-xl space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-green-700 text-white flex items-center justify-center mx-auto rounded-xl">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-1">No analytical data yet</h3>
            <p className="text-xs font-light text-neutral-500 max-w-sm mx-auto leading-relaxed">
              We haven't recorded any link clicks or QR code scans in this time period. Share your short URLs or physical QR flyers to see real-time traffic start flowing in!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setSelectedLinkId('all')}
              className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs border border-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filter to All Links
            </button>
            <button
              onClick={() => openCreateLinkModal()}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Link to Track</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 4 Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Total Clicks */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xl relative overflow-hidden group hover:border-green-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Link Clicks</span>
                <div className="w-10 h-10 bg-green-700 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MousePointerClick className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 font-mono mb-2">{overview.totalClicks || 0}</div>
              <div className="flex items-center justify-between">
                {formatChangePill(overview.clicksChange)}
                <span className="text-[11px] font-mono text-neutral-400">vs prior period</span>
              </div>
            </div>

            {/* 2. Total QR Scans */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xl relative overflow-hidden group hover:border-green-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total QR Scans</span>
                <div className="w-10 h-10 bg-green-700 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 font-mono mb-2">{overview.totalScans || 0}</div>
              <div className="flex items-center justify-between">
                {formatChangePill(overview.scansChange)}
                <span className="text-[11px] font-mono text-neutral-400">vs prior period</span>
              </div>
            </div>

            {/* 3. Unique Visitors */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xl relative overflow-hidden group hover:border-green-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Unique Visitors</span>
                <div className="w-10 h-10 bg-green-700 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 font-mono mb-2">{overview.uniqueVisitors || 0}</div>
              <div className="text-[11px] font-mono text-neutral-400 mt-2">Anonymized SHA-256 IP hashes</div>
            </div>

            {/* 4. Top Referrer */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xl relative overflow-hidden group hover:border-green-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Top Referrer</span>
                <div className="w-10 h-10 bg-green-700 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-2 truncate" title={overview.topReferrer || 'Direct'}>
                {overview.topReferrer || 'Direct'}
              </div>
              <div className="text-[11px] font-mono text-neutral-400 mt-2">Primary traffic source</div>
            </div>
          </div>

          {/* Main Time-Series Chart */}
          <div className="bg-white border border-neutral-200 p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-700" />
                  <span>Traffic Over Time</span>
                </h2>
                <p className="text-xs font-light text-neutral-500 mt-0.5">Daily breakdown comparing short link clicks against physical QR scans.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-700 inline-block rounded-full" />
                  <span className="text-neutral-700">Link Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-neutral-400 inline-block rounded-full" />
                  <span className="text-neutral-700">QR Scans</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#166534" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#166534" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827', fontSize: '12px' }}
                    itemStyle={{ fontWeight: '600' }}
                    labelStyle={{ color: '#166534', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="clicks" name="Link Clicks" stroke="#166534" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                  <Area type="monotone" dataKey="scans" name="QR Scans" stroke="#9CA3AF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Breakdown Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel 1: Device Breakdown */}
            <div className="bg-white border border-neutral-200 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-700" />
                  <span>Device Distribution</span>
                </h3>
                <p className="text-xs font-light text-neutral-500 mb-6">Visitor traffic segmented by operating device.</p>

                <div className="space-y-4">
                  {breakdowns.device.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize flex items-center gap-2 text-neutral-700">
                          {getDeviceIcon(item.name)}
                          <span>{item.name}</span>
                        </span>
                        <span className="text-green-700 font-mono">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-green-700 transition-all duration-500 rounded-full"
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
            <div className="bg-white border border-neutral-200 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-green-700" />
                  <span>Browser Share</span>
                </h3>
                <p className="text-xs font-light text-neutral-500 mb-6">Top browsers used by your visitors.</p>

                <div className="space-y-4">
                  {breakdowns.browser.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-neutral-700">{item.name}</span>
                        <span className="text-green-700 font-mono">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-green-700 transition-all duration-500 rounded-full"
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
            <div className="bg-white border border-neutral-200 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-green-700" />
                  <span>Top Referring Sources</span>
                </h3>
                <p className="text-xs font-light text-neutral-500 mb-6">Where your clicks and scans originated from.</p>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {breakdowns.referrer.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 text-xs rounded-lg">
                      <span className="text-neutral-700 font-semibold truncate max-w-[160px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-green-700">
                        <span>{item.count}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">({item.percentage}%)</span>
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

          {/* Location / Country Breakdown Table */}
          <div className="bg-white border border-neutral-200 p-6 rounded-xl">
            <h3 className="text-base font-bold text-neutral-900 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-700" />
              <span>Geographic Location Breakdown</span>
            </h3>
            <p className="text-xs font-light text-neutral-500 mb-6">Visitor distribution by country (identified via cloud edge headers).</p>

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
                      <td className="py-3.5 px-4 font-semibold text-neutral-900 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-[11px] font-mono font-bold uppercase text-green-700 rounded-md">
                          {item.name === 'Unknown' ? '??' : item.name.substring(0, 3)}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">{item.count}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-green-700">{item.percentage}%</td>
                      <td className="py-3.5 px-4">
                        <div className="w-full h-2 bg-neutral-200 overflow-hidden rounded-full">
                          <div
                            className="h-full bg-green-700 rounded-full"
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
