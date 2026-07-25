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
  AlertTriangle
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
  }, [fetchLinks]);

  // Handle Search Input submit / debounce
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const maxLinks = isCorePlan ? 100 : 50;
  const currentLinkCount = user?.monthlyLinkCount || 0;
  const isNearOrAtLimit = currentLinkCount >= maxLinks * 0.8;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Short Links</h1>
          <p className="text-sm text-slate-400 mt-1">Manage, organize, and monitor all your shortened destinations.</p>
        </div>
        <button
          onClick={() => openCreateLinkModal()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Link</span>
        </button>
      </div>

      {/* Contextual Upgrade Prompt Banner (Step 15) */}
      {isNearOrAtLimit && !isCorePlan && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {currentLinkCount >= maxLinks ? '⚠️ Free Plan Monthly Link Quota Exceeded!' : '⚡ Approaching Your Free Plan Monthly Quota'}
              </div>
              <div className="text-xs text-amber-200/80 mt-0.5">
                You have used <strong className="text-white font-mono">{currentLinkCount} of {maxLinks}</strong> links this month. Upgrade to Core for 100 links/mo and unlimited custom back-halves!
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

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 focus-within:border-indigo-500 transition-colors">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, alias, or URL..."
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
              <option value="-totalClicks" className="bg-slate-900">Most clicks</option>
              <option value="totalClicks" className="bg-slate-900">Least clicks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Link Card List per Section 6.5 */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm">Loading your links...</div>
        </div>
      ) : links.length === 0 ? (
        /* Empty State per Section 6.5 */
        <div className="py-16 px-6 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Link2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {search ? 'No matching links found' : 'No short links created yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? `We couldn't find any active links matching "${search}". Try adjusting your search term or clearing filters.`
                : 'Get started by creating your first branded short link to track clicks and share across campaigns.'}
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
              onClick={() => openCreateLinkModal()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
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
              className="p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all group hover:border-slate-700"
            >
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3
                    onClick={() => setEditModalLink(link)}
                    className="font-bold text-white text-base hover:text-indigo-400 cursor-pointer transition-colors truncate max-w-md"
                    title="Click to edit title or destination"
                  >
                    {link.title || link.slug}
                  </h3>
                  {link.customAlias && (
                    <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                      Custom Alias
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(link.createdAt)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800/80 w-fit max-w-full">
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm font-bold text-indigo-400 hover:underline flex items-center gap-1.5 truncate"
                  >
                    <span>{link.shortUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </a>
                  <div className="h-4 w-px bg-slate-800 mx-1" />
                  <button
                    onClick={() => handleCopy(link.shortUrl, link._id)}
                    title="Copy short link"
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
                  >
                    {copiedId === link._id ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-400 truncate max-w-2xl" title={link.originalUrl}>
                  <span className="text-slate-600 mr-1.5 font-semibold">DESTINATION:</span>
                  <span>{link.originalUrl}</span>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/80 shrink-0">
                {/* Click Count Pill per Section 6.5 */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                  <MousePointerClick className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-extrabold text-white text-base mr-1.5">{link.totalClicks || 0}</span>
                    <span className="text-xs text-slate-400 uppercase font-semibold">clicks</span>
                  </div>
                </div>

                {/* QR Code Icon Button per Section 6.5 */}
                <div>
                  {link.qrCodeId ? (
                    <Link
                      to={`/dashboard/qr-codes`}
                      title="View QR Code"
                      className="p-2.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 rounded-xl flex items-center gap-1.5 border border-orange-500/30 transition-all text-xs font-bold"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">QR Ready</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => openCreateQrModal()}
                      title="Generate QR Code"
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-1.5 border border-slate-800 transition-all text-xs font-medium"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">+ QR</span>
                    </button>
                  )}
                </div>

                {/* Action Menu (Edit / Delete) per Section 6.5 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditModalLink(link)}
                    title="Edit Title & Destination"
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModalLink(link)}
                    title="Delete Link"
                    className="p-2.5 bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls per Section 6.5 */}
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
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
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
        onSuccess={(deletedId) => {
          setLinks(prev => prev.filter(l => l._id !== deletedId));
          setTotal(t => Math.max(0, t - 1));
        }}
      />
    </div>
  );
};

export default LinksPage;
