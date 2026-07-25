import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Link2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart2, 
  QrCode, 
  Check, 
  X, 
  Crown, 
  Globe, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Lock,
  Layers
} from 'lucide-react';

const Home = () => {
  const [inputUrl, setInputUrl] = useState('');
  const { isAuthenticated, storePendingUrl, user } = useAuth();
  const navigate = useNavigate();

  const [limits, setLimits] = useState({
    free: { linksPerMonth: 50, customBackHalvesPerMonth: 5, qrCodesPerMonth: 10, analyticsRetentionDays: 7, utmBuilder: false, qrCustomization: 'basic' },
    core: { linksPerMonth: 100, customBackHalvesPerMonth: null, qrCodesPerMonth: 50, analyticsRetentionDays: 30, utmBuilder: true, qrCustomization: 'advanced' }
  });
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    // Fetch dynamic plan limits from backend per Section 6.2
    axios.get('/api/auth/limits')
      .then(res => {
        if (res.data?.free && res.data?.core) {
          setLimits(res.data);
        }
      })
      .catch(err => console.log('Using default plan limits for homepage pricing display.', err));
  }, []);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl || !inputUrl.trim()) return;

    if (isAuthenticated) {
      storePendingUrl(inputUrl.trim());
      navigate('/dashboard?action=create_link');
    } else {
      // Critical flow Section 4: store URL and redirect to signup
      storePendingUrl(inputUrl.trim());
      navigate('/signup');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Can I upgrade, downgrade, or cancel my Core subscription anytime?',
      a: 'Yes! You can instantly upgrade or downgrade from your Billing Dashboard. If you downgrade, your plan remains active until the end of your current paid billing cycle.'
    },
    {
      q: 'How does QR code tracking work without third-party external APIs?',
      a: 'NanoLink generates high-speed vector QR codes natively on our server using optimized npm libraries (no per-call external costs). Every QR code embeds a trackable short URL that logs visitor clicks in our Redis stream before resolving to your destination.'
    },
    {
      q: 'Do short links or QR codes ever expire?',
      a: 'No! As long as your account remains active and within your monthly tier quota, your shortened links and physical QR codes will route traffic indefinitely.'
    },
    {
      q: 'What payment methods are supported through Razorpay?',
      a: 'We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ Indian banks, and popular wallets via Razorpay.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden selection:bg-orange-500 selection:text-slate-950">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[1200px] left-10 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Bar per Section 6.1 */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-20 sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-orange-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            Nano<span className="text-orange-500">Link</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('qr-studio')} className="hover:text-white transition-colors cursor-pointer">
            QR Studio
          </button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">
            Pricing
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors cursor-pointer">
            FAQ
          </button>
        </nav>

        {/* Right-Side Action Controls per Section 6.1 */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Dashboard ({user?.name?.split(' ')[0]})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2">
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section per Section 6.1 */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-16 pb-24 text-center z-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Modern Link & QR Platform Built for Speed</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Shorten links. Generate QR codes. Track <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">every click</span> in real time.
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The lightning-fast URL shortener and dynamic QR code studio designed for marketing teams and creators. Engineered with sub-millisecond Redis caching.
        </p>

        {/* Instant Link Shortener Input Box (Section 4 Critical Flow Trigger) */}
        <div className="w-full max-w-3xl p-1.5 rounded-2xl bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-orange-500/40 border border-slate-800 shadow-2xl mb-6">
          <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-900 rounded-xl">
            <div className="w-full flex-1 flex items-center gap-3 px-4">
              <Link2 className="w-6 h-6 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste your long URL here (e.g. https://your-brand.com/campaign-launch)..."
                className="w-full bg-transparent border-none text-white placeholder-slate-500 text-base font-medium focus:outline-none focus:ring-0 py-3.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 hover:from-indigo-500 hover:to-orange-400 text-white font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 transform hover:scale-[1.02]"
            >
              <span>Shorten Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> No credit card required</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-orange-400" /> Sub-millisecond routing</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4 text-indigo-400" /> Real-time click stream</span>
        </p>

        {/* Social Proof / Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mt-20 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white">1,000+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Concurrent Users SLA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-orange-400">&lt; 1 ms</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Redis Redirect Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-indigo-400">99.99%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Uptime Guaranteed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-emerald-400">0 API Costs</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Native QR Generation</div>
          </div>
        </div>
      </main>

      {/* Section 1: Features Grid (`#features`) */}
      <section id="features" className="py-24 px-6 bg-slate-900/40 border-t border-slate-900 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Engineered for Performance & Scale</h2>
            <p className="text-slate-400 text-sm md:text-base">Everything you need to run high-converting marketing campaigns without database bottlenecks or external dependencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">In-Memory Redis Routing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our redirect engine caches target URLs and link metadata as atomic payloads in Redis. Cache hits execute with zero MongoDB overhead.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Native QR Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate high-res vector QR codes using optimized server-side libraries. Customize dot patterns, rounded corners, and CTA frame banners.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clicks and QR scans are pushed to a high-speed Redis stream and batch-flushed to MongoDB, providing live device and location insights.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">UTM Campaign Builder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attach UTM source, medium, and campaign parameters directly to your short links to track conversion attribution across ad networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: QR Code Studio Showcase (`#qr-studio`) */}
      <section id="qr-studio" className="py-24 px-6 border-t border-slate-900 z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 lg:max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <span>Dynamic Matrix Generation</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Physical marketing flyers that feel alive.
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Every QR code generated on NanoLink maps directly to an underlying short URL. Update the destination address anytime from your dashboard without ever reprinting your physical flyers.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>Create Your First QR Flyer</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </Link>
            </div>
          </div>

          {/* Sample QR Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 shadow-xl transform rotate-1 hover:rotate-0 transition-transform">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center p-2 shadow-inner">
                <div className="w-full h-full border-4 border-slate-950 rounded-lg flex items-center justify-center font-mono text-xs text-slate-950 font-bold">
                  [QR Matrix]
                </div>
              </div>
              <div className="text-xs font-bold text-slate-300">Classic Midnight</div>
              <div className="text-[10px] text-slate-500 font-mono">Basic Swatch</div>
            </div>

            <div className="p-5 bg-gradient-to-b from-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl text-center space-y-3 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center p-2 shadow-inner">
                <div className="w-full h-full border-4 border-indigo-600 rounded-lg flex items-center justify-center font-mono text-xs text-indigo-600 font-bold">
                  [Scan Me]
                </div>
              </div>
              <div className="text-xs font-bold text-indigo-300">Indigo Frame</div>
              <div className="text-[10px] text-indigo-400/80 font-mono">Core Advanced</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Dynamic Pricing Section (`#pricing`) per Section 6.2 */}
      <section id="pricing" className="py-24 px-6 bg-slate-900/40 border-t border-slate-900 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>Transparent & Predictable Tiers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Choose the plan that scales with you</h2>
            <p className="text-slate-400 text-sm md:text-base">Start for free with zero commitment. Upgrade to Core anytime for enterprise limits and Razorpay-secured billing.</p>
            
            {/* Currency Switcher */}
            <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 mt-6">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 1. Free Plan Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Free Plan</h3>
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold uppercase">Starter</span>
                </div>
                <div className="text-4xl font-black text-white mb-6">
                  {currency === 'INR' ? '₹0' : '$0'}
                  <span className="text-sm font-normal text-slate-500 ml-1.5">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                  Perfect for personal creators testing short URLs and physical QR codes for small community events.
                </p>

                <div className="space-y-4 mb-8 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>{limits.free.linksPerMonth}</strong> Short Links per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>{limits.free.customBackHalvesPerMonth}</strong> Custom Alias Back-Halves</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>{limits.free.qrCodesPerMonth}</strong> QR Codes per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>{limits.free.analyticsRetentionDays} Days</strong> Analytics Retention</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Basic QR Color Customization only</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <X className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>No UTM Campaign Builder</span>
                  </div>
                </div>
              </div>

              <Link
                to="/signup"
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-center text-sm transition-all block"
              >
                Get Started Free
              </Link>
            </div>

            {/* 2. Core Plan Card (Highlighted) */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-amber-500/60 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transform md:-translate-y-2">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-md flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>Most Popular</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span>Core Plan</span>
                  </h3>
                </div>
                <div className="text-4xl font-black text-white mb-6">
                  {currency === 'INR' ? '₹750' : '$9'}
                  <span className="text-sm font-normal text-slate-400 ml-1.5">/ month</span>
                </div>
                <p className="text-xs text-slate-300 mb-8 leading-relaxed">
                  Engineered for marketing professionals and businesses needing unlimited custom aliases and UTM conversion tracking.
                </p>

                <div className="space-y-4 mb-8 text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>{limits.core.linksPerMonth}</strong> Short Links per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Unlimited</strong> Custom Alias Back-Halves</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>{limits.core.qrCodesPerMonth}</strong> High-Res QR Codes per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>{limits.core.analyticsRetentionDays} Days</strong> Analytics Retention & CSV Export</span>
                  </div>
                  <div className="flex items-center gap-3 text-amber-300">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Advanced QR Styling</strong> (Patterns, Corners, Banners)</span>
                  </div>
                  <div className="flex items-center gap-3 text-amber-300">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>UTM Campaign Builder</strong> Unlocked</span>
                  </div>
                </div>
              </div>

              <Link
                to={isAuthenticated ? "/dashboard/billing" : "/signup?plan=core"}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-center text-sm shadow-xl shadow-orange-500/25 transition-all block transform hover:scale-[1.01]"
              >
                {isAuthenticated ? "Upgrade to Core Now" : "Start Core Subscription"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Frequently Asked Questions (`#faq`) */}
      <section id="faq" className="py-24 px-6 border-t border-slate-900 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Everything you need to know about NanoLink quotas, billing, and performance.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left font-bold text-sm md:text-base text-white flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{f.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-orange-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer per Section 6.1 */}
      <footer className="py-12 px-6 bg-slate-950 border-t border-slate-900 z-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center font-bold text-white text-xs">
              N
            </div>
            <span className="font-bold text-slate-300 text-sm">NanoLink</span>
            <span>• Built for high-throughput link management.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-900/60 text-center sm:text-left text-[11px] text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 NanoLink Platform. All rights reserved. Sub-millisecond Redis Routing Architecture.</span>
          <span>Razorpay Payment Partner • Zero External QR API Costs</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
