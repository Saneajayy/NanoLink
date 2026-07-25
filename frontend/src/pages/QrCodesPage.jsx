import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { 
  QrCode, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Download, 
  MousePointerClick, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';
import EditQrCodeModal from '../components/modals/EditQrCodeModal';
import DeleteQrConfirmModal from '../components/modals/DeleteQrConfirmModal';
import { QRCodeSVG } from 'qrcode.react';

const QrCodesPage = () => {
  const { user, isCorePlan } = useAuth();
  const { openCreateQrModal } = useOutletContext();

  const [qrCodes, setQrCodes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(12);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const [editModalQr, setEditModalQr] = useState(null);
  const [deleteModalQr, setDeleteModalQr] = useState(null);

  const fetchQrCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/qr?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${sort}`);
      setQrCodes(res.data.qrCodes || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch QR codes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  useEffect(() => {
    fetchQrCodes();
  }, [fetchQrCodes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPng = (imageUrl, slug) => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `nanolink-${slug || 'qr'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSvg = (id, slug) => {
    const svgEl = document.getElementById(`gallery-qr-svg-${id}`);
    if (svgEl) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nanolink-${slug || 'qr'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const maxQrs = isCorePlan ? 5 : 2;
  const currentQrCount = user?.monthlyQrCodeCount || 0;
  const isNearOrAtLimit = currentQrCount >= maxQrs * 0.8;

  return (
    <div className="space-y-6">
      {/* Header per Section 6.7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">QR Codes</h1>
            <span className="px-3 py-1 bg-orange-500/15 text-orange-400 border border-orange-500/25 rounded-full text-xs font-bold">
              {total} active QR {total === 1 ? 'code' : 'codes'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Design, customize, and export high-resolution QR codes linked to your short URLs.</p>
        </div>

        <button
          onClick={() => openCreateQrModal()}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create QR Code</span>
        </button>
      </div>

      {/* Contextual Upgrade Prompt Banner */}
      {isNearOrAtLimit && !isCorePlan && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {currentQrCount >= maxQrs ? '⚠️ Free Plan Monthly QR Code Quota Exceeded!' : '⚡ Approaching Your Free Plan Monthly QR Quota'}
              </div>
              <div className="text-xs text-amber-200/80 mt-0.5">
                You have used <strong className="text-white font-mono">{currentQrCount} of {maxQrs}</strong> QR codes this month. Upgrade to Core for 50 vector QR codes and branded logos!
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/billing"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Upgrade Now</span>
          </Link>
        </div>
      )}

      {/* Search & Filter Bar per Section 6.7 */}
      <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 focus-within:border-orange-500 transition-colors">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or destination URL..."
            className="w-full bg-transparent border-none text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="text-xs text-slate-500 hover:text-white px-1"
            >
              Clear
            </button>
          )}
        </form>

        <div className="w-full md:w-auto flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-300">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-400">Sort by:</span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="-createdAt" className="bg-slate-900">Newest first</option>
              <option value="createdAt" className="bg-slate-900">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* QR Code Gallery Grid Layout per Section 6.7 (3-4 cols desktop, 2 tablet, 1 mobile) */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm">Loading QR codes...</div>
        </div>
      ) : qrCodes.length === 0 ? (
        /* Empty State per Section 6.7 */
        <div className="py-16 px-6 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {search ? 'No matching QR codes found' : 'No QR codes created yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? `We couldn't find any QR codes matching "${search}". Try adjusting your keyword or clearing filters.`
                : 'Generate high-resolution, scannable QR codes for menus, event flyers, and physical marketing campaigns.'}
            </p>
          </div>
          {search ? (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Clear Search Filter
            </button>
          ) : (
            <button
              onClick={() => openCreateQrModal()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your First QR Code</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {qrCodes.map((qr) => {
            const link = qr.linkId || {};
            const clicks = link.totalClicks || 0;

            return (
              <div
                key={qr._id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg"
              >
                <div>
                  {/* Title & Scans Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h3 className="font-bold text-white text-sm truncate flex-1" title={link.title || link.slug}>
                      {link.title || link.slug || 'QR Code'}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-emerald-400 shrink-0">
                      <MousePointerClick className="w-3 h-3" />
                      <span>{clicks}</span>
                    </span>
                  </div>

                  {/* QR Image Preview (large, centered, clear per Section 6.7) */}
                  <div className="p-4 bg-white rounded-xl mb-4 relative group/img shadow-inner flex items-center justify-center min-h-[200px]">
                    <img
                      src={qr.imageUrl}
                      alt="QR Code"
                      className="w-44 h-44 mx-auto object-contain transition-transform duration-300 group-hover/img:scale-105"
                    />
                    {/* Invisible SVG for instant vector export */}
                    <div className="hidden">
                      <QRCodeSVG
                        id={`gallery-qr-svg-${qr._id}`}
                        value={link.shortUrl || link.originalUrl || 'https://nano.link'}
                        size={500}
                        fgColor={qr.color || '#000000'}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* Underlying short link (clickable, copies to clipboard) */}
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 mb-4">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs font-bold text-indigo-400 hover:underline truncate"
                    >
                      {link.shortUrl}
                    </a>
                    <button
                      onClick={() => handleCopy(link.shortUrl, qr._id)}
                      title="Copy short link"
                      className="p-1.5 text-slate-400 hover:text-white rounded transition-colors shrink-0"
                    >
                      {copiedId === qr._id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mb-4" title={link.originalUrl}>
                    <span className="text-slate-600 font-semibold mr-1">DEST:</span>
                    <span>{link.originalUrl}</span>
                  </div>
                </div>

                {/* Action Buttons per Section 6.7 */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownloadPng(qr.imageUrl, link.slug)}
                      className="py-2 px-3 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-indigo-500/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSvg(qr._id, link.slug)}
                      className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SVG</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditModalQr(qr)}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Styles</span>
                    </button>
                    <button
                      onClick={() => setDeleteModalQr(qr)}
                      title="Delete QR Code"
                      className="p-2 bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 hover:border-red-500/30 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">
            Showing page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{pages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === i + 1
                      ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditQrCodeModal
        isOpen={!!editModalQr}
        onClose={() => setEditModalQr(null)}
        qrCode={editModalQr}
        onSuccess={() => fetchQrCodes()}
      />

      <DeleteQrConfirmModal
        isOpen={!!deleteModalQr}
        onClose={() => setDeleteModalQr(null)}
        qrCode={deleteModalQr}
        onSuccess={(deletedId) => {
          setQrCodes(prev => prev.filter(q => q._id !== deletedId));
          setTotal(t => Math.max(0, t - 1));
        }}
      />
    </div>
  );
};

export default QrCodesPage;
