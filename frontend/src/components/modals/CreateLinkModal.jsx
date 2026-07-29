import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Link2, 
  QrCode, 
  Sparkles, 
  Crown, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Download,
  Share2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import StyledQRCode from '../common/StyledQRCode';

const CreateLinkModal = ({ isOpen, onClose, initialUrl = '', onSuccess }) => {
  const { user, isCorePlan } = useAuth();
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState('');
  const [backHalf, setBackHalf] = useState('');
  const [title, setTitle] = useState('');
  const [generateQr, setGenerateQr] = useState(false);
  
  const [qrColor, setQrColor] = useState('#166534');
  const [qrPattern, setQrPattern] = useState('squares');
  const [qrCornerStyle, setQrCornerStyle] = useState('square');
  const [qrFrame, setQrFrame] = useState('none');

  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [showUtmSection, setShowUtmSection] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOriginalUrl(initialUrl || '');
      setBackHalf('');
      setTitle('');
      setGenerateQr(false);
      setQrColor('#166534');
      setQrPattern('squares');
      setQrCornerStyle('square');
      setQrFrame('none');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setUtmTerm('');
      setUtmContent('');
      setShowUtmSection(false);
      setError(null);
      setIsQuotaError(false);
      setCreatedResult(null);
      setCopied(false);
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  const backHalvesUsed = user?.monthlyBackHalfCount || 0;
  const backHalvesLimit = isCorePlan ? 50 : 5;
  const backHalvesRemaining = Math.max(0, backHalvesLimit - backHalvesUsed);
  const isBackHalfDisabled = !isCorePlan && backHalvesRemaining <= 0;

  const qrCodesUsed = user?.monthlyQrCodeCount || 0;
  const qrCodesLimit = isCorePlan ? 50 : 10;
  const qrCodesRemaining = Math.max(0, qrCodesLimit - qrCodesUsed);
  const isQrDisabled = qrCodesRemaining <= 0;

  const buildFinalUrl = () => {
    let url = originalUrl.trim();
    if (!url) return url;

    const params = new URLSearchParams();
    if (utmSource.trim()) params.append('utm_source', utmSource.trim());
    if (utmMedium.trim()) params.append('utm_medium', utmMedium.trim());
    if (utmCampaign.trim()) params.append('utm_campaign', utmCampaign.trim());
    if (utmTerm.trim()) params.append('utm_term', utmTerm.trim());
    if (utmContent.trim()) params.append('utm_content', utmContent.trim());

    const queryString = params.toString();
    if (!queryString) return url;

    return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalUrl = buildFinalUrl();
    if (!finalUrl) {
      setError('Please provide a destination URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsQuotaError(false);

    try {
      const payload = {
        originalUrl: finalUrl,
        title: title.trim() || undefined,
        customSlug: backHalf.trim() || undefined,
        generateQr: generateQr && !isQrDisabled,
        qrColor: generateQr ? qrColor : undefined,
        qrPattern: generateQr && isCorePlan ? qrPattern : undefined,
        qrCornerStyle: generateQr && isCorePlan ? qrCornerStyle : undefined,
        qrFrame: generateQr && isCorePlan ? qrFrame : undefined,
      };

      const res = await axios.post('/api/links', payload);
      setCreatedResult(res.data);
      window.dispatchEvent(new Event('nanolink_data_change'));
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === 'QUOTA_EXCEEDED') {
        setIsQuotaError(true);
      }
      setError(errData?.message || errData?.error || 'Failed to create link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdResult?.link?.shortUrl) return;
    navigator.clipboard.writeText(createdResult.link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    if (!createdResult?.link?.shortUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: createdResult.link.title || 'NanoLink Short URL',
          text: `Check out this link: ${createdResult.link.shortUrl}`,
          url: createdResult.link.shortUrl,
        });
      } catch (err) {
        console.log('Share dismissed or failed', err);
      }
    } else {
      handleCopy();
      alert('Link copied to clipboard for sharing!');
    }
  };

  const handleDownloadPng = () => {
    const svgEl = document.querySelector('#link-modal-qr-svg svg') || document.getElementById('link-modal-qr-svg');
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
        a.download = `nanolink-${createdResult?.link?.slug || 'qr'}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.querySelector('#link-modal-qr-svg svg') || document.getElementById('link-modal-qr-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `nanolink-${createdResult?.link?.slug || 'qr'}.svg`;
      a.href = url;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 overflow-hidden my-8 shadow-2xl rounded-xl text-neutral-900">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 text-white flex items-center justify-center rounded-lg shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Create New Short Link</h2>
              <p className="text-xs text-neutral-500 font-light">Transform long URLs into powerful, trackable short links.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdResult ? (
          /* Success View */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200 bg-white font-light">
            <div className="w-16 h-16 bg-green-700 text-white flex items-center justify-center mx-auto rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-1">Short Link Generated Successfully!</h3>
              <a href={createdResult.link.originalUrl} target="_blank" rel="noreferrer" className="text-sm text-green-700 hover:underline truncate max-w-md mx-auto font-light font-mono block">{createdResult.link.originalUrl}</a>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between gap-4 max-w-md mx-auto">
              <a href={createdResult.link.shortUrl} target="_blank" rel="noreferrer" className="text-base font-mono font-bold text-green-700 hover:underline truncate">{createdResult.link.shortUrl}</a>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold flex items-center gap-1.5 rounded-lg transition-all shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {createdResult.qrCode && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl inline-block text-center">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 font-mono">Associated QR Code</div>
                <div className="mx-auto bg-white p-3 rounded-lg inline-block border border-neutral-200">
                  <StyledQRCode
                    id="link-modal-qr-svg"
                    value={createdResult.link.shortUrl}
                    size={160}
                    fgColor={createdResult.qrCode?.color || '#166534'}
                    pattern={createdResult.qrCode?.pattern || 'squares'}
                    cornerStyle={createdResult.qrCode?.cornerStyle || 'square'}
                    frame={createdResult.qrCode?.frame || 'none'}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-neutral-200">
              <button
                onClick={handleCopy}
                className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold flex items-center gap-2 rounded-lg transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={handleShare}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-neutral-200"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              {createdResult.qrCode && (
                <>
                  <button
                    onClick={handleDownloadPng}
                    className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold flex items-center gap-2 rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={handleDownloadSvg}
                    className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-2 rounded-lg transition-colors cursor-pointer border border-neutral-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download SVG</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setCreatedResult(null)}
                className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Create Another
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-neutral-200"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white font-light">
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
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/long-campaign-url"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-green-700 rounded-lg transition-all"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Custom Back-Half (Optional)
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {backHalvesRemaining} left this month
                  </span>
                </div>
                <div className="flex items-center w-full">
                  <div className="px-3.5 py-3 bg-neutral-100 border border-r-0 border-neutral-200 text-neutral-600 text-sm font-mono font-medium select-none rounded-l-lg shrink-0">
                    nano.link/r/
                  </div>
                  <input
                    type="text"
                    disabled={isBackHalfDisabled}
                    value={backHalf}
                    onChange={(e) => setBackHalf(e.target.value)}
                    placeholder="my-alias"
                    className="flex-1 min-w-0 w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm font-mono font-normal focus:outline-none focus:border-green-700 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                {isBackHalfDisabled && (
                  <p className="mt-1.5 text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Free limit reached. Upgrade to Core for unlimited aliases.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Link Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Launch Campaign"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm font-normal focus:outline-none focus:border-green-700 rounded-lg transition-all"
                />
              </div>
            </div>

            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-700 text-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">Generate a QR Code</div>
                    <div className="text-xs text-neutral-500 font-light">Instantly create a printable, scan-ready QR code for this link.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {qrCodesRemaining} left this month
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isQrDisabled}
                      checked={generateQr}
                      onChange={(e) => setGenerateQr(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-700 disabled:opacity-50" />
                  </label>
                </div>
              </div>

              {generateQr && (
                <div className="pt-4 border-t border-neutral-200 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-2">QR Code Color</label>
                    <div className="flex items-center gap-3">
                      {['#166534', '#000000', '#2563EB', '#F97316', '#4F46E5'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setQrColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-8 h-8 border rounded-lg transition-transform cursor-pointer ${
                            qrColor === col ? 'border-neutral-900 ring-2 ring-neutral-900 scale-110' : 'border-neutral-300 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {isCorePlan ? (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 mb-1">Pattern</label>
                        <select
                          value={qrPattern}
                          onChange={(e) => setQrPattern(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:border-green-700"
                        >
                          <option value="squares">Squares (Standard)</option>
                          <option value="dots">Dots (Modern)</option>
                          <option value="rounded">Rounded</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 mb-1">Corner Style</label>
                        <select
                          value={qrCornerStyle}
                          onChange={(e) => setQrCornerStyle(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:border-green-700"
                        >
                          <option value="square">Square</option>
                          <option value="extra-rounded">Extra Rounded</option>
                          <option value="dot">Dot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 mb-1">Frame</label>
                        <select
                          value={qrFrame}
                          onChange={(e) => setQrFrame(e.target.value)}
                          className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:border-green-700"
                        >
                          <option value="none">None</option>
                          <option value="scan-me">Scan Me Banner</option>
                          <option value="border">Clean Border</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-white border border-neutral-200 rounded-lg flex items-center justify-between text-xs text-neutral-700 font-medium">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Upgrade to Core for custom patterns, corners, and frames!</span>
                      </div>
                      <Link
                        to="/dashboard/billing"
                        onClick={onClose}
                        className="text-green-700 font-bold hover:underline shrink-0"
                      >
                        Upgrade
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Settings: UTM Parameters Sub-Form */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
              <button
                type="button"
                onClick={() => setShowUtmSection(!showUtmSection)}
                className="w-full p-4 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-green-700" />
                  <span className="text-sm font-bold text-neutral-900">Advanced Settings: UTM Builder</span>
                  {!isCorePlan && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase border border-amber-200 rounded-full font-mono">
                      <Crown className="w-3 h-3" />
                      <span>Core Only</span>
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${showUtmSection ? 'rotate-90' : ''}`} />
              </button>

              {showUtmSection && (
                <div className="p-5 bg-white border-t border-neutral-200 space-y-4 animate-in fade-in duration-150">
                  {!isCorePlan ? (
                    <div className="text-center py-6 px-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                      <Crown className="w-8 h-8 text-amber-600 mx-auto" />
                      <h4 className="text-base font-bold text-neutral-900">Unlock Campaign Analytics</h4>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
                        Bake UTM parameters directly into your links to track campaign performance across Google Analytics and marketing dashboards.
                      </p>
                      <Link
                        to="/dashboard/billing"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        <span>Upgrade to Core</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">UTM Source</label>
                        <input
                          type="text"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value)}
                          placeholder="e.g. google, newsletter, twitter"
                          className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-xs placeholder-neutral-400 font-normal focus:border-green-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">UTM Medium</label>
                        <input
                          type="text"
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value)}
                          placeholder="e.g. cpc, banner, email"
                          className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-xs placeholder-neutral-400 font-normal focus:border-green-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">UTM Campaign</label>
                        <input
                          type="text"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value)}
                          placeholder="e.g. summer_sale, launch_2026"
                          className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-xs placeholder-neutral-400 font-normal focus:border-green-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">UTM Term / Keyword</label>
                        <input
                          type="text"
                          value={utmTerm}
                          onChange={(e) => setUtmTerm(e.target.value)}
                          placeholder="e.g. running+shoes"
                          className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-xs placeholder-neutral-400 font-normal focus:border-green-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">UTM Content</label>
                        <input
                          type="text"
                          value={utmContent}
                          onChange={(e) => setUtmContent(e.target.value)}
                          placeholder="e.g. logolink, textlink, header_cta"
                          className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-xs placeholder-neutral-400 font-normal focus:border-green-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-xs disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create your link</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateLinkModal;
