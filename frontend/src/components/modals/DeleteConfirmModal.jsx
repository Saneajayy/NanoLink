import React, { useState } from 'react';
import axios from 'axios';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, link, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !link) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/links/${link._id}`);
      window.dispatchEvent(new Event('nanolink_data_change'));
      if (onSuccess) onSuccess(link._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete link.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-neutral-200 overflow-hidden my-8 shadow-xl rounded-md">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 border border-red-200 flex items-center justify-center rounded-full shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-black">Delete Short Link</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white font-light">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 font-medium text-xs rounded-sm">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
            <AlertTriangle className="w-5 h-5 text-[#FF6206] shrink-0 mt-0.5" />
            <div className="text-sm text-black font-normal leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-black">"{link.title || link.slug}"</span>?
              <p className="text-xs text-neutral-600 mt-1 font-light">
                This link (<code className="text-black font-mono font-medium">{link.shortUrl}</code>) will be disabled immediately and will no longer redirect visitors.
              </p>
            </div>
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
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium rounded-sm transition-all text-xs flex items-center gap-2 disabled:opacity-70 cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
