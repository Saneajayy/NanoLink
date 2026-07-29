import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Link2, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  QrCode, 
  Calendar, 
  MousePointerClick, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Zap,
  AlertTriangle,
  Download
} from 'lucide-react';
import EditLinkModal from '../components/modals/EditLinkModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

const LinksPage = () => {
  const { user, isCorePlan } = useAuth();
  const { openCreateLinkModal, openCreateQrModal } = useOutletContext();

  const [links, setLinks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const [editModalLink, setEditModalLink] = useState(null);
  const [deleteModalLink, setDeleteModalLink] = useState(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/links?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${sort}`);
      setLinks(res.data.links || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  useEffect(() => {
    fetchLinks();
    window.addEventListener('nanolink_data_change', fetchLinks);
    return () => window.removeEventListener('nanolink_data_change', fetchLinks);
  }, [fetchLinks]);

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

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = async (link) => {
    let imageUrl = link.qrCodeId?.imageUrl;
    if (!imageUrl && typeof link.qrCodeId === 'string') {
      try {
        const res = await axios.get(`/api/qr/${link.qrCodeId}`);
        imageUrl = res.data?.imageUrl;
      } catch (err) {}
    }
    if (!imageUrl && (link.createdFromQr || link._id)) {
      try {
        const res = await axios.get(`/api/qr?search=${link.shortUrl || link.slug}`);
        const matching = res.data?.qrCodes?.find(q => q.linkId?._id === link._id || q.linkId === link._id || q.destinationUrl === link.originalUrl);
        if (matching?.imageUrl) {
          imageUrl = matching.imageUrl;
        }
      } catch (err) {}
    }
    if (!imageUrl) {
      openCreateQrModal(link);
      return;
    }
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `nanolink-${link.slug || 'qr'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const maxLinks = isCorePlan ? 100 : 50;
  const currentLinkCount = user?.monthlyLinkCount || 0;
  const isNearOrAtLimit = currentLinkCount >= maxLinks * 0.8;

  return (
    <div className="space-y-6 bg-white text-neutral-900 font-light pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Short Links</h1>
            <span className="px-3 py-1 bg-green-50 text-green-800 border border-green-200 text-xs font-semibold rounded-full font-mono">
              {total} active {total === 1 ? 'link' : 'links'}
            </span>
          </div>
          <p className="text-sm font-light text-neutral-500 mt-1">Manage, organize, and monitor all your shortened destinations.</p>
        </div>
        <button
          onClick={() => openCreateLinkModal()}
          className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Link</span>
        </button>
      </div>

      {/* Contextual Upgrade Prompt Banner */}
      {isNearOrAtLimit && !isCorePlan && (
        <div className="p-4 bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900">
                {currentLinkCount >= maxLinks ? 'Free Plan Monthly Link Quota Exceeded!' : 'Approaching Your Free Plan Monthly Quota'}
              </div>
              <div className="text-xs font-light text-neutral-600 mt-0.5">
                You have used <strong className="text-amber-700 font-mono font-semibold">{currentLinkCount} of {maxLinks}</strong> links this month. Upgrade to Core for 100 links/mo and unlimited custom back-halves!
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/billing"
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Upgrade Now</span>
          </Link>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2 bg-neutral-50 px-4 py-2.5 border border-neutral-200 rounded-lg focus-within:border-green-700 transition-colors">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, alias, or URL..."
            className="w-full bg-transparent border-none text-neutral-900 placeholder-neutral-400 text-sm font-normal focus:outline-none focus:ring-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="text-xs font-semibold text-green-700 hover:underline px-1"
            >
              Clear
            </button>
          )}
        </form>

        <div className="w-full md:w-auto flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-700">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="text-xs font-semibold text-neutral-500">Sort by:</span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="bg-transparent border-none text-neutral-900 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="-createdAt" className="bg-white text-neutral-900">Newest first</option>
              <option value="createdAt" className="bg-white text-neutral-900">Oldest first</option>
              <option value="-totalClicks" className="bg-white text-neutral-900">Most clicks</option>
              <option value="totalClicks" className="bg-white text-neutral-900">Least clicks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Link Card List */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 font-normal space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-green-700 animate-spin mx-auto rounded-full" />
          <div className="text-sm">Loading your links...</div>
        </div>
      ) : links.length === 0 ? (
        <div className="py-16 px-6 text-center bg-neutral-50 border border-dashed border-neutral-300 rounded-xl space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-green-700 text-white flex items-center justify-center mx-auto rounded-xl">
            <Link2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              {search ? 'No matching links found' : 'No short links created yet'}
            </h3>
            <p className="text-xs font-light text-neutral-500 max-w-sm mx-auto">
              {search
                ? `We couldn't find any active links matching "${search}". Try adjusting your search term or clearing filters.`
                : 'Get started by creating your first branded short link to track clicks and share across campaigns.'}
            </p>
          </div>
          {search ? (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Clear Search Filter
            </button>
          ) : (
            <button
              onClick={() => openCreateLinkModal()}
              className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Link</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link._id}
              className="p-5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all group hover:border-green-700"
            >
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3
                    onClick={() => setEditModalLink(link)}
                    className="font-bold text-neutral-900 text-base hover:text-green-700 cursor-pointer transition-colors truncate max-w-md"
                    title="Click to edit title or destination"
                  >
                    {link.title || link.slug}
                  </h3>
                  {link.customAlias && (
                    <span className="px-2.5 py-0.5 bg-green-100 border border-green-200 text-green-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Custom Alias
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-light text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(link.createdAt)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-neutral-50 px-3.5 py-2 border border-neutral-200 rounded-lg w-fit max-w-full">
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm font-semibold text-green-700 hover:text-green-800 hover:underline flex items-center gap-1.5 truncate"
                  >
                    <span>{link.shortUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </a>
                  <div className="h-4 w-px bg-neutral-300 mx-1" />
                  <button
                    onClick={() => handleCopy(link.shortUrl, link._id)}
                    title="Copy short link"
                    className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors shrink-0 flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    {copiedId === link._id ? (
                      <span className="text-green-700 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-xs font-light text-neutral-500 truncate max-w-2xl" title={link.originalUrl}>
                  <span className="text-neutral-700 mr-1.5 font-semibold">DESTINATION:</span>
                  <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-green-700 font-mono hover:underline">{link.originalUrl}</a>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-200 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <MousePointerClick className="w-4 h-4 text-green-700" />
                  <div>
                    <span className="font-bold text-neutral-900 text-base font-mono mr-1.5">{link.totalClicks || 0}</span>
                    <span className="text-xs text-neutral-500 uppercase font-normal font-mono">clicks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(link.qrCodeId || link.createdFromQr) ? (
                    <button
                      onClick={() => handleDownloadQr(link)}
                      title="Download QR Code PNG"
                      className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 rounded-lg cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download QR</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openCreateQrModal(link)}
                      title="Create QR Code for this Link"
                      className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 rounded-lg cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">+ Create QR</span>
                    </button>
                  )}
                  <button
                    onClick={() => setEditModalLink(link)}
                    title="Edit Title & Destination"
                    className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors border border-neutral-200 rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModalLink(link)}
                    title="Delete Link"
                    className="p-2.5 bg-neutral-100 hover:bg-red-600 text-neutral-600 hover:text-white transition-all border border-neutral-200 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl">
          <div className="text-xs font-light text-neutral-500">
            Showing page <span className="font-semibold text-neutral-900">{page}</span> of <span className="font-semibold text-neutral-900">{pages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
                    page === i + 1
                      ? 'bg-green-700 text-white'
                      : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditLinkModal
        isOpen={!!editModalLink}
        onClose={() => setEditModalLink(null)}
        link={editModalLink}
        onSuccess={() => fetchLinks()}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModalLink}
        onClose={() => setDeleteModalLink(null)}
        link={deleteModalLink}
        onSuccess={() => {
          fetchLinks();
        }}
      />
    </div>
  );
};

export default LinksPage;
