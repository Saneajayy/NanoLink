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
  Sliders
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateLinkModal = ({ isOpen, onClose, initialUrl = '', onSuccess }) => {
  const { user, isCorePlan } = useAuth();
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState('');
  const [backHalf, setBackHalf] = useState('');
  const [title, setTitle] = useState('');
  const [generateQr, setGenerateQr] = useState(false);
  
  // QR Styling options per Section 6.6 & 6.8
  const [qrColor, setQrColor] = useState('#000000');
  const [qrPattern, setQrPattern] = useState('squares');
  const [qrCornerStyle, setQrCornerStyle] = useState('square');
  const [qrFrame, setQrFrame] = useState('none');

  // UTM Parameters sub-form per Section 6.6
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

  // Sync initialUrl on open (Section 2 & 4 pre-filled URL feature)
  useEffect(() => {
    if (isOpen) {
      setOriginalUrl(initialUrl || '');
      setBackHalf('');
      setTitle('');
      setGenerateQr(false);
      setQrColor('#000000');
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

  // Quota computations
  const customBackHalvesUsed = user?.monthlyCustomBackHalfCount || 0;
  const customBackHalvesLimit = isCorePlan ? '∞' : 3;
  const backHalvesRemaining = isCorePlan ? 'Unlimited' : Math.max(0, 3 - customBackHalvesUsed);
  const isBackHalfDisabled = !isCorePlan && customBackHalvesUsed >= 3;

  const qrCodesUsed = user?.monthlyQrCodeCount || 0;
  const qrCodesLimit = isCorePlan ? 5 : 2;
  const qrCodesRemaining = Math.max(0, qrCodesLimit - qrCodesUsed);
  const isQrDisabled = qrCodesRemaining <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl || !originalUrl.trim()) {
      setError('Please provide a destination URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsQuotaError(false);

    try {
      const payload = {
        originalUrl: originalUrl.trim(),
        title: title.trim(),
        generateQr,
        qrOptions: generateQr ? {
          color: qrColor,
          pattern: isCorePlan ? qrPattern : undefined,
          cornerStyle: isCorePlan ? qrCornerStyle : undefined,
          frame: isCorePlan ? qrFrame : undefined,
        } : undefined,
      };

      if (backHalf.trim()) {
        payload.customAlias = backHalf.trim();
      }

      if (isCorePlan && (utmSource || utmMedium || utmCampaign || utmTerm || utmContent)) {
        payload.utmParams = {
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
          term: utmTerm,
          content: utmContent
        };
      }

      const res = await axios.post('/api/links', payload);
      setCreatedResult(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === 'QUOTA_EXCEEDED') {
        setIsQuotaError(true);
      }
      setError(errData?.message || errData?.error || 'Failed to create short link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdResult?.link?.shortUrl) {
      navigator.clipboard.writeText(createdResult.link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top orange gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New Short Link</h2>
              <p className="text-xs text-slate-400">Transform long URLs into powerful, trackable short links.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdResult ? (
          /* Success View */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Your Link is Ready!</h3>
              <p className="text-sm text-slate-400 truncate max-w-md mx-auto">{createdResult.link.originalUrl}</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <span className="text-lg font-mono font-bold text-indigo-400 truncate">{createdResult.link.shortUrl}</span>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow transition-all shrink-0"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {createdResult.qrCode && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl inline-block text-center">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Generated QR Code</div>
                <img src={createdResult.qrCode.imageUrl} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg bg-white p-2" />
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setCreatedResult(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">{isQuotaError ? 'Plan Limit Reached' : 'Error'}</div>
                  <div className="text-red-200 mt-0.5">{error}</div>
                  {isQuotaError && (
                    <button
                      type="button"
                      onClick={() => { onClose(); navigate('/dashboard/billing'); }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-lg shadow hover:opacity-95 transition-opacity"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Upgrade to Core Now</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Destination URL (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Destination URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/long-campaign-url"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Short Link Domain (Fixed text nano.link per Section 6.6) & Back-Half Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Custom Back-Half (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {backHalvesRemaining} left this month
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="px-3 py-3 bg-slate-950 border border-r-0 border-slate-800 rounded-l-xl text-slate-400 text-sm font-mono select-none">
                    nano.link/r/
                  </div>
                  <input
                    type="text"
                    disabled={isBackHalfDisabled}
                    value={backHalf}
                    onChange={(e) => setBackHalf(e.target.value)}
                    placeholder="my-alias"
                    className="flex-1 px-3 py-3 bg-slate-950 border border-slate-800 rounded-r-xl text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                {isBackHalfDisabled && (
                  <p className="mt-1.5 text-[11px] text-amber-400 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Free limit reached. Upgrade to Core for unlimited aliases.</span>
                  </p>
                )}
              </div>

              {/* Title Field (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Link Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Launch Campaign"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Sharing Options Section: Generate QR Code Toggle (Section 6.6) */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Generate a QR Code</div>
                    <div className="text-xs text-slate-400">Instantly create a printable, scan-ready QR code for this link.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-medium">
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
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 disabled:opacity-50" />
                  </label>
                </div>
              </div>

              {/* QR Styling Controls (Section 6.6: Color always; Pattern/Corner/Frame only if Core plan!) */}
              {generateQr && (
                <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">QR Code Color</label>
                    <div className="flex items-center gap-3">
                      {['#000000', '#0D8BFF', '#4F46E5', '#FF6B2C', '#10B981', '#EC4899'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setQrColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            qrColor === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Core Only Controls per Section 6.6 */}
                  {isCorePlan ? (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Pattern</label>
                        <select
                          value={qrPattern}
                          onChange={(e) => setQrPattern(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="squares">Squares (Standard)</option>
                          <option value="dots">Dots (Modern)</option>
                          <option value="rounded">Rounded</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Corner Style</label>
                        <select
                          value={qrCornerStyle}
                          onChange={(e) => setQrCornerStyle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="square">Square</option>
                          <option value="extra-rounded">Extra Rounded</option>
                          <option value="dot">Dot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Frame</label>
                        <select
                          value={qrFrame}
                          onChange={(e) => setQrFrame(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="none">None</option>
                          <option value="scan-me">Scan Me Banner</option>
                          <option value="border">Clean Border</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-between text-xs text-indigo-300">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Upgrade to Core for custom patterns, corners, and frames!</span>
                      </div>
                      <Link
                        to="/dashboard/billing"
                        onClick={onClose}
                        className="text-amber-400 font-bold hover:underline shrink-0"
                      >
                        Upgrade
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Settings: UTM Parameters Sub-Form (Core Gated per Section 6.6) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowUtmSection(!showUtmSection)}
                className="w-full p-4 bg-slate-950/60 hover:bg-slate-950 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-white">Advanced Settings: UTM Builder</span>
                  {!isCorePlan && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase border border-amber-500/30">
                      <Crown className="w-3 h-3" />
                      <span>Core Only</span>
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showUtmSection ? 'rotate-90' : ''}`} />
              </button>

              {showUtmSection && (
                <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4 animate-in fade-in duration-150">
                  {!isCorePlan ? (
                    <div className="text-center py-6 px-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <Crown className="w-8 h-8 text-amber-400 mx-auto" />
                      <h4 className="text-base font-bold text-white">Unlock Campaign Analytics</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Bake UTM parameters directly into your links to track campaign performance across Google Analytics and marketing dashboards.
                      </p>
                      <Link
                        to="/dashboard/billing"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold rounded-lg shadow hover:opacity-95 transition-opacity"
                      >
                        <span>Upgrade to Core</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">UTM Source</label>
                        <input
                          type="text"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value)}
                          placeholder="e.g. google, newsletter, twitter"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">UTM Medium</label>
                        <input
                          type="text"
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value)}
                          placeholder="e.g. cpc, banner, email"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">UTM Campaign</label>
                        <input
                          type="text"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value)}
                          placeholder="e.g. summer_sale, launch_2026"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">UTM Term / Keyword</label>
                        <input
                          type="text"
                          value={utmTerm}
                          onChange={(e) => setUtmTerm(e.target.value)}
                          placeholder="e.g. running+shoes"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">UTM Content</label>
                        <input
                          type="text"
                          value={utmContent}
                          onChange={(e) => setUtmContent(e.target.value)}
                          placeholder="e.g. logolink, textlink, header_cta"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons (Cancel / Create your link per Section 6.6) */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 text-sm disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
