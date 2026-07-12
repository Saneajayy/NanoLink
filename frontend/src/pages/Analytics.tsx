import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Copy, ExternalLink, QrCode, Download, MousePointerClick, Globe2, Smartphone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext) || {};
  const [link, setLink] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linkRes, analyticsRes, qrRes] = await Promise.all([
          api.get(`/links/${id}`),
          api.get(`/links/${id}/analytics?range=30d`),
          api.get(`/links/${id}/qr`)
        ]);
        setLink(linkRes.data);
        setAnalytics(analyticsRes.data);
        setQrCode(qrRes.data.qrCodeUrl);
      } catch (error) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchData();
    }
  }, [id, user]);

  if (loading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center">Loading analytics...</div>;
  }

  if (!link) return null;

  const shortUrl = `${window.location.host}/r/${link.slug}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <RouterLink to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </RouterLink>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{link.title || 'Untitled Link'}</h1>
            <div className="flex items-center gap-3 text-lg font-medium text-indigo-600 mb-3">
              {shortUrl}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.protocol}//${shortUrl}`);
                  toast.success('Copied!');
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="truncate max-w-md">{link.originalUrl}</span>
              <a href={link.originalUrl} target="_blank" rel="noreferrer" className="hover:text-slate-900">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {qrCode && (
            <div className="flex flex-col items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <img src={qrCode} alt="QR Code" className="w-24 h-24" />
              </div>
              <a 
                href={qrCode}
                download={`qr-${link.slug}.png`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                <Download className="h-4 w-4" />
                Download QR
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-indigo-600" />
              Clicks Over Time (Last 30 Days)
            </h3>
            <div className="h-72">
              {analytics?.clicksOverTime?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.clicksOverTime}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      labelStyle={{color: '#64748b', marginBottom: '0.25rem'}}
                    />
                    <Line type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No click data available yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-indigo-600" />
              Top Referrers
            </h3>
            <div className="space-y-4">
              {analytics?.referrers?.length > 0 ? analytics.referrers.map((ref: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-600 truncate mr-4">{ref._id === 'direct' ? 'Direct / Unknown' : ref._id}</span>
                  <span className="font-semibold text-slate-900">{ref.count}</span>
                </div>
              )) : (
                <div className="text-sm text-slate-500">No referrer data.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-indigo-600" />
              Devices
            </h3>
            <div className="space-y-4">
              {analytics?.devices?.length > 0 ? analytics.devices.map((dev: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-600 capitalize">{dev._id}</span>
                  <span className="font-semibold text-slate-900">{dev.count}</span>
                </div>
              )) : (
                <div className="text-sm text-slate-500">No device data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
