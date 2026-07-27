import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Edit3, AlertCircle, Sparkles, Lock } from 'lucide-react';

const EditLinkModal = ({ isOpen, onClose, link, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && link) {
      setTitle(link.title || '');
      setOriginalUrl(link.originalUrl || '');
      setError(null);
    }
  }, [isOpen, link]);

  if (!isOpen || !link) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl || !originalUrl.trim()) {
      setError('Destination URL is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.put(`/api/links/${link._id}`, {
        title: title.trim(),
        originalUrl: originalUrl.trim(),
      });
      window.dispatchEvent(new Event('nanolink_data_change'));
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-neutral-200 overflow-hidden my-8 shadow-xl rounded-md">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A00FF]/10 text-[#1A00FF] flex items-center justify-center rounded-full shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black">Edit Short Link</h2>
              <p className="text-xs text-neutral-600 font-light">Update destination URL and display title.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white font-light">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 flex items-start gap-3 text-red-600 text-xs rounded-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Read-Only Short Link Slug per Section 5 */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Short Link (Read-Only)</label>
              <span className="flex items-center gap-1 text-[11px] text-[#FF6206] font-medium">
                <Lock className="w-3 h-3" />
                <span>Alias permanent</span>
              </span>
            </div>
            <div className="font-mono text-sm font-semibold text-black select-all truncate">{link.shortUrl}</div>
            <p className="text-[11px] text-neutral-600 font-light">
              Per system policy (Section 5), back-half slugs cannot be modified after creation to prevent broken redirects.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
              Destination URL <span className="text-[#FF6206]">*</span>
            </label>
            <input
              type="text"
              required
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/new-destination"
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-black placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-black rounded-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
              Link Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spring Sale Page"
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-black placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-black rounded-sm transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium rounded-sm text-xs transition-colors cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium rounded-sm flex items-center gap-2 text-xs disabled:opacity-70 transition-all cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkModal;
