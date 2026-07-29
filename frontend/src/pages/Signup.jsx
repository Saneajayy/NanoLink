import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/common/Logo';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const { signup, loginWithGoogle, getPendingUrl } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setLocalError('Please fill in all fields.');
            return;
        }
        if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setLocalError('Password must be at least 8 characters long and contain a special character.');
            return;
        }

        setLocalError('');
        setLoading(true);
        try {
            await signup(name, email, password);

            const pendingUrl = getPendingUrl(false);
            if (pendingUrl) {
                navigate('/dashboard?action=create_link');
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setLocalError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-light text-neutral-900">
            {/* Brand logo */}
            <Link to="/" className="mb-8 z-10 hover:opacity-90 transition-opacity">
                <Logo />
            </Link>

            {/* Toggle link above the form */}
            <div className="mb-4 text-neutral-500 font-normal text-sm z-10">
                Already have an account?{' '}
                <Link to="/login" className="text-green-700 hover:underline font-semibold transition-colors">
                    Log in
                </Link>
            </div>

            {/* Centered card layout */}
            <div className="w-full max-w-md bg-white border border-neutral-200 overflow-hidden z-10 rounded-xl">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-neutral-900 mb-1">Create an account</h1>
                    <p className="text-neutral-500 font-light text-sm mb-6">Start managing your short links and QR codes.</p>

                    {localError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 font-medium text-xs rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                            <span>{localError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-green-700 text-neutral-900 placeholder-neutral-400 font-normal transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-green-700 text-neutral-900 placeholder-neutral-400 font-normal transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    className="w-full px-4 py-3 pr-11 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-green-700 text-neutral-900 placeholder-neutral-400 font-normal transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1 cursor-pointer"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-neutral-400 font-medium">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={loginWithGoogle}
                        className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-700 font-medium border border-neutral-200 rounded-lg transition-all flex items-center justify-center gap-3 text-sm cursor-pointer"
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

                <div className="bg-neutral-50 px-8 py-4 border-t border-neutral-200 text-center">
                    <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                        By creating an account, you agree to NanoLink's{' '}
                        <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service'); }} className="text-green-700 hover:underline font-medium">Terms of Service</a>,{' '}
                        <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy'); }} className="text-green-700 hover:underline font-medium">Privacy Policy</a> and{' '}
                        <a href="#aup" onClick={(e) => { e.preventDefault(); alert('Acceptable Use Policy'); }} className="text-green-700 hover:underline font-medium">Acceptable Use Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
