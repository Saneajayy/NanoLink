import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Crown, Sparkles, AlertCircle, Palette, Layout, Box, Square, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StyledQRCode from '../common/StyledQRCode';

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
      setDestinationUrl(qrCode.linkId?.originalUrl || qrCode.destinationUrl || '');
      setTitle(qrCode.linkId?.title || qrCode.title || '');
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
      window.dispatchEvent(new Event('nanolink_data_change'));
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update QR code.');
    } finally {
      setLoading(false);
    }
  };

  const previewValue = qrCode.linkId?.shortUrl || qrCode.destinationUrl || destinationUrl || 'https://nano.link/preview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-neutral-200 overflow-hidden my-8 shadow-xl rounded-md">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6206]/10 text-[#FF6206] flex items-center justify-center rounded-full shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black">Edit QR Code & Styling</h2>
              <p className="text-xs text-neutral-600 font-light">
                {qrCode.linkId ? (
                  <span>Associated with short link: <span className="font-mono text-black font-medium">{qrCode.linkId?.shortUrl}</span></span>
                ) : (
                  <span>Static Direct QR Code: <span className="font-mono text-black font-medium">{qrCode.destinationUrl}</span></span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto bg-white font-light">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 flex items-start gap-3 text-red-600 text-xs rounded-sm">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                Destination URL <span className="text-[#FF6206]">*</span>
              </label>
              <input
                type="text"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://example.com/menu"
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-black placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-black rounded-sm transition-all"
              />
              <p className="mt-1.5 text-xs text-neutral-500 font-light">
                Changing this URL dynamically updates where visitors are redirected when they scan this QR code!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                QR Code Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cafe Counter Menu QR"
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-black placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-black rounded-sm transition-all"
              />
            </div>

            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-sm space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#FF6206]" />
                  <span className="text-sm font-bold text-black">Color & Appearance</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-2.5">QR Foreground Color</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {['#000000', '#1A00FF', '#FF6206', '#FFFFFF'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-8 h-8 border rounded-sm transition-transform cursor-pointer ${color === col ? 'border-black ring-2 ring-black scale-110' : 'border-neutral-300 opacity-80 hover:opacity-100'}`}
                    />
                  ))}
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 bg-transparent border border-neutral-300 rounded-sm cursor-pointer overflow-hidden p-0"
                    />
                    <span className="text-[10px] font-mono font-semibold text-black ml-2 uppercase">{color}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-black flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-[#FF6206]" />
                    <span>Pattern Style</span>
                  </label>
                  {!isCorePlan && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase border border-amber-200 rounded-sm">
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
                      className={`p-3 border text-left rounded-sm transition-all cursor-pointer ${
                        pattern === pat.id
                          ? 'bg-[#FF6206] border-[#FF6206] text-white shadow-sm'
                          : 'bg-white border-neutral-200 text-black hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="text-xs font-bold">{pat.label}</div>
                      <div className={`text-[10px] mt-0.5 font-light ${pattern === pat.id ? 'text-white/90' : 'text-neutral-500'}`}>{pat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-200">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-[#FF6206]" />
                    <span>Corner Style</span>
                  </label>
                  <select
                    disabled={!isCorePlan}
                    value={cornerStyle}
                    onChange={(e) => setCornerStyle(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs text-black font-normal focus:border-black disabled:opacity-50"
                  >
                    <option value="square">Square Corners</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="dot">Dot Eyes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5 flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-[#FF6206]" />
                    <span>Frame Style</span>
                  </label>
                  <select
                    disabled={!isCorePlan}
                    value={frame}
                    onChange={(e) => setFrame(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-sm px-3 py-2 text-xs text-black font-normal focus:border-black disabled:opacity-50"
                  >
                    <option value="none">No Frame (Clean)</option>
                    <option value="scan-me">Scan Me Banner</option>
                    <option value="border">Structured Border</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3 bg-white">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium rounded-sm text-xs transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium rounded-sm text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
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
          </div>

          {/* Right Column: Live Preview Box */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-neutral-50 border border-neutral-200 rounded-sm relative overflow-hidden h-fit lg:sticky lg:top-6">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#FF6206] animate-pulse rounded-full" />
              <span>Live Preview</span>
            </div>

            <div className="p-5 bg-white border border-neutral-200 rounded-sm relative transition-all duration-300 transform hover:scale-105 shadow-sm">
              <StyledQRCode
                id="edit-form-preview-qr"
                value={previewValue}
                size={180}
                fgColor={color}
                pattern={pattern}
                cornerStyle={cornerStyle}
                frame={frame}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQrCodeModal;
