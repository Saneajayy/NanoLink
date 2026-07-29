import React, { useState } from 'react';
import axios from 'axios';
import { X, Trash2, AlertTriangle, Info } from 'lucide-react';

const DeleteQrConfirmModal = ({ isOpen, onClose, qrCode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !qrCode) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/qr/${qrCode._id}`);
      window.dispatchEvent(new Event('nanolink_data_change'));
      if (onSuccess) onSuccess(qrCode._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete QR code.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-neutral-200 overflow-hidden my-8 shadow-2xl rounded-xl text-neutral-900 animate-in zoom-in duration-200">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-700 border border-red-200 flex items-center justify-center rounded-lg shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Delete QR Code?</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white font-light">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-medium text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-700 font-normal leading-relaxed">
              Are you sure you want to delete the QR code for <span className="font-bold text-neutral-900">"{qrCode.linkId?.title || qrCode.linkId?.slug || qrCode.title || qrCode.destinationUrl || 'this link'}"</span>?
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 font-light">
            <Info className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
            {qrCode.linkId ? (
              <span>
                This will <span className="font-bold text-neutral-900 underline">not</span> delete the underlying short link (<code className="font-mono font-bold text-green-700">{qrCode.linkId?.shortUrl}</code>), only the QR code styling and scan tracking.
              </span>
            ) : (
              <span>
                This will permanently delete this static direct QR code (<code className="font-mono font-bold text-green-700">{qrCode.destinationUrl}</code>).
              </span>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-neutral-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete QR Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteQrConfirmModal;
