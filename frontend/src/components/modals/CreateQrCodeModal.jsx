import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Crown, Sparkles, AlertCircle, CheckCircle2, Download, ExternalLink, Sliders, Palette, Layout, Box, Square } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

const CreateQrCodeModal = ({ isOpen, onClose, initialLink = null, onSuccess }) => {
  const { user, isCorePlan } = useAuth();
  const navigate = useNavigate();

  const [destinationUrl, setDestinationUrl] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#000000');
  const [pattern, setPattern] = useState('squares');
  const [cornerStyle, setCornerStyle] = useState('square');
  const [frame, setFrame] = useState('none');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [createdQr, setCreatedQr] = useState(null);
  const [createdLink, setCreatedLink] = useState(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      if (initialLink) {
        setDestinationUrl(initialLink.originalUrl || '');
        setTitle(`QR for ${initialLink.title || initialLink.slug}`);
      } else {
        setDestinationUrl('');
        setTitle('');
      }
      setColor('#000000');
      setPattern('squares');
      setCornerStyle('square');
      setFrame('none');
      setError(null);
      setIsQuotaError(false);
      setCreatedQr(null);
      setCreatedLink(null);
    }
  }, [isOpen, initialLink]);

  if (!isOpen) return null;

  const qrCodesUsed = user?.monthlyQrCodeCount || 0;
  const qrCodesLimit = isCorePlan ? 5 : 2;
  const qrCodesRemaining = Math.max(0, qrCodesLimit - qrCodesUsed);
  const isDisabled = qrCodesRemaining <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destinationUrl || !destinationUrl.trim()) {
      setError('Please provide a destination URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsQuotaError(false);

    try {
      const payload = {
        destinationUrl: destinationUrl.trim(),
        title: title.trim() || `QR for ${destinationUrl.trim().replace(/^https?:\/\//i, '').substring(0, 30)}`,
        color,
        pattern: isCorePlan ? pattern : undefined,
        cornerStyle: isCorePlan ? cornerStyle : undefined,
        frame: isCorePlan ? frame : undefined,
        linkId: initialLink?._id || undefined
      };

      const res = await axios.post('/api/qr', payload);
      setCreatedQr(res.data.qrCode);
      setCreatedLink(res.data.link);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === 'QUOTA_EXCEEDED') {
        setIsQuotaError(true);
      }
      setError(errData?.message || errData?.error || 'Failed to generate QR code.');
    } finally {
      setLoading(false);
    }
  };

  // Download helpers
  const handleDownloadPng = () => {
    if (createdQr?.imageUrl) {
      const link = document.createElement('a');
      link.href = createdQr.imageUrl;
      link.download = `nanolink-${createdLink?.slug || 'qr'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('preview-qr-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nanolink-${createdLink?.slug || 'qr'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewValue = initialLink?.shortUrl || (destinationUrl.trim() ? (destinationUrl.startsWith('http') ? destinationUrl : `https://${destinationUrl}`) : 'https://nano.link/preview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top orange gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialLink ? `Create QR for "${initialLink.title || initialLink.slug}"` : 'Create Standalone QR Code'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialLink ? `Associated with short link: ${initialLink.shortUrl}` : 'Automatically generates an underlying trackable short link per Section 5.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdQr ? (
          /* Success View */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">QR Code Ready!</h3>
              <p className="text-sm text-slate-400">
                Linked to <a href={createdLink?.shortUrl} target="_blank" rel="noreferrer" className="text-indigo-400 font-mono underline">{createdLink?.shortUrl}</a>
              </p>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl inline-block shadow-2xl">
              <img src={createdQr.imageUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-xl bg-white p-4 shadow-md" />
              {/* Hidden SVG for SVG download export */}
              <div className="hidden">
                <QRCodeSVG
                  id="preview-qr-svg"
                  value={createdLink?.shortUrl || destinationUrl}
                  size={500}
                  fgColor={createdQr.color}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleDownloadPng}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG (High-Res)</span>
              </button>
              <button
                onClick={handleDownloadSvg}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector (SVG)</span>
              </button>
              <button onClick={onClose} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-semibold rounded-xl transition-colors">
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Rich Two-Column Layout per Section 6.8 */
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">{isQuotaError ? 'Plan Limit Reached' : 'Error'}</div>
                    <div>{error}</div>
                    {isQuotaError && (
                      <button
                        type="button"
                        onClick={() => { onClose(); navigate('/dashboard/billing'); }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-lg shadow"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Upgrade to Core Now</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Destination URL Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Destination URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!initialLink}
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://example.com/menu"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
                {initialLink && (
                  <p className="mt-1.5 text-xs text-indigo-400 flex items-center gap-1 font-mono">
                    <span>Locked to existing short link: {initialLink.shortUrl}</span>
                  </p>
                )}
              </div>

              {/* Title Field */}
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

              {/* Styling Controls Section */}
              <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-white">Color & Appearance</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{qrCodesRemaining} left this month</span>
                </div>

                {/* Color Picker (Both Plans) */}
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
                        title="Pick custom hex color"
                      />
                      <span className="text-[10px] font-mono text-slate-400 ml-2 uppercase">{color}</span>
                    </div>
                  </div>
                </div>

                {/* Pattern Picker (Core Only) */}
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

                {/* Corner & Frame Pickers (Core Only) */}
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

                {!isCorePlan && (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-indigo-300">
                    <span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-amber-400" /> Upgrade to Core to unlock patterns, corners, and frames!</span>
                    <Link to="/dashboard/billing" onClick={onClose} className="font-bold text-amber-400 hover:underline">Upgrade</Link>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isDisabled}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Live Preview Box (5 cols) per Section 6.8 */}
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

                <div className="mt-3 text-center">
                  <div className="text-[10px] font-mono font-bold text-slate-800 truncate max-w-[170px] mx-auto">
                    {previewValue.replace(/^https?:\/\//i, '')}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center space-y-1">
                <div className="text-xs font-semibold text-slate-300">High-Resolution Vector Matrix</div>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Your code updates dynamically in real-time. Scan with your camera to test!
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateQrCodeModal;
