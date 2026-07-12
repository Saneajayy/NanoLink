import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: () => void;
}

const CreateLinkModal = ({ isOpen, onClose, onLinkCreated }: CreateLinkModalProps) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/links', {
        originalUrl,
        title,
        customAlias: customAlias || undefined,
      });
      toast.success('Link shortened successfully!');
      onLinkCreated();
      onClose();
      // Reset form
      setOriginalUrl('');
      setTitle('');
      setCustomAlias('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 text-left shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-900">Create New Link</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="originalUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="originalUrl"
              required
              className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="title"
              className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="My awesome marketing campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="customAlias" className="block text-sm font-medium text-slate-700 mb-1">
              Custom Back-half <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">
                {window.location.host}/r/
              </span>
              <input
                type="text"
                id="customAlias"
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="custom-name"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Leave blank to auto-generate a random shortcode.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLinkModal;
