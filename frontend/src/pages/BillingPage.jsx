import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Crown, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

// Helper to dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BillingPage = () => {
  const { user, updateUser, isCorePlan } = useAuth();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [currencyMode, setCurrencyMode] = useState('INR'); // 'INR' (₹750) or 'USD' ($9)

  const fetchBillingStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/billing/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to load billing status:', err);
      setError('Failed to load billing profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingStatus();
  }, [fetchBillingStatus]);

  const handleUpgradeClick = async () => {
    setProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Create order on backend
      const orderRes = await axios.post('/api/billing/create-order');
      const orderData = orderRes.data;

      // 2. Check if backend is running in zero-config mock mode per Section 7
      if (orderData.isMock) {
        // Simulate local checkout delay
        setTimeout(async () => {
          try {
            const verifyRes = await axios.post('/api/billing/verify-payment', {
              razorpayOrderId: orderData.orderId,
              isMock: true
            });
            if (updateUser && verifyRes.data?.user) {
              updateUser(verifyRes.data.user);
            }
            setSuccessMsg('🎉 Successfully upgraded to the Core Plan (Zero-Config Local Dev Verification)!');
            fetchBillingStatus();
          } catch (err) {
            setError(err.response?.data?.error || 'Mock payment verification failed.');
          } finally {
            setProcessing(false);
          }
        }, 1500);
        return;
      }

      // 3. Real Razorpay Checkout flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK. Please check your internet connection or ad blocker.');
        setProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NanoLink',
        description: 'Core Plan Monthly Subscription',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#f97316' // Orange primary
        },
        handler: async (response) => {
          try {
            setProcessing(true);
            const verifyRes = await axios.post('/api/billing/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              isMock: false
            });
            if (updateUser && verifyRes.data?.user) {
              updateUser(verifyRes.data.user);
            }
            setSuccessMsg('🎉 Payment verified! Welcome to the NanoLink Core Plan.');
            fetchBillingStatus();
          } catch (err) {
            setError(err.response?.data?.error || 'Payment verification failed.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to initiate checkout.');
      setProcessing(false);
    }
  };

  const handleDowngradeConfirm = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await axios.post('/api/billing/downgrade');
      if (updateUser && res.data?.user) {
        updateUser(res.data.user);
      }
      setSuccessMsg('Your plan has been downgraded to Free.');
      setShowDowngradeModal(false);
      fetchBillingStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to downgrade plan.');
    } finally {
      setProcessing(false);
    }
  };

  const quotas = status?.quotas || {};
  const limits = status?.limits || {};
  const history = status?.history || [];

  const getProgressPercentage = (used, limit) => {
    if (limit === null || limit === undefined) return 0; // unlimited
    if (limit === 0) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getProgressColor = (pct) => {
    if (pct >= 90) return 'from-red-500 to-rose-600';
    if (pct >= 75) return 'from-amber-500 to-orange-500';
    return 'from-indigo-500 to-purple-500';
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header per Section 6.10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Billing & Subscription</span>
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay Secured</span>
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage your active plan, view monthly quota consumption, and download tax invoices.</p>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setCurrencyMode('INR')}
            className={`px-3 py-1.5 rounded-lg transition-all ${currencyMode === 'INR' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            INR (₹750/mo)
          </button>
          <button
            onClick={() => setCurrencyMode('USD')}
            className={`px-3 py-1.5 rounded-lg transition-all ${currencyMode === 'USD' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            USD ($9/mo)
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-red-300 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold text-xs">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 text-sm">
          <span className="font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold text-xs">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm">Loading billing profile...</div>
        </div>
      ) : (
        <>
          {/* Current Plan Card per Section 6.10 */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Current Subscription Status</span>
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
                    {isCorePlan ? (
                      <>
                        <Crown className="w-8 h-8 text-amber-400 fill-amber-400/20" />
                        <span>Core Plan</span>
                      </>
                    ) : (
                      <span>Free Plan</span>
                    )}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${isCorePlan ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                    {isCorePlan ? 'ACTIVE & UNLOCKED' : 'BASIC TIER'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                  {isCorePlan
                    ? 'You have access to 500 links/month, unlimited custom back-halves, 100 QR codes, UTM campaign tracking, and advanced QR customization swatches.'
                    : 'You are on the standard Free plan with 50 links/month and basic QR codes. Upgrade to unlock enterprise marketing tools and higher throughput limits.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Rate</div>
                  <div className="text-3xl font-extrabold text-white mt-0.5">
                    {isCorePlan ? (currencyMode === 'INR' ? '₹750' : '$9') : '₹0'}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                  </div>
                </div>

                {isCorePlan ? (
                  <button
                    onClick={() => setShowDowngradeModal(true)}
                    disabled={processing}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-semibold rounded-xl text-xs border border-slate-700 hover:border-red-500/30 transition-all w-full sm:w-auto"
                  >
                    Downgrade to Free Plan
                  </button>
                ) : (
                  <button
                    onClick={handleUpgradeClick}
                    disabled={processing}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 w-full sm:w-auto transform hover:-translate-y-0.5"
                  >
                    {processing ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-slate-950" />
                        <span>Upgrade to Core Now</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage Progress Bars per Section 6.10 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Links Meter */}
            {(() => {
              const pct = getProgressPercentage(quotas.linksUsed || 0, quotas.linksLimit);
              return (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Short Links Quota</span>
                      <span className="text-white font-mono">{pct}%</span>
                    </div>
                    <div className="text-2xl font-extrabold text-white mb-4">
                      {quotas.linksUsed || 0} <span className="text-sm font-normal text-slate-500">/ {quotas.linksLimit || 'Unlimited'}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(pct)} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span>Monthly cycle</span>
                    <span className="font-medium text-slate-300">Resets on 1st</span>
                  </div>
                </div>
              );
            })()}

            {/* 2. Custom Back-Halves Meter */}
            {(() => {
              const isUnlim = quotas.customBackHalvesLimit === null || quotas.customBackHalvesLimit === undefined;
              const pct = isUnlim ? 15 : getProgressPercentage(quotas.customBackHalvesUsed || 0, quotas.customBackHalvesLimit);
              return (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Custom Back-Halves</span>
                      <span className="text-white font-mono">{isUnlim ? '∞' : `${pct}%`}</span>
                    </div>
                    <div className="text-2xl font-extrabold text-white mb-4">
                      {quotas.customBackHalvesUsed || 0} <span className="text-sm font-normal text-slate-500">/ {isUnlim ? 'Unlimited' : quotas.customBackHalvesLimit}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${isUnlim ? 'from-emerald-500 to-teal-400' : getProgressColor(pct)} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span>Custom alias slugs</span>
                    <span className="font-medium text-slate-300">{isUnlim ? 'Core Unlocked' : 'Free tier cap'}</span>
                  </div>
                </div>
              );
            })()}

            {/* 3. QR Codes Meter */}
            {(() => {
              const pct = getProgressPercentage(quotas.qrCodesUsed || 0, quotas.qrCodesLimit);
              return (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>QR Codes Quota</span>
                      <span className="text-white font-mono">{pct}%</span>
                    </div>
                    <div className="text-2xl font-extrabold text-white mb-4">
                      {quotas.qrCodesUsed || 0} <span className="text-sm font-normal text-slate-500">/ {quotas.qrCodesLimit || 'Unlimited'}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-3">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(pct)} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span>High-res vector matrix</span>
                    <span className="font-medium text-slate-300">{isCorePlan ? '100 / mo' : '5 / mo'}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Feature Access Checklist per Section 6.10 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Plan Feature Capabilities</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'UTM Campaign Builder', active: limits.utmBuilder, desc: 'Bake source, medium, and campaign parameters.' },
                { name: 'Advanced QR Styling', active: limits.qrCustomization === 'advanced', desc: 'Custom patterns, rounded corners, and banners.' },
                { name: 'Analytics Retention', active: true, desc: `${limits.analyticsRetentionDays || 7} days of detailed event logs.` },
                { name: 'Custom Alias Back-Halves', active: true, desc: limits.customBackHalvesPerMonth === null ? 'Unlimited custom slugs' : `${limits.customBackHalvesPerMonth} custom slugs included.` }
              ].map((feat, i) => (
                <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white">{feat.name}</span>
                    {feat.active ? (
                      <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 bg-slate-800 text-slate-500 rounded-md shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Comparison Table / Banner */}
          {!isCorePlan && (
            <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-amber-900/40 border border-indigo-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Why Upgrade to Core?</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white">Supercharge your link management with 10x higher limits!</h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Join marketing professionals using NanoLink Core for unlimited custom short links, structured QR flyers, and deep UTM traffic insights.
                </p>
              </div>
              <button
                onClick={handleUpgradeClick}
                disabled={processing}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-xl transition-all shrink-0 flex items-center gap-2"
              >
                <span>Upgrade Now ({currencyMode === 'INR' ? '₹750/mo' : '$9/mo'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Billing History Table per Section 6.10 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Billing History & Invoices</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Past Razorpay subscription checkouts and transaction receipts.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {history.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{tx.orderId}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{tx.paymentId || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-white">
                        {tx.currency === 'INR' ? `₹${tx.amount}` : `$${tx.amount}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          tx.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          tx.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Invoice receipt for order ${tx.orderId} is being generated.`)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Download</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No subscription transaction history recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Downgrade Subscription?</h3>
                <p className="text-xs text-slate-400">You are about to switch back to the Free tier.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>By downgrading to the Free Plan, you will immediately lose access to:</p>
              <ul className="list-disc list-inside text-red-300 space-y-1 pl-1">
                <li>500 monthly short links cap (reverted to 50)</li>
                <li>Unlimited custom alias back-halves (reverted to 3)</li>
                <li>100 QR codes quota (reverted to 2)</li>
                <li>UTM campaign parameter builder</li>
                <li>Advanced QR customization (patterns, frames)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDowngradeModal(false)}
                disabled={processing}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Keep Core Plan
              </button>
              <button
                type="button"
                onClick={handleDowngradeConfirm}
                disabled={processing}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                <span>Confirm Downgrade</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
