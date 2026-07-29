import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, QrCode, Crown, Sparkles, AlertCircle, CheckCircle2, Download, ExternalLink, Sliders, Palette, Layout, Box, Square, Copy, Share2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import StyledQRCode from '../common/StyledQRCode';

const CreateQrCodeModal = ({ isOpen, onClose, initialLink = null, onSuccess }) => {
  const { user, isCorePlan } = useAuth();
  const navigate = useNavigate();

  const [destinationUrl, setDestinationUrl] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#166534');
  const [pattern, setPattern] = useState('squares');
  const [cornerStyle, setCornerStyle] = useState('square');
  const [frame, setFrame] = useState('none');
  const [createShortLink, setCreateShortLink] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [createdQr, setCreatedQr] = useState(null);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialLink) {
        setDestinationUrl(initialLink.originalUrl || '');
        setTitle(`QR for ${initialLink.title || initialLink.slug}`);
      } else {
        setDestinationUrl('');
        setTitle('');
      }
      setColor('#166534');
      setPattern('squares');
      setCornerStyle('square');
      setFrame('none');
      setCreateShortLink(true);
      setError(null);
      setIsQuotaError(false);
      setCreatedQr(null);
      setCreatedLink(null);
    }
  }, [isOpen, initialLink]);

  if (!isOpen) return null;

  const qrCodesUsed = user?.monthlyQrCodeCount || 0;
  const qrCodesLimit = isCorePlan ? 50 : 10;
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
        linkId: initialLink?._id || undefined,
        createShortLink: initialLink ? true : createShortLink
      };

      const res = await axios.post('/api/qr', payload);
      setCreatedQr(res.data.qrCode);
      setCreatedLink(res.data.link);
      window.dispatchEvent(new Event('nanolink_data_change'));
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

  const handleDownloadPng = () => {
    const svgEl = document.querySelector('#download-qr-svg svg') || document.getElementById('download-qr-svg') || document.querySelector('#preview-qr-svg svg') || document.getElementById('preview-qr-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 800, 800);
        const a = document.createElement('a');
        a.download = `nanolink-${createdLink?.slug || 'qrcode'}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.querySelector('#download-qr-svg svg') || document.getElementById('download-qr-svg') || document.querySelector('#preview-qr-svg svg') || document.getElementById('preview-qr-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `nanolink-${createdLink?.slug || 'qrcode'}.svg`;
      a.href = url;
      a.click();
    }
  };

  const handleCopyLink = () => {
    const targetUrl = createdLink?.shortUrl || destinationUrl;
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    const targetUrl = createdLink?.shortUrl || destinationUrl;
    if (!targetUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: createdQr?.title || 'NanoLink QR Code',
          text: `Scan or visit this link: ${targetUrl}`,
          url: targetUrl,
        });
      } catch (err) {
        console.log('Share dismissed or failed', err);
      }
    } else {
      handleCopyLink();
      alert('Link copied to clipboard for sharing!');
    }
  };

  const previewValue = destinationUrl || initialLink?.originalUrl || 'https://nano.link/preview';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-neutral-200 overflow-hidden my-8 shadow-2xl rounded-xl text-neutral-900">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 text-white flex items-center justify-center rounded-lg shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {initialLink ? `Create QR for "${initialLink.title || initialLink.slug}"` : 'Create Standalone QR Code'}
              </h2>
              <p className="text-xs text-neutral-500 font-light">
                {initialLink ? `Associated with short link: ${initialLink.shortUrl}` : 'Automatically generates an underlying trackable short link per Section 5.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdQr ? (
          /* Success View Popup */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200 bg-white font-light">
            <div className="w-16 h-16 bg-green-700 text-white flex items-center justify-center mx-auto rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-1">QR Code Generated Successfully!</h3>
              <p className="text-sm text-neutral-600 font-normal">
                Linked to <a href={createdLink?.shortUrl || destinationUrl} target="_blank" rel="noreferrer" className="text-green-700 font-mono underline font-medium">{createdLink?.shortUrl || destinationUrl}</a>
              </p>
            </div>

            <div className="p-5 bg-neutral-50 border border-neutral-200 inline-block rounded-xl">
              <div className="bg-white p-3 rounded-lg inline-block border border-neutral-200">
                <StyledQRCode
                  id="preview-qr-svg"
                  value={createdLink?.shortUrl || destinationUrl}
                  size={220}
                  fgColor={createdQr.color}
                  pattern={createdQr.pattern}
                  cornerStyle={createdQr.cornerStyle}
                  frame={createdQr.frame}
                />
                <div className="hidden">
                  <StyledQRCode
                    id="download-qr-svg"
                    value={createdLink?.shortUrl || destinationUrl}
                    size={600}
                    fgColor={createdQr.color}
                    pattern={createdQr.pattern}
                    cornerStyle={createdQr.cornerStyle}
                    frame={createdQr.frame}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold flex items-center gap-2 rounded-lg transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={handleShare}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-neutral-200"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleDownloadPng}
                className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold flex items-center gap-2 rounded-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={handleDownloadSvg}
                className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-neutral-200"
              >
                <Download className="w-4 h-4" />
                <span>Download SVG</span>
              </button>
              <button onClick={onClose} className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Rich Two-Column Layout */
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto bg-white font-light">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-red-700">{isQuotaError ? 'Plan Limit Reached' : 'Error'}</div>
                    <div className="text-neutral-600 font-normal mt-0.5">{error}</div>
                    {isQuotaError && (
                      <button
                        type="button"
                        onClick={() => { onClose(); navigate('/dashboard/billing'); }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Upgrade to Core Now</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Destination URL <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!initialLink}
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://example.com/menu"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-green-700 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
                {initialLink && (
                  <p className="mt-1.5 text-xs text-neutral-500 flex items-center gap-1 font-mono font-medium">
                    <span>Locked to existing short link: {initialLink.shortUrl}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  QR Code Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cafe Counter Menu QR"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-green-700 rounded-lg transition-all"
                />
              </div>

              {!initialLink && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="createShortLink"
                    checked={createShortLink}
                    onChange={(e) => setCreateShortLink(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-700 border-neutral-300 rounded focus:ring-0 cursor-pointer shrink-0"
                  />
                  <label htmlFor="createShortLink" className="text-xs font-normal text-neutral-700 cursor-pointer block">
                    <span className="font-bold block text-sm text-neutral-900">Generate Trackable Short Link (Dynamic QR)</span>
                    <span className="text-neutral-500 mt-0.5 block font-light">When enabled, creates an underlying short URL so you can track scans and update the destination URL anytime without reprinting. Disable for a static, direct QR code.</span>
                  </label>
                </div>
              )}

              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-bold text-neutral-900">Color & Appearance</span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">{qrCodesRemaining} left this month</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-2.5">QR Foreground Color</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {['#166534', '#000000', '#2563EB', '#F97316', '#4F46E5'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-8 h-8 border rounded-lg transition-transform cursor-pointer ${color === col ? 'border-neutral-900 ring-2 ring-neutral-900 scale-110' : 'border-neutral-300 opacity-80 hover:opacity-100'}`}
                      />
                    ))}
                    <div className="relative flex items-center">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 bg-transparent border border-neutral-300 rounded-lg cursor-pointer overflow-hidden p-0"
                        title="Pick custom hex color"
                      />
                      <span className="text-[10px] font-mono font-bold text-neutral-900 ml-2 uppercase">{color}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-green-700" />
                      <span>Pattern Style</span>
                    </label>
                    {!isCorePlan && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase border border-amber-200 rounded-full font-mono">
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
                        className={`p-3 border text-left rounded-lg transition-all cursor-pointer ${
                          pattern === pat.id
                            ? 'bg-green-700 border-green-700 text-white'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed'
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
                    <label className="block text-xs font-semibold text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-green-700" />
                      <span>Corner Style</span>
                    </label>
                    <select
                      disabled={!isCorePlan}
                      value={cornerStyle}
                      onChange={(e) => setCornerStyle(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:border-green-700 disabled:opacity-50"
                    >
                      <option value="square">Square Corners</option>
                      <option value="extra-rounded">Extra Rounded</option>
                      <option value="dot">Dot Eyes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-green-700" />
                      <span>Frame Style</span>
                    </label>
                    <select
                      disabled={!isCorePlan}
                      value={frame}
                      onChange={(e) => setFrame(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:border-green-700 disabled:opacity-50"
                    >
                      <option value="none">No Frame (Clean)</option>
                      <option value="scan-me">Scan Me Banner</option>
                      <option value="border">Structured Border</option>
                    </select>
                  </div>
                </div>

                {!isCorePlan && (
                  <div className="p-3.5 bg-white border border-neutral-200 rounded-lg flex items-center justify-between text-xs text-neutral-700 font-medium">
                    <span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-amber-600" /> Upgrade to Core to unlock patterns, corners, and frames!</span>
                    <Link to="/dashboard/billing" onClick={onClose} className="font-bold text-green-700 hover:underline">Upgrade</Link>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3 bg-white">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-neutral-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isDisabled}
                  className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Live Preview Box (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-neutral-50 border border-neutral-200 rounded-xl relative overflow-hidden h-fit lg:sticky lg:top-6">
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-6 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 bg-green-700 rounded-full" />
                <span>Live Preview</span>
              </div>
              <div className="p-5 bg-white border border-neutral-200 rounded-xl relative transition-all duration-300 flex flex-col items-center justify-center mx-auto w-fit h-fit">
                <div className="bg-white p-3 rounded-lg">
                  <StyledQRCode
                    id="live-form-preview-qr"
                    value={previewValue}
                    size={180}
                    fgColor={color}
                    pattern={pattern}
                    cornerStyle={cornerStyle}
                    frame={frame}
                  />
                </div>

                <div className="mt-3 text-center">
                  <div className="text-[11px] font-mono font-bold text-green-700 truncate max-w-[170px] mx-auto">
                    {previewValue.replace(/^https?:\/\//i, '')}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center space-y-1">
                <div className="text-xs font-bold text-neutral-900">High-Resolution Vector Matrix</div>
                <p className="text-[11px] text-neutral-500 max-w-xs font-light">
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
