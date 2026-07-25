import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Key, 
  Trash2, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  Globe, 
  Crown, 
  Send, 
  Eye, 
  EyeOff,
  AlertCircle,
  Copy,
  CheckCircle2
} from 'lucide-react';

const SettingsPage = () => {
  const { user, login: updateAuthUser, logout } = useAuth();

  // Profile preferences state
  const [name, setName] = useState(user?.name || '');
  const [defaultDomain, setDefaultDomain] = useState(user?.defaultDomain || 'nano.link');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '', mockOtp: null });

  // API Key state
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // 1. Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await axios.put('/api/settings/profile', {
        name: name.trim(),
        defaultDomain
      });
      // Update local storage and context if user object returned
      if (res.data?.user && localStorage.getItem('token')) {
        updateAuthUser(res.data.user, localStorage.getItem('token'));
      }
      setProfileMessage({ type: 'success', text: 'Profile preferences updated successfully.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Request Password Change OTP per User Instruction
  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setPasswordMessage({ type: '', text: '', mockOtp: null });

    try {
      const res = await axios.post('/api/settings/password/request-otp');
      setOtpSent(true);
      setPasswordMessage({
        type: 'success',
        text: res.data.message,
        mockOtp: res.data.mockOtp
      });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send verification code.' });
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Verify OTP & Update Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '', mockOtp: null });

    try {
      const res = await axios.post('/api/settings/password/verify-and-change', {
        otp: otpCode.trim(),
        newPassword,
        confirmPassword
      });
      setPasswordMessage({ type: 'success', text: res.data.message });
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Failed to verify OTP and update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // 4. Generate API Key
  const handleGenerateApiKey = async () => {
    setApiKeyLoading(true);
    try {
      const res = await axios.post('/api/settings/api-key');
      setApiKey(res.data.apiKey);
      if (res.data?.user && localStorage.getItem('token')) {
        updateAuthUser(res.data.user, localStorage.getItem('token'));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate API key.');
    } finally {
      setApiKeyLoading(false);
    }
  };

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 3000);
  };

  // 5. Execute Permanent Account Deletion per Section 6.11
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);

    try {
      const res = await axios.delete('/api/settings/account', {
        data: {
          confirmationText: deleteConfirmText.trim(),
          password: deletePassword
        }
      });
      alert(res.data.message || 'Account permanently deleted.');
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your profile, security credentials, API integrations, and domain preferences.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center font-bold text-white text-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{user?.name}</span>
              {user?.plan === 'core' && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Profile & Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Profile & Preferences */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Profile & Preferences</h2>
            </div>

            {profileMessage.text && (
              <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                profileMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Registered Email Address</label>
                <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="flex-1 font-mono">{user?.email}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">Verified</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">Email addresses are permanently tied to account ownership and billing records.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Default Short Domain</label>
                <div className="grid grid-cols-3 gap-3">
                  {['nano.link', 'nn.lk', 'nanolink.io'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDefaultDomain(d)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        defaultDomain === d 
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Globe className={`w-4 h-4 ${defaultDomain === d ? 'text-indigo-400' : 'text-slate-600'}`} />
                      <span>{d}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">When creating short links from your dashboard, this domain will be selected by default.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Profile Preferences</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security & Password Change via Email Verification (User Instruction) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-white">Security & Password Management</h2>
              </div>
              <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Email OTP Protected
              </span>
            </div>

            {user?.authProvider === 'google' ? (
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed space-y-2">
                <div className="font-bold text-sm text-indigo-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> Google OAuth Account Security
                </div>
                <p>You signed in to NanoLink using your Google Account. Your authentication is secured directly by Google OAuth 2.0. You do not need a separate local password.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 leading-relaxed">
                  To protect your account from unauthorized changes, updating your password requires verifying a 6-digit one-time password (OTP) sent to your registered email address (<strong className="text-slate-200 font-mono">{user?.email}</strong>).
                </p>

                {passwordMessage.text && (
                  <div className={`p-4 rounded-xl text-xs font-semibold space-y-2 ${
                    passwordMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{passwordMessage.text}</span>
                    </div>

                    {/* Zero-Config Dev Mode Helper per user instruction: "i will provide the key later, use any smtp SERVICE THATS FREE" */}
                    {passwordMessage.mockOtp && (
                      <div className="mt-2 p-3 bg-slate-950 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-amber-500 uppercase block font-bold">💡 Zero-Config Dev Mode OTP Code:</span>
                          <span className="text-base font-black tracking-widest">{passwordMessage.mockOtp}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpCode(passwordMessage.mockOtp)}
                          className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] rounded hover:bg-amber-400 cursor-pointer"
                        >
                          Auto-Fill OTP
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Request OTP Button */}
                {!otpSent ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Ready to change your password?</h3>
                      <p className="text-xs text-slate-500 mt-1">Click below to generate and deliver a secure verification code to your email.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpLoading}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      {otpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Send Verification Code to Email</span>
                    </button>
                  </div>
                ) : (
                  /* Step 2: Verify OTP and Set New Password Form */
                  <form onSubmit={handlePasswordSubmit} className="space-y-5 p-6 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Step 2: Enter Verification Code</span>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpLoading}
                        className="text-[11px] font-semibold text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">6-Digit Email OTP Code</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 849201"
                        required
                        maxLength={6}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-lg text-center text-white font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 chars + special char..."
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-orange-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password..."
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Password policy: Must be at least 8 characters long and contain at least one special symbol (<code className="text-slate-400">!@#$%^&*</code>).
                    </p>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading || otpCode.length < 6}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        <span>Verify Code & Update Password</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: API Keys & Danger Zone */}
        <div className="space-y-8">
          
          {/* Card 3: Developer API & Webhooks */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <Key className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Developer API Key</h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use your personal API key to programmatically shorten links, retrieve click analytics, and trigger automated QR matrix generation.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Your Bearer Token:</div>
              {apiKey ? (
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-purple-300">
                  <span className="truncate">{apiKey}</span>
                  <button
                    onClick={copyApiKey}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Copy API Key"
                  >
                    {apiKeyCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-600 italic py-1">No API key generated yet.</div>
              )}
            </div>

            <button
              onClick={handleGenerateApiKey}
              disabled={apiKeyLoading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {apiKeyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4 text-purple-400" />}
              <span>{apiKey ? "Regenerate API Key" : "Generate Personal API Key"}</span>
            </button>

            {apiKey && (
              <p className="text-[11px] text-amber-400/80 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Regenerating will immediately invalidate your existing key.</span>
              </p>
            )}
          </div>

          {/* Card 4: Danger Zone — Account Deletion per Section 6.11 */}
          <div className="bg-rose-950/10 border border-rose-500/30 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base border-b border-rose-500/20 pb-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Danger Zone</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Delete Workspace & Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanently delete your account and all associated short URLs, physical QR codes, analytics event streams, and billing records. This action cannot be reversed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 font-bold text-xs rounded-xl border border-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account...</span>
            </button>
          </div>

        </div>
      </div>

      {/* Permanent Account Deletion Confirmation Modal per Section 6.11 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-rose-400/90 font-semibold">This action is irreversible.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed font-mono">
              <p>By typing <strong className="text-rose-400">DELETE</strong>, you authorize NanoLink to immediately purge:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>All shortened links and back-halves</li>
                <li>All custom vector QR codes</li>
                <li>All Redis redirect cache entries</li>
                <li>All real-time click analytics history</li>
                <li>Your subscription and Razorpay customer record</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Type <span className="text-rose-400 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              {user?.authProvider === 'local' && user?.password && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Enter Current Password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Verify your password..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Permanently Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
