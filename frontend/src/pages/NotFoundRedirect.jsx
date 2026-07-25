import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';

const NotFoundRedirect = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const slug = query.get('slug');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-center">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Unavailable</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {slug 
              ? `The short link "nano.link/r/${slug}" does not exist or has been disabled by its owner.`
              : "This short link does not exist or has been disabled."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your Own Links</span>
          </Link>
          <Link
            to="/login"
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundRedirect;
