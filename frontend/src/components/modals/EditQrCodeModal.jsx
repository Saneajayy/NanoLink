import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Crown, Sparkles, AlertCircle, Palette, Layout, Box, Square, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const EditQrCodeModal = ({ isOpen, onClose, qrCode, onSuccess }) => {
  const { user, isCorePlan } = useAuth();

  const [destinationUrl, setDestinationUrl] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#000000');
  const [pattern, setPattern] = useState('squares');
  const [cornerStyle, setCornerStyle] = useState('square');
  const [frame, setFrame] = useState('none');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && qrCode) {
      setDestinationUrl(qrCode.linkId?.originalUrl || '');
      setTitle(qrCode.linkId?.title || '');
      setColor(qrCode.color || '#000000');
      setPattern(qrCode.pattern || 'squares');
      setCornerStyle(qrCode.cornerStyle || 'square');
      setFrame(qrCode.frame || 'none');
      setError(null);
    }
  }, [isOpen, qrCode]);

  if (!isOpen || !qrCode) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destinationUrl || !destinationUrl.trim()) {
      setError('Please provide a destination URL.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        destinationUrl: destinationUrl.trim(),
        title: title.trim(),
        color,
        pattern: isCorePlan ? pattern : undefined,
        cornerStyle: isCorePlan ? cornerStyle : undefined,
        frame: isCorePlan ? frame : undefined,
      };

      const res = await axios.put(`/api/qr/${qrCode._id}`, payload);
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update QR code.');
    } finally {
      setLoading(false);
    }
  };

  const previewValue = qrCode.linkId?.shortUrl || destinationUrl || 'https://nano.link/preview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
        
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit QR Code & Styling</h2>
              <p className="text-xs text-slate-400">
                Associated with short link: <span className="font-mono text-indigo-400">{qrCode.linkId?.shortUrl}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Destination URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://example.com/menu"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Changing this URL dynamically updates where visitors are redirected when they scan this QR code!
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                QR Code Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cafe Counter Menu QR"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold text-white">Color & Appearance</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2.5">QR Foreground Color</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {['#000000', '#0D8BFF', '#4F46E5', '#FF6B2C', '#10B981', '#EC4899', '#8B5CF6'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${color === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`}
                    />
                  ))}
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-full bg-transparent border-0 cursor-pointer overflow-hidden p-0"
                    />
                    <span className="text-[10px] font-mono text-slate-400 ml-2 uppercase">{color}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pattern Style</span>
                  </label>
                  {!isCorePlan && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase border border-amber-500/30">
                      <Crown className="w-3 h-3" />
                      <span>Core Only</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'squares', label: 'Squares', desc: 'Classic grid' },
                    { id: 'dots', label: 'Dots', desc: 'Modern circular' },
                    { id: 'rounded', label: 'Rounded', desc: 'Smooth curves' }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      disabled={!isCorePlan && pat.id !== 'squares'}
                      onClick={() => setPattern(pat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        pattern === pat.id
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="text-xs font-bold">{pat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{pat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Corner Style</span>
                  </label>
                  <select
                    disabled={!isCorePlan}
                    value={cornerStyle}
                    onChange={(e) => setCornerStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="square">Square Corners</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="dot">Dot Eyes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Frame Style</span>
                  </label>
                  <select
                    disabled={!isCorePlan}
                    value={frame}
                    onChange={(e) => setFrame(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="none">No Frame (Clean)</option>
                    <option value="scan-me">Scan Me Banner</option>
                    <option value="border">Structured Border</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Preview Box */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800/80 rounded-2xl relative overflow-hidden h-fit lg:sticky lg:top-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Preview</span>
            </div>

            <div className="p-5 bg-white rounded-2xl shadow-2xl relative transition-all duration-300 transform hover:scale-105">
              {frame === 'scan-me' && (
                <div className="bg-gradient-to-r from-indigo-600 to-orange-500 text-white text-[11px] font-extrabold uppercase tracking-wider py-1.5 px-4 text-center rounded-t-lg -mt-3 -mx-3 mb-3 shadow">
                  Scan Me
                </div>
              )}

              <div className={`p-2 bg-white ${frame === 'border' ? 'border-4 border-slate-800 rounded-xl' : ''}`}>
                <QRCodeSVG
                  value={previewValue}
                  size={180}
                  fgColor={color}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQrCodeModal;
