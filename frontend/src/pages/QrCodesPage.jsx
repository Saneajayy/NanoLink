import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useOutletContext, Link } from 'react-router-dom';
import { 
 QrCode, 
 Search, 
 Plus, 
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
import StyledQRCode from '../components/common/StyledQRCode';

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
    window.addEventListener('nanolink_data_change', fetchQrCodes);
    return () => window.removeEventListener('nanolink_data_change', fetchQrCodes);
  }, [fetchQrCodes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

 const handleSearchSubmit = (e) => {
 e.preventDefault();
 setPage(1);
 setSearch(searchInput.trim());
 };

 const handleSortChange = (e) => {
 setSort(e.target.value);
 setPage(1);
 };

 const handleDownloadPng = (imageUrl, slug, id) => {
    const svgEl = id ? (document.querySelector(`#gallery-qr-svg-${id} svg`) || document.getElementById(`gallery-qr-svg-${id}`)) : null;
    if (svgEl) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1200, 1200);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `nanolink-${slug || 'qr'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = url;
    } else if (imageUrl) {
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

 const maxQrs = isCorePlan ? 50 : 10;
 const currentQrCount = user?.monthlyQrCodeCount || 0;
 const isNearOrAtLimit = currentQrCount >= maxQrs * 0.8;

 return (
  <div className="space-y-6 bg-white font-light">
    {/* Header per Section 6.7 */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">QR Codes</h1>
          <span className="px-3 py-1 bg-[#FF6206] text-white text-xs font-medium rounded-sm shadow-sm">
            {total} active QR {total === 1 ? 'code' : 'codes'}
          </span>
        </div>
        <p className="text-sm font-light text-neutral-600 mt-1">Design, customize, and export high-resolution QR codes linked to your short URLs.</p>
      </div>

      <button
        onClick={() => openCreateQrModal()}
        className="px-5 py-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create QR Code</span>
      </button>
    </div>

    {/* Contextual Upgrade Prompt Banner */}
    {isNearOrAtLimit && !isCorePlan && (
      <div className="p-4 bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6206] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-black">
              {currentQrCount >= maxQrs ? '⚠️ Free Plan Monthly QR Code Quota Exceeded!' : '⚡ Approaching Your Free Plan Monthly QR Quota'}
            </div>
            <div className="text-xs font-light text-neutral-700 mt-0.5">
              You have used <strong className="text-[#FF6206] font-mono font-semibold">{currentQrCount} of {maxQrs}</strong> QR codes this month. Upgrade to Core for 50 vector QR codes and branded logos!
            </div>
          </div>
        </div>
        <Link
          to="/dashboard/billing"
          className="px-4 py-2 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Upgrade Now</span>
        </Link>
      </div>
    )}

    {/* Search & Filter Bar per Section 6.7 */}
    <div className="p-4 bg-white border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2 bg-white px-3.5 py-2.5 border border-neutral-200 focus-within:border-neutral-400 transition-colors">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title or destination URL..."
          className="w-full bg-transparent border-none text-black placeholder-neutral-400 text-sm font-normal focus:outline-none focus:ring-0"
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            className="text-xs font-medium text-[#FF6206] hover:underline px-1"
          >
            Clear
          </button>
        )}
      </form>

      <div className="w-full md:w-auto flex items-center gap-3 justify-end">
        <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 border border-neutral-200 text-sm text-black">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="text-xs font-medium text-neutral-500">Sort by:</span>
          <select
            value={sort}
            onChange={handleSortChange}
            className="bg-transparent border-none text-black text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="-createdAt" className="bg-white text-black">Newest first</option>
            <option value="createdAt" className="bg-white text-black">Oldest first</option>
          </select>
        </div>
      </div>
    </div>

    {/* QR Code Gallery Grid Layout per Section 6.7 (3-4 cols desktop, 2 tablet, 1 mobile) */}
    {loading ? (
      <div className="py-20 text-center text-neutral-500 font-normal space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-black animate-spin mx-auto rounded-full" />
        <div className="text-sm">Loading QR codes...</div>
      </div>
    ) : qrCodes.length === 0 ? (
      /* Empty State per Section 6.7 */
      <div className="py-16 px-6 text-center bg-neutral-50 border border-dashed border-neutral-300 space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-[#FF6206] text-white flex items-center justify-center mx-auto shadow-sm">
          <QrCode className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black mb-1">
            {search ? 'No matching QR codes found' : 'No QR codes created yet'}
          </h3>
          <p className="text-xs font-light text-neutral-600 max-w-sm mx-auto">
            {search
              ? `We couldn't find any QR codes matching "${search}". Try adjusting your keyword or clearing filters.`
              : 'Generate high-resolution, scannable QR codes for menus, event flyers, and physical marketing campaigns.'}
          </p>
        </div>
        {search ? (
          <button
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            className="px-5 py-2.5 bg-[#FF6206] text-white font-medium text-xs shadow-sm transition-colors"
          >
            Clear Search Filter
          </button>
        ) : (
          <button
            onClick={() => openCreateQrModal()}
            className="px-6 py-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-sm shadow-sm transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your First QR Code</span>
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {qrCodes.map((qr) => {
          const linkObj = (qr && qr.linkId && typeof qr.linkId === 'object' && !Array.isArray(qr.linkId)) ? qr.linkId : null;
          const link = linkObj || {
            originalUrl: qr?.destinationUrl || 'https://nano.link',
            title: qr?.title || 'Static QR Code',
            slug: 'static',
            totalClicks: qr?.totalScans || 0,
            shortUrl: qr?.destinationUrl || 'https://nano.link'
          };
          const clicks = link.totalClicks || 0;

          return (
            <div
              key={qr._id}
              className="bg-white hover:bg-neutral-50 border border-neutral-200 p-5 flex flex-col justify-between transition-all duration-200 group shadow-sm hover:border-neutral-300"
            >
              <div>
                {/* Title & Scans Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h3 className="font-semibold text-black text-sm truncate flex-1" title={link.title || link.slug}>
                    {link.title || link.slug || 'QR Code'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-xs font-semibold text-[#FF6206] shrink-0">
                    <MousePointerClick className="w-3 h-3" />
                    <span>{clicks}</span>
                  </span>
                </div>

                {/* QR Image Preview (large, centered, clear per Section 6.7) */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 mb-4 relative group/img flex items-center justify-center min-h-[250px] overflow-hidden shadow-inner">
                  <div className="w-full flex items-center justify-center my-auto transition-transform duration-300 group-hover/img:scale-105">
                    <StyledQRCode
                      id={`gallery-qr-svg-${qr._id}`}
                      value={link.shortUrl || link.originalUrl || 'https://nano.link'}
                      size={(qr.frame && qr.frame !== 'none') ? 140 : 160}
                      fgColor={qr.color || '#000000'}
                      pattern={qr.pattern}
                      cornerStyle={qr.cornerStyle}
                      frame={qr.frame}
                    />
                  </div>
                </div>

                <div className="text-[11px] font-light text-neutral-600 truncate mb-4" title={link.originalUrl}>
                  <span className="text-black font-medium mr-1">DEST:</span>
                  <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-[#1A00FF] font-mono hover:underline">{link.originalUrl}</a>
                </div>
              </div>

              {/* Action Buttons per Section 6.7 */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadPng(qr.imageUrl, link.slug, qr._id)}
                    className="py-2 px-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSvg(qr._id, link.slug)}
                    className="py-2 px-3 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>SVG</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditModalQr(qr)}
                    className="flex-1 py-2 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Styles</span>
                  </button>
                  <button
                    onClick={() => setDeleteModalQr(qr)}
                    title="Delete QR Code"
                    className="p-2 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white transition-all shrink-0 shadow-sm cursor-pointer"
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
      <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 shadow-sm">
        <div className="text-xs font-light text-neutral-600">
          Showing page <span className="font-semibold text-black">{page}</span> of <span className="font-semibold text-black">{pages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-white hover:bg-neutral-100 text-black border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 px-2">
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-xs font-medium transition-all ${
                  page === i + 1
                    ? 'bg-[#FF6206] text-white shadow-sm'
                    : 'bg-white text-black hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 bg-white hover:bg-neutral-100 text-black border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      onSuccess={() => {
        fetchQrCodes();
      }}
    />
  </div>
);
};

export default QrCodesPage;
