import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StyledQRCode from '../components/common/StyledQRCode';
import Logo from '../components/common/Logo';
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
  Layers,
  Activity,
  Shield,
  Server,
  TrendingUp,
  Award,
  Terminal,
  Cpu,
  Smartphone,
  Users,
  CheckCircle2,
  ArrowUpRight,
  PieChart,
  Globe2,
  MousePointerClick,
  ExternalLink,
  Eye,
  Repeat,
  Radio,
  Star
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

  const [demoQrType, setDemoQrType] = useState('forest'); // 'forest' | 'emerald' | 'dots' | 'minimal'
  const [activeTab, setActiveTab] = useState('speed'); // 'speed' | 'security' | 'analytics' | 'qr'
  const [simulatedClicks, setSimulatedClicks] = useState(14289);
  const [simulatedLatency, setSimulatedLatency] = useState('0.38');

  useEffect(() => {
    axios.get('/api/auth/limits')
      .then(res => {
        if (res.data?.free && res.data?.core) {
          setLimits(res.data);
        }
      })
      .catch(err => console.log('Using default plan limits.', err));

    const interval = setInterval(() => {
      setSimulatedClicks(prev => prev + Math.floor(Math.random() * 3) + 1);
      setSimulatedLatency((0.35 + Math.random() * 0.08).toFixed(2));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl || !inputUrl.trim()) return;

    if (isAuthenticated) {
      storePendingUrl(inputUrl.trim());
      navigate('/dashboard?action=create_link');
    } else {
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
      q: 'Why should I trust NanoLink over generic free link shorteners?',
      a: 'NanoLink is built on an enterprise-grade Redis in-memory caching architecture that guarantees sub-millisecond redirect speeds and 99.99% uptime. Unlike generic shorteners that sell your visitor data or inject third-party ad scripts, NanoLink processes all redirects and vector QR codes natively on our servers with zero external tracking or data leaks.'
    },
    {
      q: 'Can I upgrade, downgrade, or cancel my Core subscription anytime?',
      a: 'Yes! You can instantly upgrade or downgrade from your Billing Dashboard. We partner with Razorpay for secure Indian and global billing. If you downgrade, your plan remains active until the end of your current paid billing cycle.'
    },
    {
      q: 'How does QR code tracking work without third-party external APIs?',
      a: 'NanoLink generates high-speed vector QR codes natively on our server using optimized npm libraries (no per-call external costs or privacy leaks). Every QR code embeds a trackable short URL that logs visitor clicks in our Redis stream before instantly resolving to your destination.'
    },
    {
      q: 'Do short links or QR codes ever expire?',
      a: 'No! As long as your account remains active and within your monthly tier quota, your shortened links and physical QR codes will route traffic indefinitely without any broken redirects.'
    },
    {
      q: 'What are custom back-halves and aliases?',
      a: 'A custom back-half (alias) replaces random character strings with your brand or campaign name (e.g., nano.link/spring-sale instead of nano.link/x8z9q). Free users get 5 custom back-halves monthly, while Core subscribers get unlimited custom branding!'
    },
    {
      q: 'What payment methods are supported through Razorpay?',
      a: 'We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ Indian banks, and popular wallets via Razorpay with 256-bit SSL encryption.'
    },
    {
      q: 'Can I export my analytics and click data?',
      a: 'Yes! Core plan subscribers can download full historical analytics reports, including device types, browsers, operating systems, and geographic visitor breakdowns as clean CSV files for client presentations or campaign audits.'
    }
  ];

  const getDemoQrConfig = () => {
    switch (demoQrType) {
      case 'emerald':
        return { fgColor: '#059669', bgColor: '#FFFFFF', pattern: 'dots', cornerStyle: 'dot', label: 'Emerald Dot Matrix', level: 'Q' };
      case 'dots':
        return { fgColor: '#166534', bgColor: '#FFFFFF', pattern: 'dots', cornerStyle: 'extra-rounded', label: 'Forest Green Dots', level: 'M' };
      case 'minimal':
        return { fgColor: '#111827', bgColor: '#FFFFFF', pattern: 'squares', cornerStyle: 'square', label: 'Minimal Clean Square', level: 'H' };
      case 'forest':
      default:
        return { fgColor: '#166534', bgColor: '#FFFFFF', pattern: 'rounded', cornerStyle: 'extra-rounded', label: 'Classic Forest Green', level: 'M' };
    }
  };

  const demoQr = getDemoQrConfig();

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col relative overflow-hidden font-light selection:bg-green-700 selection:text-white">
      {/* Top Live Ticker Banner */}
      <div className="bg-neutral-100 text-neutral-700 py-2 px-4 text-xs font-mono border-b border-neutral-200 flex items-center justify-between overflow-hidden z-30">
        <div className="flex items-center gap-2 text-green-700 shrink-0 font-bold tracking-wider">
          <span className="w-2 h-2 bg-green-700 rounded-full inline-block" />
          <span>LIVE CLUSTERS:</span>
        </div>
        <div className="ticker-wrap w-full ml-4">
          <div className="ticker-move flex items-center gap-12 font-normal text-neutral-600">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-green-700" /> Redis Cluster Cache Latency: <strong className="text-neutral-900 font-bold">{simulatedLatency} ms</strong></span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-700" /> SOC2 Type II Architecture & Bank-Grade SSL</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-green-700" /> <strong className="text-green-700 font-bold">{simulatedClicks.toLocaleString()}</strong> Clicks Processed Today</span>
            <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-green-700" /> 99.99% Guaranteed Enterprise SLA Uptime</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-700" /> Zero External QR API Tracking or Data Leaks</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-green-700" /> Razorpay 256-Bit Encrypted Indian & Global Billing</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-green-700" /> Redis Cluster Cache Latency: <strong className="text-neutral-900 font-bold">{simulatedLatency} ms</strong></span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-700" /> SOC2 Type II Architecture & Bank-Grade SSL</span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="w-full sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-neutral-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-green-700 transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-green-700 transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('qr-studio')} className="hover:text-green-700 transition-colors cursor-pointer">
              QR Studio
            </button>
            <button onClick={() => scrollToSection('comparison')} className="hover:text-green-700 transition-colors cursor-pointer">
              Compare
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-green-700 transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-green-700 transition-colors cursor-pointer">
              FAQ
            </button>
          </nav>

          {/* Right-Side Action Controls */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-green-700 hover:bg-green-800 font-medium text-sm text-white rounded-lg transition-all flex items-center gap-2"
              >
                <span>Dashboard ({user?.name?.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-normal text-neutral-600 hover:text-green-700 transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium text-sm rounded-lg transition-all"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-16 pb-24 text-center z-10 max-w-7xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-normal uppercase tracking-wider mb-8 rounded-full">
          <Sparkles className="w-4 h-4 text-green-700" />
          <span>The Trusted High-Speed Link & Dynamic QR Platform</span>
          <span className="bg-green-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-1">v3.8 LIVE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 max-w-5xl text-neutral-900">
          Shorten links. Generate QR codes. Track <span className="text-green-700">every click</span> in real time.
        </h1>

        <p className="text-base sm:text-xl font-light text-neutral-600 max-w-3xl mb-10 leading-relaxed">
          The enterprise-grade URL shortener and dynamic QR code studio designed for high-growth brands, marketing teams, and creators. Engineered with sub-millisecond Redis in-memory caching and Razorpay-secured Indian billing.
        </p>

        {/* Instant Link Shortener Input Box */}
        <div className="w-full max-w-4xl p-2.5 bg-white border border-neutral-200 rounded-xl mb-8">
          <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="w-full flex-1 flex items-center gap-3 px-4">
              <Link2 className="w-5 h-5 text-green-700 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste your long destination URL here (e.g. https://your-brand.com/campaign-launch)..."
                className="w-full bg-transparent border-none text-neutral-900 placeholder-neutral-400 text-base font-normal focus:outline-none focus:ring-0 py-3.5 px-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-semibold text-base rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Shorten & Track Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="text-xs font-normal text-neutral-500 flex flex-wrap items-center justify-center gap-6 mb-16">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-700" /> No credit card required</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-green-700" /> {simulatedLatency} ms Redis routing</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4 text-green-700" /> Real-time click stream</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-green-700" /> 256-Bit SSL Encrypted</span>
        </div>

        {/* Hero Interactive Illustration Mockup Card */}
        <div className="w-full max-w-5xl p-6 bg-white text-neutral-900 border border-neutral-200 rounded-xl text-left relative overflow-hidden group">
          {/* Mockup Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
              </div>
              <span className="text-xs font-mono text-neutral-500 border-l border-neutral-200 pl-3 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-green-700" />
                <span>nanolink-core-engine-v3.8 // live-cluster-stream</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-700" />
                REDIS IN-MEMORY CLUSTER: ACTIVE
              </span>
              <span className="text-neutral-500 hidden md:inline">THROUGHPUT: <strong className="text-neutral-900">14,800 req/sec</strong></span>
            </div>
          </div>
          
          {/* Simulated Live Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>LIVE TRAFFIC VOLUME</span>
                <Activity className="w-4 h-4 text-green-700" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 font-mono flex items-baseline gap-2">
                <span>{simulatedClicks.toLocaleString()}</span>
                <span className="text-xs text-green-700 font-normal flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +24.8%
                </span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-green-700 h-full w-[78%] rounded-full" />
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>REDIS CACHE LATENCY</span>
                <Zap className="w-4 h-4 text-green-700" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 font-mono flex items-baseline gap-2">
                <span>{simulatedLatency} ms</span>
                <span className="text-xs text-neutral-500 font-normal">Sub-millisecond</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">0 MongoDB Read Bottlenecks</div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>GLOBAL GEO-ROUTING</span>
                <Globe2 className="w-4 h-4 text-green-700" />
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <span className="px-2.5 py-0.5 bg-green-100 text-green-800 border border-green-200 rounded-full font-semibold">IN 42%</span>
                <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-full font-semibold">US 31%</span>
                <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-full">EU 18%</span>
                <span className="px-2.5 py-0.5 bg-neutral-200 text-neutral-700 rounded-full">ROW 9%</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono pt-1">24/7 Anycast CDN Edge Distribution</div>
            </div>
          </div>

          {/* Simulated Live Link Activity Stream */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 font-mono text-xs space-y-2">
            <div className="text-neutral-500 text-[10px] uppercase font-semibold pb-2 border-b border-neutral-200 flex items-center justify-between">
              <span>RECENT CLICK STREAM (REAL-TIME REDIS STREAM)</span>
              <span className="text-green-700 flex items-center gap-1 font-semibold">● SYNCING</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-neutral-200 text-neutral-700 gap-2">
              <span className="text-green-700 font-bold">nano.link/summer-fest-26</span>
              <span className="text-neutral-500 truncate max-w-xs">→ https://festival-tickets-portal.in/checkout...</span>
              <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] text-neutral-500 border border-neutral-200">New Delhi, IN • iOS Safari • {simulatedLatency}ms</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-neutral-200 text-neutral-700 gap-2">
              <span className="text-green-700 font-bold">nano.link/ai-summit-qr</span>
              <span className="text-neutral-500 truncate max-w-xs">→ https://tech-summit-global.org/speakers/ajay...</span>
              <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] text-neutral-500 border border-neutral-200">Bangalore, IN • Android Chrome • 0.39ms</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 text-neutral-700 gap-2">
              <span className="text-green-700 font-bold">nano.link/vip-pass</span>
              <span className="text-neutral-500 truncate max-w-xs">→ https://exclusive-access.com/login?token=89a7...</span>
              <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] text-neutral-500 border border-neutral-200">Mumbai, IN • Desktop Edge • 0.36ms</span>
            </div>
          </div>
        </div>

        {/* Social Proof Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mt-16 p-6 bg-white border border-neutral-200 rounded-xl">
          <div className="text-center border-r border-neutral-200 last:border-r-0">
            <div className="text-2xl md:text-4xl font-bold text-neutral-900 font-mono">50,000+</div>
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Active Short Links</div>
          </div>
          <div className="text-center border-r border-neutral-200 last:border-r-0">
            <div className="text-2xl md:text-4xl font-bold text-green-700 font-mono">&lt; 1 ms</div>
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Redis Redirect Latency</div>
          </div>
          <div className="text-center border-r border-neutral-200 last:border-r-0">
            <div className="text-2xl md:text-4xl font-bold text-green-700 font-mono">99.99%</div>
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Uptime Guaranteed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-bold text-green-700 font-mono">₹0 API Costs</div>
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Native Server Vector Engine</div>
          </div>
        </div>
      </main>

      {/* Section: Why Top Teams Trust NanoLink */}
      <section className="py-24 px-6 bg-neutral-50 border-t border-b border-neutral-200 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-neutral-200 text-green-700 text-xs font-mono uppercase tracking-wider mb-4 rounded-full">
              <Shield className="w-4 h-4" />
              <span>Enterprise Trust & Architecture Standards</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">Why high-velocity engineering & marketing teams choose us</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base leading-relaxed">
              Generic link shorteners treat your URLs as disposable redirects. NanoLink treats your links as critical business infrastructure with zero third-party tracking risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 hover:border-green-700 transition-all group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Bank-Grade Encryption</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                All visitor requests and management sessions are encrypted via 256-Bit TLS 1.3 SSL. Your campaign data is isolated in secure MongoDB collections.
              </p>
              <div className="pt-2 border-t border-neutral-200 text-[11px] font-mono text-green-700 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> SOC2 Type II Aligned
              </div>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 hover:border-green-700 transition-all group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Zero External API Costs</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                We generate high-resolution vector QR codes natively on our server using optimized npm libraries. No third-party data leaks, no per-call API billing surprises.
              </p>
              <div className="pt-2 border-t border-neutral-200 text-[11px] font-mono text-green-700 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Native Vector Engine
              </div>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 hover:border-green-700 transition-all group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Sub-Millisecond Routing</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                When a user clicks your short link, our Redis in-memory cache resolves the destination in under 0.5ms without touching MongoDB database disk storage.
              </p>
              <div className="pt-2 border-t border-neutral-200 text-[11px] font-mono text-green-700 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Database Bottlenecks
              </div>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 hover:border-green-700 transition-all group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">99.99% Uptime Guarantee</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Redundant geo-distributed Anycast CDN nodes ensure your short URLs and QR codes never go down during massive product launches or flash sales.
              </p>
              <div className="pt-2 border-t border-neutral-200 text-[11px] font-mono text-green-700 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Automated Failover
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How It Works in 3 Simple Steps */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-b border-neutral-200 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono uppercase tracking-wider mb-3 rounded-full">
              <span>Seamless Workflow Architecture</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">How NanoLink powers your campaigns in 3 simple steps</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">Go from a raw, messy destination URL to a branded, trackable marketing powerhouse in under 10 seconds.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Step 1 Card */}
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between relative group hover:-translate-y-1 transition-all">
              <div className="absolute top-6 right-6 text-4xl font-black font-mono text-neutral-200 group-hover:text-green-700/20 transition-colors">
                01
              </div>
              <div>
                <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold mb-6">
                  <Link2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">1. Paste & Shorten</h3>
                <p className="text-xs font-light text-neutral-600 leading-relaxed mb-6">
                  Paste any long destination address. Customize the back-half alias with your brand name (e.g., <code className="text-green-700 font-mono font-semibold">nano.link/summer-sale</code>) and attach UTM parameters for instant Google Analytics attribution.
                </p>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono space-y-2">
                <div className="text-neutral-500 text-[10px] uppercase">Input Long Address:</div>
                <div className="bg-neutral-50 p-2 text-neutral-600 truncate border border-neutral-200 rounded-md">
                  https://mystore.com/products/sale?utm_campaign=summer...
                </div>
                <div className="flex items-center justify-center py-1 text-green-700 font-bold text-[11px]">
                  ↓ AUTOMATIC ALIAS TRIM ↓
                </div>
                <div className="bg-green-50 p-2 text-green-800 font-bold border border-green-200 rounded-md flex items-center justify-between">
                  <span>nano.link/summer-sale</span>
                  <Check className="w-4 h-4 text-green-700" />
                </div>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between relative group hover:-translate-y-1 transition-all">
              <div className="absolute top-6 right-6 text-4xl font-black font-mono text-neutral-200 group-hover:text-green-700/20 transition-colors">
                02
              </div>
              <div>
                <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold mb-6">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">2. Customize QR Matrix</h3>
                <p className="text-xs font-light text-neutral-600 leading-relaxed mb-6">
                  With a single click, generate a high-resolution vector QR code linked directly to your short URL. Customize dot patterns, rounded corner squares, foreground swatches, and scan CTA frame banners.
                </p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-lg flex items-center justify-between gap-4">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0 border border-neutral-200">
                  <StyledQRCode
                    id="step-2-qr-illustrate"
                    value="https://nanolink.app/step-2"
                    size={64}
                    fgColor="#166534"
                    bgColor="#FFFFFF"
                    pattern="dots"
                    cornerStyle="dot"
                  />
                </div>
                <div className="flex-1 space-y-2 text-[11px] font-mono text-neutral-700">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                    <span>PATTERN:</span>
                    <span className="font-bold text-green-700">DOTS MATRIX</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
                    <span>CORNER:</span>
                    <span className="font-bold text-green-700">ROUNDED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>EXPORT:</span>
                    <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full text-[9px] font-bold">SVG / PNG</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between relative group hover:-translate-y-1 transition-all">
              <div className="absolute top-6 right-6 text-4xl font-black font-mono text-neutral-200 group-hover:text-green-700/20 transition-colors">
                03
              </div>
              <div>
                <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">3. Track & Optimize</h3>
                <p className="text-xs font-light text-neutral-600 leading-relaxed mb-6">
                  Monitor live scan and click streams in real time. Gain actionable demographic intelligence including geographic visitor locations, mobile OS breakdowns, and top referring browsers.
                </p>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-neutral-200 text-neutral-700">
                  <span>LIVE CONVERSIONS</span>
                  <span className="text-green-700">● 100% SYNCED</span>
                </div>
                <div className="space-y-1.5 pt-1 text-neutral-700">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5"><span>iOS Safari (Mobile)</span> <strong className="text-green-700">58%</strong></div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden"><div className="bg-green-700 h-full w-[58%] rounded-full" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5"><span>Android Chrome</span> <strong className="text-green-700">32%</strong></div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden"><div className="bg-green-700 h-full w-[32%] rounded-full" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5"><span>Desktop Windows</span> <strong className="text-green-700">10%</strong></div>
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden"><div className="bg-green-700 h-full w-[10%] rounded-full" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Features Grid (`#features`) */}
      <section id="features" className="py-24 px-6 bg-neutral-50 border-b border-neutral-200 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">Engineered for Performance & Scale</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">Everything you need to run high-converting marketing campaigns without database bottlenecks or external dependencies.</p>
            
            {/* Interactive Feature Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setActiveTab('speed')}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border flex items-center gap-2 ${activeTab === 'speed' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Redis Speed Architecture</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border flex items-center gap-2 ${activeTab === 'security' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bank-Grade Security</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Real-Time Stream Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border flex items-center gap-2 ${activeTab === 'qr' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Native Vector QR Studio</span>
              </button>
            </div>
          </div>

          {/* Dynamic Featured Panel Based on Tab */}
          <div className="p-8 bg-white border border-neutral-200 rounded-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
            {activeTab === 'speed' && (
              <>
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full font-mono text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" /> 0.38ms AVERAGE HIT LATENCY
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">In-Memory Redis Routing Architecture</h3>
                  <p className="text-sm font-light text-neutral-600 leading-relaxed">
                    When visitors click your short links, reading from a traditional relational or document database creates immense latency bottlenecks during traffic spikes. NanoLink caches every target URL and tracking rule in an atomic Redis cluster in-memory cache.
                  </p>
                  <ul className="space-y-2 text-xs font-normal text-neutral-700 pt-2 font-mono">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> 10,000+ Concurrent redirect capacity per node</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Asynchronous MongoDB batch logging</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Zero redirect downtime during database backups</li>
                  </ul>
                </div>
                <div className="w-full md:w-96 p-6 bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-lg font-mono text-xs space-y-3">
                  <div className="text-neutral-500 pb-2 border-b border-neutral-200 flex justify-between">
                    <span>REDIS CLUSTER MONITOR</span>
                    <span className="text-green-700 font-semibold">● HEALTHY</span>
                  </div>
                  <div className="bg-white p-3 border border-neutral-200 rounded-md space-y-1">
                    <div className="text-neutral-500">GET /nano.link/summer-sale</div>
                    <div className="text-green-700 font-semibold">→ CACHE HIT: 0.38ms (200 OK)</div>
                  </div>
                  <div className="bg-white p-3 border border-neutral-200 rounded-md space-y-1">
                    <div className="text-neutral-500">HINCRBY link:stats:clicks 1</div>
                    <div className="text-green-700 font-semibold">→ STREAM PUSHED IN 0.12ms</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full font-mono text-xs font-bold">
                    <Shield className="w-3.5 h-3.5" /> SOC2 TYPE II & RAZORPAY COMPLIANT
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">Bank-Grade Privacy & Razorpay Secured Billing</h3>
                  <p className="text-sm font-light text-neutral-600 leading-relaxed">
                    We never inject third-party ad scripts, affiliate cookies, or external tracking tags into your destination URLs. Your corporate data and billing details are protected by 256-bit SSL encryption and Razorpay's PCI-DSS Level 1 compliant gateway.
                  </p>
                  <ul className="space-y-2 text-xs font-normal text-neutral-700 pt-2 font-mono">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> 256-Bit TLS 1.3 End-to-End Encryption</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Isolated MongoDB tenant database collections</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> UPI, Credit Card & Net Banking via Razorpay</li>
                  </ul>
                </div>
                <div className="w-full md:w-96 p-6 bg-neutral-50 border border-neutral-200 rounded-lg space-y-4 text-center">
                  <div className="w-14 h-14 bg-green-700 text-white rounded-xl flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="font-bold text-neutral-900 text-base">Verified Razorpay Gateway</div>
                  <p className="text-xs text-neutral-600 font-light">
                    Seamlessly pay in INR (₹) via UPI, Google Pay, PhonePe, or cards without international transaction fees.
                  </p>
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md font-mono text-[11px] font-bold text-green-800">
                    PCI-DSS LEVEL 1 CERTIFIED
                  </div>
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <>
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full font-mono text-xs font-bold">
                    <BarChart2 className="w-3.5 h-3.5" /> REAL-TIME REDIS CLICK STREAM
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">Live Visitor Stream & Demographic Insights</h3>
                  <p className="text-sm font-light text-neutral-600 leading-relaxed">
                    Every link click and QR scan is pushed directly to an asynchronous Redis stream before batch-saving to MongoDB. You get instant visibility into visitor countries, referring social platforms, browsers, and mobile operating systems.
                  </p>
                  <ul className="space-y-2 text-xs font-normal text-neutral-700 pt-2 font-mono">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Live geographic country & city mapping</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Device OS breakdown (iOS, Android, Windows, Mac)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> One-click CSV export for marketing reports</li>
                  </ul>
                </div>
                <div className="w-full md:w-96 p-5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                  <div className="text-xs font-bold text-neutral-900 pb-2 border-b border-neutral-200 flex justify-between">
                    <span>LIVE CAMPAIGN BREAKDOWN</span>
                    <span className="text-green-700 font-mono">100% SYNC</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between bg-white p-2.5 border border-neutral-200 rounded-md text-neutral-700">
                      <span>📱 Mobile iOS / Android</span>
                      <strong className="text-green-700">84.2%</strong>
                    </div>
                    <div className="flex justify-between bg-white p-2.5 border border-neutral-200 rounded-md text-neutral-700">
                      <span>💻 Desktop Mac / Win</span>
                      <strong className="text-green-700">15.8%</strong>
                    </div>
                    <div className="flex justify-between bg-white p-2.5 border border-neutral-200 rounded-md text-neutral-700">
                      <span>🌐 Top Referrer: Instagram</span>
                      <strong className="text-green-700">62.0%</strong>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'qr' && (
              <>
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full font-mono text-xs font-bold">
                    <QrCode className="w-3.5 h-3.5" /> 100% NATIVE SERVER VECTOR GENERATION
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">Native Server Vector QR Code Studio</h3>
                  <p className="text-sm font-light text-neutral-600 leading-relaxed">
                    Unlike free online QR generators that rely on external third-party API endpoints (which often break or inject adware), NanoLink renders clean vector matrices natively using server-side libraries.
                  </p>
                  <ul className="space-y-2 text-xs font-normal text-neutral-700 pt-2 font-mono">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Zero external API calls or privacy leaks</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Infinite scalability vector SVG & PNG exports</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-700" /> Dynamic redirection without reprinting physical flyers</li>
                  </ul>
                </div>
                <div className="w-full md:w-96 p-6 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col items-center justify-center space-y-3">
                  <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center border border-neutral-200">
                    <StyledQRCode
                      id="tab-qr-demo"
                      value="https://nanolink.app/native-studio"
                      size={110}
                      fgColor="#166534"
                      bgColor="#FFFFFF"
                      pattern="rounded"
                      cornerStyle="extra-rounded"
                    />
                  </div>
                  <div className="font-bold text-xs font-mono uppercase text-neutral-700">Vector SVG Matrix Generated</div>
                </div>
              </>
            )}
          </div>

          {/* 4 Feature Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-neutral-200 rounded-xl transition-all space-y-4 hover:border-green-700 group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">In-Memory Redis Routing</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Our redirect engine caches target URLs and link metadata as atomic payloads in Redis. Cache hits execute with zero MongoDB overhead.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl transition-all space-y-4 hover:border-green-700 group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Native QR Studio</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Generate high-res vector QR codes using optimized server-side libraries. Customize dot patterns, rounded corners, and CTA frame banners.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl transition-all space-y-4 hover:border-green-700 group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Real-Time Analytics</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Clicks and QR scans are pushed to a high-speed Redis stream and batch-flushed to MongoDB, providing live device and location insights.
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-xl transition-all space-y-4 hover:border-green-700 group">
              <div className="w-12 h-12 bg-green-700 rounded-lg text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">UTM Campaign Builder</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Attach UTM source, medium, and campaign parameters directly to your short links to track conversion attribution across ad networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: QR Code Studio Interactive Showcase (`#qr-studio`) */}
      <section id="qr-studio" className="py-24 px-6 border-b border-neutral-200 z-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 lg:max-w-lg text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 border border-neutral-200 text-green-700 text-xs font-mono uppercase tracking-wider rounded-full">
              <span>Interactive QR Matrix Customizer</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
              Physical marketing flyers that feel alive.
            </h2>
            <p className="text-neutral-600 font-light text-sm md:text-base leading-relaxed">
              Every QR code generated on NanoLink maps directly to an underlying short URL. Update the destination address anytime from your dashboard without ever reprinting your physical flyers or banners.
            </p>
            
            {/* Interactive Demo Swatch Switcher */}
            <div className="pt-2 space-y-3">
              <div className="text-xs font-bold text-neutral-700 font-mono uppercase">CLICK TO SWITCH LIVE PREVIEW STYLE:</div>
              <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                <button
                  onClick={() => setDemoQrType('forest')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${demoQrType === 'forest' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Forest Green
                </button>
                <button
                  onClick={() => setDemoQrType('emerald')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${demoQrType === 'emerald' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Emerald Dot
                </button>
                <button
                  onClick={() => setDemoQrType('dots')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${demoQrType === 'dots' ? 'bg-green-700 text-white border-green-700' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Green Dots
                </button>
                <button
                  onClick={() => setDemoQrType('minimal')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${demoQrType === 'minimal' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  Minimal Black
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="px-6 py-3.5 bg-green-700 hover:bg-green-800 text-white font-medium text-sm rounded-lg transition-all flex items-center gap-2"
              >
                <span>Create Your First QR Flyer</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Interactive QR Demo Preview Card */}
          <div className="w-full max-w-md p-6 bg-neutral-50 border border-neutral-200 rounded-xl relative text-center space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500 border-b border-neutral-200 pb-3">
              <span className="flex items-center gap-2 text-neutral-900 font-bold">
                <Radio className="w-4 h-4 text-green-700 animate-pulse" />
                <span>LIVE QR MATRIX PREVIEW</span>
              </span>
              <span className="bg-green-100 text-green-800 border border-green-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">VECTOR SVG</span>
            </div>

            <div className="p-8 bg-white rounded-xl mx-auto w-fit relative overflow-hidden border border-neutral-200 group">
              <StyledQRCode
                id="home-interactive-qr-demo"
                value="https://nanolink.app/live-demo"
                size={200}
                fgColor={demoQr.fgColor}
                bgColor={demoQr.bgColor}
                level={demoQr.level}
                pattern={demoQr.pattern}
                cornerStyle={demoQr.cornerStyle}
              />
            </div>

            <div className="text-neutral-900 space-y-1">
              <div className="text-sm font-bold font-mono text-green-700">{demoQr.label}</div>
              <p className="text-xs text-neutral-500 font-light">
                Target URL: <code className="text-green-700 font-mono bg-white px-2 py-0.5 rounded font-bold border border-neutral-200">nano.link/live-demo</code>
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-around text-[11px] font-mono text-neutral-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> Vector SVG Export</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-700" /> Dynamic Redirects</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Comparison Table (`#comparison`) */}
      <section id="comparison" className="py-24 px-6 bg-neutral-50 border-b border-neutral-200 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-mono uppercase tracking-wider mb-3 rounded-full">
              <span>Transparent Architectural Comparison</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">Why NanoLink outperforms legacy URL tools</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">See how our sub-millisecond Redis routing and native vector QR studio stack up against generic shorteners.</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700 font-mono uppercase border-b border-neutral-200">
                  <th className="p-5 border-r border-neutral-200">Feature / Architecture</th>
                  <th className="p-5 border-r border-neutral-200 bg-green-50 text-green-800 font-bold text-center w-1/3">NanoLink Core</th>
                  <th className="p-5 text-neutral-600 font-normal text-center w-1/3">Generic Free Shorteners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-light text-neutral-700">
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="p-5 font-semibold border-r border-neutral-200 bg-neutral-50">Redirect Speed & Architecture</td>
                  <td className="p-5 text-center font-bold text-green-700 border-r border-neutral-200 bg-green-50/50 font-mono">&lt; 0.5 ms (In-Memory Redis Cache)</td>
                  <td className="p-5 text-center text-neutral-500 font-mono">250ms - 800ms (Slow Relational DBs)</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="p-5 font-semibold border-r border-neutral-200 bg-neutral-50">QR Code Generation Engine</td>
                  <td className="p-5 text-center font-bold text-green-700 border-r border-neutral-200 bg-green-50/50 font-mono">Native Server Vector (SVG + PNG)</td>
                  <td className="p-5 text-center text-neutral-500 font-mono">External Third-Party API Calls (Low-Res)</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="p-5 font-semibold border-r border-neutral-200 bg-neutral-50">Third-Party Ad Scripts / Tracking Cookies</td>
                  <td className="p-5 text-center font-bold text-green-700 border-r border-neutral-200 bg-green-50/50 font-mono">0 Adware / 100% Clean Redirects</td>
                  <td className="p-5 text-center text-red-600 font-mono">Often inject affiliate cookies or popup ads</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="p-5 font-semibold border-r border-neutral-200 bg-neutral-50">Custom Branding Aliases (Back-Halves)</td>
                  <td className="p-5 text-center font-bold text-neutral-900 border-r border-neutral-200 bg-green-50/50">Unlimited on Core Plan</td>
                  <td className="p-5 text-center text-neutral-500">Locked behind $35+/month tiers</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="p-5 font-semibold border-r border-neutral-200 bg-neutral-50">Indian Billing & Razorpay Integration</td>
                  <td className="p-5 text-center font-bold text-green-700 border-r border-neutral-200 bg-green-50/50 font-mono">Native UPI, Cards, Net Banking (₹)</td>
                  <td className="p-5 text-center text-neutral-500 font-mono">International Credit Card ONLY ($)</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="p-5 font-semibold border-r border-neutral-200 bg-neutral-50">Uptime SLA Guarantee</td>
                  <td className="p-5 text-center font-bold text-green-700 border-r border-neutral-200 bg-green-50/50 font-mono">99.99% Global Anycast CDN</td>
                  <td className="p-5 text-center text-neutral-500 font-mono">No guaranteed uptime SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section: Customer Testimonials & Social Proof */}
      <section className="py-24 px-6 bg-white border-b border-neutral-200 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono uppercase tracking-wider mb-3 rounded-full">
              <span>Verified Customer Social Proof</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">Loved by engineering leads and growth marketers</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">See how teams use NanoLink to accelerate campaign conversions and cut third-party QR API overhead.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between relative hover:border-green-700 transition-all">
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="text-sm font-light text-neutral-700 leading-relaxed mb-6 italic">
                "Switching our national marketing flyers to NanoLink saved us over ₹45,000 in monthly third-party QR API fees. The sub-millisecond Redis routing is noticeably faster on mobile devices!"
              </p>
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900 text-sm">Rohit Sharma</div>
                  <div className="text-xs text-neutral-500 font-mono">Head of Growth • TechFlow India</div>
                </div>
                <div className="w-9 h-9 bg-green-700 rounded-lg text-white font-bold flex items-center justify-center text-xs">
                  RS
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between relative hover:border-green-700 transition-all">
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="text-sm font-light text-neutral-700 leading-relaxed mb-6 italic">
                "We run flash sales with 10,000+ concurrent users clicking our Instagram bio link. NanoLink handled the traffic spike without a single dropped request or MongoDB timeout. Simply incredible architecture."
              </p>
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900 text-sm">Ananya Iyer</div>
                  <div className="text-xs text-neutral-500 font-mono">Founder & CEO • Silk & Soul D2C</div>
                </div>
                <div className="w-9 h-9 bg-green-700 rounded-lg text-white font-bold flex items-center justify-center text-xs">
                  AI
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col justify-between relative hover:border-green-700 transition-all">
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
              </div>
              <p className="text-sm font-light text-neutral-700 leading-relaxed mb-6 italic">
                "As an Indian SaaS team, paying for Bitly in USD was frustrating. NanoLink's seamless Razorpay integration with UPI and net banking made our Core subscription effortless and affordable."
              </p>
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900 text-sm">Vikram Verma</div>
                  <div className="text-xs text-neutral-500 font-mono">Lead DevOps Engineer • CloudScale</div>
                </div>
                <div className="w-9 h-9 bg-green-700 rounded-lg text-white font-bold flex items-center justify-center text-xs">
                  VV
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Dynamic Pricing Section (`#pricing`) */}
      <section id="pricing" className="py-24 px-6 bg-neutral-50 border-b border-neutral-200 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-mono uppercase tracking-wider mb-3 rounded-full">
              <Crown className="w-3.5 h-3.5" />
              <span>Transparent & Predictable Tiers</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">Choose the plan that scales with you</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">Start for free with zero commitment. Upgrade to Core anytime for enterprise limits and Razorpay-secured billing.</p>

            {/* Currency Switcher */}
            <div className="inline-flex items-center bg-white border border-neutral-200 p-1 mt-6 rounded-lg">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-5 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${currency === 'INR' ? 'bg-green-700 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-5 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${currency === 'USD' ? 'bg-green-700 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 1. Free Plan Card */}
            <div className="bg-white border border-neutral-200 p-8 rounded-xl flex flex-col justify-between relative hover:-translate-y-1 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-neutral-900">Free Plan</h3>
                  <span className="px-3 py-1 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono font-bold uppercase rounded-full">Starter</span>
                </div>
                <div className="text-4xl font-bold text-neutral-900 mb-6 font-mono">
                  {currency === 'INR' ? '₹0' : '$0'}
                  <span className="text-sm font-light text-neutral-500 ml-1.5">/ month</span>
                </div>
                <p className="text-xs font-light text-neutral-600 mb-8 leading-relaxed">
                  Perfect for personal creators testing short URLs and physical QR codes for small community events.
                </p>

                <div className="space-y-4 mb-8 text-xs font-normal text-neutral-700 font-mono">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-700 shrink-0" />
                    <span><strong className="font-bold text-neutral-900">{limits.free.linksPerMonth}</strong> Short Links per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-700 shrink-0" />
                    <span><strong className="font-bold text-neutral-900">{limits.free.customBackHalvesPerMonth}</strong> Custom Alias Back-Halves</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-700 shrink-0" />
                    <span><strong className="font-bold text-neutral-900">{limits.free.qrCodesPerMonth}</strong> QR Codes per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-700 shrink-0" />
                    <span><strong className="font-bold text-neutral-900">{limits.free.analyticsRetentionDays} Days</strong> Analytics Retention</span>
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
                className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-center text-sm rounded-lg transition-all block border border-neutral-200"
              >
                Get Started Free
              </Link>
            </div>

            {/* 2. Core Plan Card */}
            <div className="bg-green-700 text-white border-2 border-green-700 p-8 rounded-xl flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 bg-white text-green-800 text-[11px] font-bold font-mono uppercase tracking-wider py-1 px-4 flex items-center gap-1 rounded-bl-lg">
                <Crown className="w-3.5 h-3.5 fill-green-800" />
                <span>Most Popular</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Core Plan</span>
                  </h3>
                </div>
                <div className="text-4xl font-bold text-white mb-6 font-mono">
                  {currency === 'INR' ? '₹750' : '$9'}
                  <span className="text-sm font-light text-green-100 ml-1.5">/ month</span>
                </div>
                <p className="text-xs font-light text-green-100 mb-8 leading-relaxed">
                  Engineered for marketing professionals and businesses needing unlimited custom aliases and UTM conversion tracking.
                </p>

                <div className="space-y-4 mb-8 text-xs font-normal text-white font-mono">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span><strong className="font-bold">{limits.core.linksPerMonth}</strong> Short Links per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span><strong className="font-bold">Unlimited</strong> Custom Alias Back-Halves</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span><strong className="font-bold">{limits.core.qrCodesPerMonth}</strong> High-Res QR Codes per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span><strong className="font-bold">{limits.core.analyticsRetentionDays} Days</strong> Analytics Retention & CSV Export</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span><strong className="font-bold">Advanced QR Styling</strong> (Patterns, Corners, Banners)</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span><strong className="font-bold">UTM Campaign Builder</strong> Unlocked</span>
                  </div>
                </div>
              </div>

              <Link
                to={isAuthenticated ? "/dashboard/billing" : "/signup?plan=core"}
                className="w-full py-3.5 bg-white hover:bg-neutral-100 text-green-800 font-bold text-center text-sm rounded-lg transition-all block"
              >
                {isAuthenticated ? "Upgrade to Core Now" : "Start Core Subscription"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Frequently Asked Questions (`#faq`) */}
      <section id="faq" className="py-24 px-6 bg-white border-b border-neutral-200 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono uppercase tracking-wider mb-3 rounded-full">
              <span>Knowledge Base & Support</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-neutral-600 font-light text-sm md:text-base">Everything you need to know about NanoLink architecture, quotas, billing, and security.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="bg-neutral-50 border border-neutral-200 rounded-xl transition-all overflow-hidden hover:border-green-700">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-6 text-left font-bold text-base text-neutral-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-green-700">0{idx + 1}.</span>
                    <span>{f.q}</span>
                  </span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-green-700 shrink-0" /> : <ChevronDown className="w-5 h-5 text-neutral-500 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm font-light text-neutral-600 leading-relaxed border-t border-neutral-200 pt-4 bg-white">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 px-6 bg-green-700 text-white border-b border-green-800 z-10 text-center relative">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-mono uppercase tracking-wider rounded-full">
            <span>Instant Access • Zero Commitment</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Ready to experience sub-millisecond link routing?
          </h2>
          <p className="text-green-100 font-light text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Join thousands of marketing teams and developers who trust NanoLink for their high-conversion campaigns. Create your free account in under 15 seconds.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white hover:bg-neutral-100 text-green-800 font-bold text-base rounded-lg transition-all flex items-center gap-3 cursor-pointer"
            >
              <span>Create Free Account Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-green-800 hover:bg-green-900 text-white font-bold text-base rounded-lg transition-all flex items-center gap-2 border border-green-600 cursor-pointer"
            >
              <span>Sign In to Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-neutral-200 z-10 text-xs text-neutral-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo className="w-8 h-8" iconSize="w-4 h-4" textClassName="font-bold text-neutral-900 text-base" />
            <span className="font-normal text-neutral-500 hidden md:inline">• Built for high-throughput link management.</span>
          </div>

          <div className="flex items-center gap-6 font-bold text-neutral-700">
            <button onClick={() => scrollToSection('features')} className="hover:text-green-700 transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-green-700 transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-green-700 transition-colors cursor-pointer">Pricing</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-green-700 transition-colors cursor-pointer">FAQ</button>
            <Link to="/login" className="hover:text-green-700 transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-200 text-center sm:text-left text-[11px] font-normal text-neutral-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 NanoLink Platform. All rights reserved. Sub-millisecond Redis Routing Architecture.</span>
          <span className="flex items-center gap-4 justify-center">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-700 inline" /> Razorpay Payment Partner</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-green-700 inline" /> Zero External QR API Costs</span>
            <span className="text-green-700 font-bold">SOC2 Aligned</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
