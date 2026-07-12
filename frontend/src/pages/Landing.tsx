import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Link as LinkIcon, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const Landing = () => {
  const [stats, setStats] = useState({
    totalLinksShortened: "-",
    activeUsers: "-",
    totalClicksTracked: "-",
    countriesReached: "-"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/public');
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Shorten Links. Big Results.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                A powerful URL shortener that gives you comprehensive analytics, QR codes, and total control over your links.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  Get started for free
                </Link>
                <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-1 group">
                  Learn more <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
            
            <div className="mt-16 flow-root sm:mt-24">
              <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-8 shadow-xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="url" 
                    className="block w-full rounded-xl border-0 py-4 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6" 
                    placeholder="Paste your long link here" 
                  />
                </div>
                <Link to="/signup" className="w-full sm:w-auto shrink-0 rounded-xl bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors text-center">
                  Shorten
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Links Shortened</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stats.totalLinksShortened}</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Active Users</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stats.activeUsers}</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Clicks Tracked</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stats.totalClicksTracked}</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">Countries Reached</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stats.countriesReached}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Shorten Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage links
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              NanoLink provides advanced tools to help you understand your audience and optimize your campaigns.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Deep Analytics
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Track clicks over time, see where your audience is coming from, and understand what devices they use.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Safe Browsing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Every link is checked against Google Safe Browsing to ensure your audience is protected from malware and phishing.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Blazing Fast
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Our redirect engine is built for speed and scales effortlessly to handle millions of concurrent clicks without breaking a sweat.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
