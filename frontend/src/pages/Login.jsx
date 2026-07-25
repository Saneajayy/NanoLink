import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, loginWithGoogle, getPendingUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setLocalError('');
    setLoading(true);
    try {
      await login(email, password);
      
      // Check if user had pasted a URL on the homepage before logging in (Section 4 critical flow)
      const pendingUrl = getPendingUrl(false); // Don't clear yet, dashboard modal will read and clear
      if (pendingUrl) {
        navigate('/dashboard?action=create_link');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2 mb-8 z-10 hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/30">
          N
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">
          Nano<span className="text-orange-500">Link</span>
        </span>
      </Link>

      {/* Toggle link above the form per Section 4 */}
      <div className="mb-4 text-slate-400 text-sm z-10">
        Don't have an account?{' '}
        <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4 transition-colors">
          Sign up
        </Link>
      </div>

      {/* Centered card layout with white background and orange top accent bar per Section 4 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100">
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
        
        <div className="p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-600 text-sm mb-6">Log in to manage your short links and QR codes.</p>

          {localError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {/* "Forgot your password?" link under/next to password field on Login only per Section 4 */}
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset is sent to your email.'); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Secondary button: "Continue with Google" with Google "G" icon per Section 4 */}
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Legal footer text per Section 4 */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By creating an account, you agree to NanoLink's{' '}
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service'); }} className="text-slate-700 underline font-medium hover:text-indigo-600">Terms of Service</a>,{' '}
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }} className="text-slate-700 underline font-medium hover:text-indigo-600">Privacy Policy</a> and{' '}
            <a href="#aup" onClick={(e) => { e.preventDefault(); alert('Acceptable Use Policy'); }} className="text-slate-700 underline font-medium hover:text-indigo-600">Acceptable Use Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
