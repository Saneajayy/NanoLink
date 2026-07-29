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

  const [name, setName] = useState(user?.name || '');
  const [defaultDomain, setDefaultDomain] = useState(user?.defaultDomain || 'nano.link');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '', mockOtp: null });

  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await axios.put('/api/settings/profile', {
        name: name.trim(),
        defaultDomain
      });
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16 bg-white text-neutral-900 font-light">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Account Settings</h1>
          <p className="text-sm font-light text-neutral-500 mt-1">Manage your profile, security credentials, API integrations, and domain preferences.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 border border-neutral-200 rounded-xl">
          <div className="w-9 h-9 bg-green-700 flex items-center justify-center font-bold text-white text-sm rounded-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span>{user?.name}</span>
              {user?.plan === 'core' && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
            </div>
            <div className="text-[11px] font-mono text-neutral-500">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Profile & Preferences */}
          <div className="bg-white border border-neutral-200 p-6 md:p-8 space-y-6 rounded-xl">
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
              <User className="w-5 h-5 text-green-700" />
              <h2 className="text-lg font-bold text-neutral-900">Profile & Preferences</h2>
            </div>

            {profileMessage.text && (
              <div className={`p-4 border text-xs font-medium flex items-center gap-2.5 rounded-lg ${
                profileMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 font-normal focus:outline-none focus:border-green-700 rounded-lg transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Registered Email Address</label>
                <div className="flex items-center gap-3 bg-neutral-100 border border-neutral-200 px-4 py-2.5 text-sm text-neutral-600 cursor-not-allowed rounded-lg">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="flex-1 font-mono font-medium">{user?.email}</span>
                  <span className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 text-[10px] font-bold uppercase rounded-md font-mono">Verified</span>
                </div>
                <p className="text-[11px] font-light text-neutral-500 mt-1.5">Email addresses are permanently tied to account ownership and billing records.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Default Short Domain</label>
                <div className="grid grid-cols-3 gap-3">
                  {['nano.link', 'nn.lk', 'nanolink.io'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDefaultDomain(d)}
                      className={`p-3 border text-center text-xs font-semibold transition-all flex flex-col items-center gap-1.5 cursor-pointer rounded-lg ${
                        defaultDomain === d 
                          ? 'bg-green-700 text-white border-green-700' 
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <Globe className={`w-4 h-4 ${defaultDomain === d ? 'text-white' : 'text-neutral-500'}`} />
                      <span>{d}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-light text-neutral-500 mt-1.5">When creating short links from your dashboard, this domain will be selected by default.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin rounded-full" /> : <Check className="w-4 h-4" />}
                  <span>Save Profile Preferences</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security & Password Change */}
          <div className="bg-white border border-neutral-200 p-6 md:p-8 space-y-6 rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-700" />
                <h2 className="text-lg font-bold text-neutral-900">Security & Password Management</h2>
              </div>
              <span className="px-3 py-1 bg-neutral-100 text-green-700 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 rounded-full font-mono">
                <ShieldCheck className="w-3 h-3" /> Email OTP Protected
              </span>
            </div>

            {user?.authProvider === 'google' ? (
              <div className="p-5 bg-neutral-50 border border-neutral-200 text-xs font-light text-neutral-600 leading-relaxed space-y-2 rounded-lg">
                <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-700" /> Google OAuth Account Security
                </div>
                <p>You signed in to NanoLink using your Google Account. Your authentication is secured directly by Google OAuth 2.0. You do not need a separate local password.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xs font-light text-neutral-600 leading-relaxed">
                  To protect your account from unauthorized changes, updating your password requires verifying a 6-digit one-time password (OTP) sent to your registered email address (<strong className="text-neutral-900 font-mono font-bold">{user?.email}</strong>).
                </p>

                {passwordMessage.text && (
                  <div className={`p-4 text-xs font-medium space-y-2 border rounded-lg ${
                    passwordMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />}
                      <span>{passwordMessage.text}</span>
                    </div>

                    {passwordMessage.mockOtp && (
                      <div className="mt-2 p-3 bg-white border border-neutral-200 text-neutral-900 font-mono text-xs flex items-center justify-between rounded-lg">
                        <div>
                          <span className="text-[10px] text-green-700 uppercase block font-bold">Zero-Config Dev Mode OTP Code:</span>
                          <span className="text-base font-bold tracking-widest text-neutral-900">{passwordMessage.mockOtp}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpCode(passwordMessage.mockOtp)}
                          className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white font-semibold text-[11px] cursor-pointer rounded-lg"
                        >
                          Auto-Fill OTP
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Request OTP Button */}
                {!otpSent ? (
                  <div className="p-6 bg-neutral-50 border border-neutral-200 text-center space-y-4 rounded-xl">
                    <div className="w-12 h-12 bg-white border border-neutral-200 text-green-700 flex items-center justify-center mx-auto rounded-xl">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Ready to change your password?</h3>
                      <p className="text-xs font-light text-neutral-500 mt-1">Click below to generate and deliver a secure verification code to your email.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpLoading}
                      className="px-6 py-3 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      {otpLoading ? <RefreshCw className="w-4 h-4 animate-spin rounded-full" /> : <Send className="w-4 h-4" />}
                      <span>Send Verification Code to Email</span>
                    </button>
                  </div>
                ) : (
                  /* Step 2: Verify OTP and Set New Password Form */
                  <form onSubmit={handlePasswordSubmit} className="space-y-5 p-6 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider font-mono">Step 2: Enter Verification Code</span>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpLoading}
                        className="text-[11px] font-semibold text-green-700 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">6-Digit Email OTP Code</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 849201"
                        required
                        maxLength={6}
                        className="w-full bg-white border border-neutral-200 px-4 py-3 text-lg text-center text-neutral-900 font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-green-700 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 chars + special char..."
                            required
                            className="w-full bg-white border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 font-normal focus:outline-none focus:border-green-700 rounded-lg pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password..."
                          required
                          className="w-full bg-white border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 font-normal focus:outline-none focus:border-green-700 rounded-lg"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] font-light text-neutral-500">
                      Password policy: Must be at least 8 characters long and contain at least one special symbol (<code className="text-neutral-900 font-mono font-bold">!@#$%^&*</code>).
                    </p>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading || otpCode.length < 6}
                        className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin rounded-full" /> : <ShieldCheck className="w-4 h-4" />}
                        <span>Verify Code & Update Password</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-8">
          
          {/* Card 3: Developer API */}
          <div className="bg-white border border-neutral-200 p-6 space-y-5 rounded-xl">
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
              <Key className="w-5 h-5 text-green-700" />
              <h2 className="text-base font-bold text-neutral-900">Developer API Key</h2>
            </div>

            <p className="text-xs font-light text-neutral-500 leading-relaxed">
              Use your personal API key to programmatically shorten links, retrieve click analytics, and trigger automated QR matrix generation.
            </p>

            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg">
              <div className="text-[10px] font-semibold text-neutral-500 uppercase mb-1 font-mono">Your Bearer Token:</div>
              {apiKey ? (
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-neutral-900 font-bold">
                  <span className="truncate">{apiKey}</span>
                  <button
                    onClick={copyApiKey}
                    className="p-1.5 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer shrink-0 rounded-md"
                    title="Copy API Key"
                  >
                    {apiKeyCopied ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="text-xs font-light text-neutral-500 italic py-1">No API key generated yet.</div>
              )}
            </div>

            <button
              onClick={handleGenerateApiKey}
              disabled={apiKeyLoading}
              className="w-full py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {apiKeyLoading ? <RefreshCw className="w-4 h-4 animate-spin rounded-full" /> : <Key className="w-4 h-4 text-white" />}
              <span>{apiKey ? "Regenerate API Key" : "Generate Personal API Key"}</span>
            </button>

            {apiKey && (
              <p className="text-[11px] font-medium text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Regenerating will immediately invalidate your existing key.</span>
              </p>
            )}
          </div>

          {/* Card 4: Danger Zone */}
          <div className="bg-red-50 border border-red-200 p-6 space-y-5 rounded-xl">
            <div className="flex items-center gap-2.5 text-red-700 font-bold text-base border-b border-red-200 pb-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Danger Zone</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">Delete Workspace & Account</h3>
              <p className="text-xs font-light text-neutral-600 leading-relaxed">
                Permanently delete your account and all associated short URLs, physical QR codes, analytics event streams, and billing records. This action cannot be reversed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2.5 bg-white hover:bg-red-600 text-red-600 hover:text-white font-semibold text-xs border border-red-200 hover:border-red-600 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account...</span>
            </button>
          </div>

        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-neutral-200 max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl rounded-xl animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 bg-red-100 border border-red-200 flex items-center justify-center shrink-0 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Permanently Delete Account?</h3>
                <p className="text-xs text-red-700 font-semibold">This action is irreversible.</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs font-normal text-neutral-700 space-y-2 leading-relaxed font-mono rounded-lg">
              <p className="font-semibold text-neutral-900">By typing <strong className="text-red-700">DELETE</strong>, you authorize NanoLink to immediately purge:</p>
              <ul className="list-disc pl-4 space-y-1 text-neutral-600 font-light text-[11px]">
                <li>All shortened links and back-halves</li>
                <li>All custom vector QR codes</li>
                <li>All Redis redirect cache entries</li>
                <li>All real-time click analytics history</li>
                <li>Your subscription and Razorpay customer record</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Type <span className="text-red-700 font-mono font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  required
                  className="w-full bg-white border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 font-mono font-bold focus:outline-none focus:border-red-600 rounded-lg"
                />
              </div>

              {user?.authProvider === 'local' && user?.password && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Enter Current Password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Verify your password..."
                    required
                    className="w-full bg-white border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 font-normal focus:outline-none focus:border-red-600 rounded-lg"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer border border-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin rounded-full" /> : <Trash2 className="w-4 h-4" />}
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
