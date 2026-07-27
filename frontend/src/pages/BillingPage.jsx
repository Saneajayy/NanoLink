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
 if (pct >= 90) return 'bg-[#FF6206]';
 return 'bg-[#1A00FF]';
 };

 return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto bg-white font-light">
      {/* Header per Section 6.10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight flex items-center gap-3">
            <span>Billing & Subscription</span>
            <span className="px-3 py-1 bg-neutral-100 text-[#FF6206] border border-neutral-200 text-xs font-medium uppercase tracking-wider flex items-center gap-1 rounded-sm shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay Secured</span>
            </span>
          </h1>
          <p className="text-sm font-light text-neutral-600 mt-1">Manage your active plan, view monthly quota consumption, and download tax invoices.</p>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center bg-white border border-neutral-200 p-1 text-xs font-medium self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setCurrencyMode('INR')}
            className={`px-3 py-1.5 transition-all ${currencyMode === 'INR' ? 'bg-[#FF6206] text-white shadow-sm' : 'text-black hover:bg-neutral-100'}`}
          >
            INR (₹750/mo)
          </button>
          <button
            onClick={() => setCurrencyMode('USD')}
            className={`px-3 py-1.5 transition-all ${currencyMode === 'USD' ? 'bg-[#FF6206] text-white shadow-sm' : 'text-black hover:bg-neutral-100'}`}
          >
            USD ($9/mo)
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 flex items-center justify-between text-red-600 font-medium text-sm rounded-sm shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-black hover:underline font-semibold text-xs">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between text-black font-medium text-sm rounded-sm shadow-sm">
          <span className="font-normal">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-[#FF6206] hover:underline font-semibold text-xs">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-neutral-500 font-normal space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-black animate-spin mx-auto rounded-full" />
          <div className="text-sm">Loading billing profile...</div>
        </div>
      ) : (
        <>
          {/* Current Plan Card per Section 6.10 */}
          <div className="bg-white border border-neutral-200 p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-700 rounded-sm">
                  <span>Current Subscription Status</span>
                </div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-black flex items-center gap-2.5">
                    {isCorePlan ? (
                      <>
                        <Crown className="w-8 h-8 text-[#FF6206]" />
                        <span>Core Plan</span>
                      </>
                    ) : (
                      <span>Free Plan</span>
                    )}
                  </h2>
                  <span className={`px-3 py-1 text-xs font-medium rounded-sm shadow-sm ${isCorePlan ? 'bg-[#FF6206] text-white' : 'bg-neutral-100 border border-neutral-200 text-neutral-800'}`}>
                    {isCorePlan ? 'ACTIVE & UNLOCKED' : 'BASIC TIER'}
                  </span>
                </div>
                <p className="text-sm font-light text-neutral-600 max-w-xl leading-relaxed">
                  {isCorePlan
                    ? 'You have access to 500 links/month, unlimited custom back-halves, 100 QR codes, UTM campaign tracking, and advanced QR customization swatches.'
                    : 'You are on the standard Free plan with 50 links/month and basic QR codes. Upgrade to unlock enterprise marketing tools and higher throughput limits.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0 bg-neutral-50 p-5 border border-neutral-200 rounded-sm">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Subscription Rate</div>
                  <div className="text-3xl font-bold text-black mt-0.5">
                    {isCorePlan ? (currencyMode === 'INR' ? '₹750' : '$9') : '₹0'}
                    <span className="text-xs font-normal text-neutral-500 ml-1">/ month</span>
                  </div>
                </div>

                {isCorePlan ? (
                  <button
                    onClick={() => setShowDowngradeModal(true)}
                    disabled={processing}
                    className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black font-medium text-xs border border-neutral-200 transition-all w-full sm:w-auto cursor-pointer shadow-sm"
                  >
                    Downgrade to Free Plan
                  </button>
                ) : (
                  <button
                    onClick={handleUpgradeClick}
                    disabled={processing}
                    className="px-6 py-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer shadow-sm"
                  >
                    {processing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
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
                <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      <span>Short Links Quota</span>
                      <span className="text-black font-mono font-semibold">{pct}%</span>
                    </div>
                    <div className="text-2xl font-bold text-black mb-4">
                      {quotas.linksUsed || 0} <span className="text-sm font-normal text-neutral-500">/ {quotas.linksLimit || 'Unlimited'}</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 overflow-hidden rounded-full mb-3">
                      <div
                        className={`h-full ${getProgressColor(pct)} transition-all duration-500 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-light text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-200">
                    <span>Monthly cycle</span>
                    <span className="font-semibold text-black">Resets on 1st</span>
                  </div>
                </div>
              );
            })()}

            {/* 2. Custom Back-Halves Meter */}
            {(() => {
              const isUnlim = quotas.customBackHalvesLimit === null || quotas.customBackHalvesLimit === undefined;
              const pct = isUnlim ? 15 : getProgressPercentage(quotas.customBackHalvesUsed || 0, quotas.customBackHalvesLimit);
              return (
                <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      <span>Custom Back-Halves</span>
                      <span className="text-black font-mono font-semibold">{isUnlim ? '∞' : `${pct}%`}</span>
                    </div>
                    <div className="text-2xl font-bold text-black mb-4">
                      {quotas.customBackHalvesUsed || 0} <span className="text-sm font-normal text-neutral-500">/ {isUnlim ? 'Unlimited' : quotas.customBackHalvesLimit}</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 overflow-hidden rounded-full mb-3">
                      <div
                        className={`h-full ${isUnlim ? 'bg-[#FF6206]' : getProgressColor(pct)} transition-all duration-500 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-light text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-200">
                    <span>Custom alias slugs</span>
                    <span className="font-semibold text-black">{isUnlim ? 'Core Unlocked' : 'Free tier cap'}</span>
                  </div>
                </div>
              );
            })()}

            {/* 3. QR Codes Meter */}
            {(() => {
              const pct = getProgressPercentage(quotas.qrCodesUsed || 0, quotas.qrCodesLimit);
              return (
                <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      <span>QR Codes Quota</span>
                      <span className="text-black font-mono font-semibold">{pct}%</span>
                    </div>
                    <div className="text-2xl font-bold text-black mb-4">
                      {quotas.qrCodesUsed || 0} <span className="text-sm font-normal text-neutral-500">/ {quotas.qrCodesLimit || 'Unlimited'}</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 overflow-hidden rounded-full mb-3">
                      <div
                        className={`h-full ${getProgressColor(pct)} transition-all duration-500 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-light text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-200">
                    <span>High-res vector matrix</span>
                    <span className="font-semibold text-black">{isCorePlan ? '50 / mo' : '10 / mo'}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Feature Access Checklist per Section 6.10 */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-black mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF6206]" />
              <span>Plan Feature Capabilities</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'UTM Campaign Builder', active: limits.utmBuilder, desc: 'Bake source, medium, and campaign parameters.' },
                { name: 'Advanced QR Styling', active: limits.qrCustomization === 'advanced', desc: 'Custom patterns, rounded corners, and banners.' },
                { name: 'Analytics Retention', active: true, desc: `${limits.analyticsRetentionDays || 7} days of detailed event logs.` },
                { name: 'Custom Alias Back-Halves', active: true, desc: limits.customBackHalvesPerMonth === null ? 'Unlimited custom slugs' : `${limits.customBackHalvesPerMonth} custom slugs included.` }
              ].map((feat, i) => (
                <div key={i} className="p-4 bg-neutral-50 border border-neutral-200 flex flex-col justify-between rounded-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-black">{feat.name}</span>
                    {feat.active ? (
                      <span className="p-1 bg-[#FF6206] text-white rounded-sm shrink-0 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 bg-white text-neutral-400 border border-neutral-200 rounded-sm shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-light text-neutral-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Comparison Table / Banner */}
          {!isCorePlan && (
            <div className="bg-neutral-50 border border-neutral-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-sm shadow-sm">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 text-[#FF6206] font-semibold text-xs uppercase tracking-wider rounded-sm shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6206]" />
                  <span>Why Upgrade to Core?</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-black">Supercharge your link management with 10x higher limits!</h3>
                <p className="text-xs font-light text-neutral-600 max-w-xl leading-relaxed">
                  Join marketing professionals using NanoLink Core for unlimited custom short links, structured QR flyers, and deep UTM traffic insights.
                </p>
              </div>
              <button
                onClick={handleUpgradeClick}
                disabled={processing}
                className="px-6 py-3.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-sm transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Upgrade Now ({currencyMode === 'INR' ? '₹750/mo' : '$9/mo'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Billing History Table per Section 6.10 */}
          <div className="bg-white border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6206]" />
                  <span>Billing History & Invoices</span>
                </h3>
                <p className="text-xs font-light text-neutral-600 mt-0.5">Past Razorpay subscription checkouts and transaction receipts.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs font-normal">
                  {history.map((tx) => (
                    <tr key={tx._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-black">
                        {new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-normal text-neutral-600">{tx.orderId}</td>
                      <td className="py-3.5 px-4 font-mono font-normal text-neutral-600">{tx.paymentId || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-black">
                        {tx.currency === 'INR' ? `₹${tx.amount}` : `$${tx.amount}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 text-[11px] font-medium uppercase rounded-sm ${
                          tx.status === 'paid' ? 'text-emerald-700' : 'text-[#FF6206]'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Invoice receipt for order ${tx.orderId} is being generated.`)}
                          className="text-[#FF6206] hover:text-[#FF6206]/80 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Download</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center font-light text-neutral-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-neutral-200 p-6 space-y-5 rounded-md shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-[#FF6206] flex items-center justify-center shrink-0 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">Downgrade Subscription?</h3>
                <p className="text-xs font-light text-neutral-600">You are about to switch back to the Free tier.</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs font-normal text-black space-y-2 leading-relaxed rounded-sm">
              <p className="font-medium">By downgrading to the Free Plan, you will immediately lose access to:</p>
              <ul className="list-disc list-inside text-neutral-700 font-light space-y-1 pl-1">
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
                className="px-5 py-2 bg-white hover:bg-neutral-100 text-black font-medium border border-neutral-200 text-xs transition-colors cursor-pointer shadow-sm"
              >
                Keep Core Plan
              </button>
              <button
                type="button"
                onClick={handleDowngradeConfirm}
                disabled={processing}
                className="px-5 py-2 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : null}
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
