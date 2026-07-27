import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import StyledQRCode from '../components/common/StyledQRCode';
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
    <div className="min-h-screen bg-white text-black flex flex-col relative overflow-hidden font-light">
      {/* Navigation Bar per Section 6.1 */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-20 sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-[#1A00FF] flex items-center justify-center font-bold text-white text-xl group-hover:scale-105 transition-transform shadow-sm">
            N
          </div>
          <span className="font-bold text-2xl tracking-tight text-black">
            Nano<span className="text-[#FF6206]">Link</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-black">
          <button onClick={() => scrollToSection('features')} className="hover:text-[#1A00FF] transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('qr-studio')} className="hover:text-[#1A00FF] transition-colors cursor-pointer">
            QR Studio
          </button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-[#1A00FF] transition-colors cursor-pointer">
            Pricing
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-[#1A00FF] transition-colors cursor-pointer">
            FAQ
          </button>
        </nav>

        {/* Right-Side Action Controls per Section 6.1 */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-[#FF6206] hover:bg-[#FF6206]/90 font-medium text-sm text-white transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Dashboard ({user?.name?.split(' ')[0]})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-normal text-black hover:text-[#1A00FF] transition-colors px-3 py-2">
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium text-sm transition-all shadow-sm"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section per Section 6.1 */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-20 pb-28 text-center z-10 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-normal uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6206]" />
          <span>The Modern Link & QR Platform Built for Speed</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 max-w-5xl text-black">
          Shorten links. Generate QR codes. Track <span className="text-[#1A00FF]">every click</span> in real time.
        </h1>

        <p className="text-base sm:text-xl font-light text-neutral-600 max-w-3xl mb-12 leading-relaxed">
          The lightning-fast URL shortener and dynamic QR code studio designed for marketing teams and creators. Engineered with sub-millisecond Redis caching.
        </p>

        {/* Instant Link Shortener Input Box (Section 4 Critical Flow Trigger) */}
        <div className="w-full max-w-4xl p-2 bg-neutral-100 border border-neutral-200 mb-6 shadow-sm">
          <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white border border-neutral-200">
            <div className="w-full flex-1 flex items-center gap-3 px-4">
              <Link2 className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste your long URL here (e.g. https://your-brand.com/campaign-launch)..."
                className="w-full bg-transparent border-none text-black placeholder-neutral-400 text-base font-normal focus:outline-none focus:ring-0 py-3.5 px-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-base transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              <span>Shorten Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-xs font-normal text-neutral-500 flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#1A00FF]" /> No credit card required</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#FF6206]" /> Sub-millisecond routing</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4 text-[#1A00FF]" /> Real-time click stream</span>
        </p>

        {/* Social Proof / Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mt-20 p-6 bg-white border border-neutral-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-black">1,000+</div>
            <div className="text-xs text-neutral-500 font-normal uppercase tracking-wider mt-1">Concurrent Users SLA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-black">&lt; 1 ms</div>
            <div className="text-xs text-neutral-500 font-normal uppercase tracking-wider mt-1">Redis Redirect Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-black">99.99%</div>
            <div className="text-xs text-neutral-500 font-normal uppercase tracking-wider mt-1">Uptime Guaranteed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-black">0 API Costs</div>
            <div className="text-xs text-neutral-500 font-normal uppercase tracking-wider mt-1">Native QR Generation</div>
          </div>
        </div>
      </main>

      {/* Section 1: Features Grid (`#features`) */}
      <section id="features" className="py-24 px-6 bg-neutral-50 border-t border-neutral-200 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">Engineered for Performance & Scale</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">Everything you need to run high-converting marketing campaigns without database bottlenecks or external dependencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-neutral-200 transition-all space-y-4 shadow-sm hover:border-neutral-300">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 text-[#FF6206] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black">In-Memory Redis Routing</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Our redirect engine caches target URLs and link metadata as atomic payloads in Redis. Cache hits execute with zero MongoDB overhead.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 transition-all space-y-4 shadow-sm hover:border-neutral-300">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 text-[#FF6206] flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black">Native QR Studio</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Generate high-res vector QR codes using optimized server-side libraries. Customize dot patterns, rounded corners, and CTA frame banners.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 transition-all space-y-4 shadow-sm hover:border-neutral-300">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 text-[#FF6206] flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black">Real-Time Analytics</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Clicks and QR scans are pushed to a high-speed Redis stream and batch-flushed to MongoDB, providing live device and location insights.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 transition-all space-y-4 shadow-sm hover:border-neutral-300">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 text-[#FF6206] flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-black">UTM Campaign Builder</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Attach UTM source, medium, and campaign parameters directly to your short links to track conversion attribution across ad networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: QR Code Studio Showcase (`#qr-studio`) */}
      <section id="qr-studio" className="py-24 px-6 border-t border-neutral-200 z-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 lg:max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 text-[#FF6206] text-xs font-normal uppercase tracking-wider">
              <span>Dynamic Matrix Generation</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-black leading-tight">
              Physical marketing flyers that feel alive.
            </h2>
            <p className="text-neutral-600 font-light text-sm md:text-base leading-relaxed">
              Every QR code generated on NanoLink maps directly to an underlying short URL. Update the destination address anytime from your dashboard without ever reprinting your physical flyers.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="px-6 py-3.5 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Create Your First QR Flyer</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Sample QR Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md">
            <div className="p-5 bg-white border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-36 h-36 bg-white border border-neutral-200 mx-auto flex items-center justify-center p-2.5">
                <StyledQRCode
                  id="home-qr-demo-1"
                  value="https://nanolink.app/demo-free"
                  size={120}
                  fgColor="#1A00FF"
                  bgColor="#FFFFFF"
                  level="M"
                  pattern="rounded"
                  cornerStyle="extra-rounded"
                />
              </div>
              <div className="text-xs font-semibold text-black">Classic Midnight</div>
              <div className="text-[10px] text-neutral-500 font-mono font-normal">Rounded Swatch</div>
            </div>

            <div className="p-5 bg-white border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-36 h-36 bg-white border border-neutral-200 mx-auto flex flex-col items-center justify-between p-2">
                <div className="flex-1 flex items-center justify-center">
                  <StyledQRCode
                    id="home-qr-demo-2"
                    value="https://nanolink.app/demo-core"
                    size={96}
                    fgColor="#FF6206"
                    bgColor="#FFFFFF"
                    level="Q"
                    pattern="dots"
                    cornerStyle="dot"
                  />
                </div>
                <div className="w-full bg-[#FF6206] text-white text-[9px] font-bold uppercase tracking-wider py-0.5 mt-1">
                  SCAN ME
                </div>
              </div>
              <div className="text-xs font-semibold text-black">Orange Frame</div>
              <div className="text-[10px] text-neutral-500 font-mono font-normal">Core Advanced</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Dynamic Pricing Section (`#pricing`) per Section 6.2 */}
      <section id="pricing" className="py-24 px-6 bg-neutral-50 border-t border-neutral-200 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 text-[#FF6206] text-xs font-normal uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>Transparent & Predictable Tiers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">Choose the plan that scales with you</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">Start for free with zero commitment. Upgrade to Core anytime for enterprise limits and Razorpay-secured billing.</p>

            {/* Currency Switcher */}
            <div className="inline-flex items-center bg-white border border-neutral-200 p-1 mt-6 shadow-sm">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#FF6206] text-white shadow-sm' : 'text-black hover:bg-neutral-100'}`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${currency === 'USD' ? 'bg-[#FF6206] text-white shadow-sm' : 'text-black hover:bg-neutral-100'}`}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 1. Free Plan Card */}
            <div className="bg-white border border-neutral-200 p-8 flex flex-col justify-between relative shadow-sm hover:border-neutral-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black">Free Plan</h3>
                  <span className="px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-normal uppercase">Starter</span>
                </div>
                <div className="text-4xl font-bold text-black mb-6">
                  {currency === 'INR' ? '₹0' : '$0'}
                  <span className="text-sm font-light text-neutral-500 ml-1.5">/ month</span>
                </div>
                <p className="text-xs font-light text-neutral-600 mb-8 leading-relaxed">
                  Perfect for personal creators testing short URLs and physical QR codes for small community events.
                </p>

                <div className="space-y-4 mb-8 text-xs font-normal text-black">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#FF6206] shrink-0" />
                    <span><strong className="font-semibold">{limits.free.linksPerMonth}</strong> Short Links per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#FF6206] shrink-0" />
                    <span><strong className="font-semibold">{limits.free.customBackHalvesPerMonth}</strong> Custom Alias Back-Halves</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#FF6206] shrink-0" />
                    <span><strong className="font-semibold">{limits.free.qrCodesPerMonth}</strong> QR Codes per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#FF6206] shrink-0" />
                    <span><strong className="font-semibold">{limits.free.analyticsRetentionDays} Days</strong> Analytics Retention</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <X className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Basic QR Color Customization only</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <X className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>No UTM Campaign Builder</span>
                  </div>
                </div>
              </div>

              <Link
                to="/signup"
                className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black font-medium text-center text-sm transition-all block shadow-sm"
              >
                Get Started Free
              </Link>
            </div>

            {/* 2. Core Plan Card (Highlighted) */}
            <div className="bg-white border-2 border-[#1A00FF] p-8 flex flex-col justify-between relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 bg-[#1A00FF] text-white text-[11px] font-medium uppercase tracking-wider py-1 px-4 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>Most Popular</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black flex items-center gap-2">
                    <span>Core Plan</span>
                  </h3>
                </div>
                <div className="text-4xl font-bold text-black mb-6">
                  {currency === 'INR' ? '₹750' : '$9'}
                  <span className="text-sm font-light text-neutral-500 ml-1.5">/ month</span>
                </div>
                <p className="text-xs font-light text-neutral-600 mb-8 leading-relaxed">
                  Engineered for marketing professionals and businesses needing unlimited custom aliases and UTM conversion tracking.
                </p>

                <div className="space-y-4 mb-8 text-xs font-normal text-black">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1A00FF] shrink-0" />
                    <span><strong className="font-semibold">{limits.core.linksPerMonth}</strong> Short Links per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1A00FF] shrink-0" />
                    <span><strong className="font-semibold">Unlimited</strong> Custom Alias Back-Halves</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1A00FF] shrink-0" />
                    <span><strong className="font-semibold">{limits.core.qrCodesPerMonth}</strong> High-Res QR Codes per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#1A00FF] shrink-0" />
                    <span><strong className="font-semibold">{limits.core.analyticsRetentionDays} Days</strong> Analytics Retention & CSV Export</span>
                  </div>
                  <div className="flex items-center gap-3 text-black">
                    <Check className="w-4 h-4 text-[#1A00FF] shrink-0" />
                    <span><strong className="font-semibold">Advanced QR Styling</strong> (Patterns, Corners, Banners)</span>
                  </div>
                  <div className="flex items-center gap-3 text-black">
                    <Check className="w-4 h-4 text-[#1A00FF] shrink-0" />
                    <span><strong className="font-semibold">UTM Campaign Builder</strong> Unlocked</span>
                  </div>
                </div>
              </div>

              <Link
                to={isAuthenticated ? "/dashboard/billing" : "/signup?plan=core"}
                className="w-full py-3.5 bg-[#1A00FF] hover:bg-[#1A00FF]/90 text-white font-medium text-center text-sm transition-all block shadow-sm"
              >
                {isAuthenticated ? "Upgrade to Core Now" : "Start Core Subscription"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Frequently Asked Questions (`#faq`) */}
      <section id="faq" className="py-24 px-6 bg-white border-t border-neutral-200 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">Frequently Asked Questions</h2>
            <p className="text-neutral-600 font-light text-sm">Everything you need to know about NanoLink quotas, billing, and performance.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="bg-white border border-neutral-200 transition-colors shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-5 text-left font-semibold text-sm md:text-base text-black flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{f.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-[#FF6206] shrink-0" /> : <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs md:text-sm font-light text-neutral-600 leading-relaxed border-t border-neutral-200 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer per Section 6.1 */}
      <footer className="py-12 px-6 bg-white border-t border-neutral-200 z-10 text-xs text-black">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A00FF] flex items-center justify-center font-bold text-white text-xs shadow-sm">
              N
            </div>
            <span className="font-bold text-black text-sm">NanoLink</span>
            <span className="font-light text-neutral-500">• Built for high-throughput link management.</span>
          </div>

          <div className="flex items-center gap-6 font-normal text-black">
            <a href="#features" className="hover:text-[#1A00FF] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#1A00FF] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#1A00FF] transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-[#1A00FF] transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-200 text-center sm:text-left text-[11px] font-light text-neutral-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 NanoLink Platform. All rights reserved. Sub-millisecond Redis Routing Architecture.</span>
          <span>Razorpay Payment Partner • Zero External QR API Costs</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
