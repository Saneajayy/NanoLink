import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Link2, 
  QrCode, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Plus, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ChevronDown,
  ExternalLink,
  Crown,
  Zap
} from 'lucide-react';
import CreateLinkModal from '../modals/CreateLinkModal';
import CreateQrCodeModal from '../modals/CreateQrCodeModal';

const DashboardLayout = () => {
  const { user, logout, isCorePlan } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [initialModalUrl, setInitialModalUrl] = useState('');

  // Function to open link modal with optional prefill
  const openCreateLinkModal = (url = '') => {
    setInitialModalUrl(url);
    setIsLinkModalOpen(true);
    setCreateDropdownOpen(false);
  };

  const openCreateQrModal = () => {
    setIsQrModalOpen(true);
    setCreateDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home, exact: true },
    { name: 'Links', path: '/dashboard/links', icon: Link2 },
    { name: 'QR Codes', path: '/dashboard/qr-codes', icon: QrCode },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  ];

  const bottomNavItems = [
    { name: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/80 border-r border-slate-800/80 backdrop-blur-xl shrink-0 fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/25">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Nano<span className="text-orange-500">Link</span>
            </span>
          </Link>
        </div>

        {/* Create New Button with Dropdown (Section 6.3) */}
        <div className="p-4 relative">
          <button
            onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
              </div>
              <span className="text-sm">Create New</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-indigo-200 transition-transform duration-200 ${createDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {createDropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => openCreateLinkModal()}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700/60 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Short Link</div>
                  <div className="text-xs text-slate-400">Shorten a destination URL</div>
                </div>
              </button>
              <button
                onClick={openCreateQrModal}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700/60 flex items-center gap-3 transition-colors mt-1 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">QR Code</div>
                  <div className="text-xs text-slate-400">Generate scan-ready QR</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-2">
            <div className="h-px bg-slate-800/80 mx-2" />
          </div>

          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Real-Time Quota Indicator Badge (Step 15) */}
        <div className="px-4 pb-4">
          <div className={`p-3.5 rounded-2xl border text-xs space-y-2.5 shadow-lg ${
            isCorePlan 
              ? 'bg-gradient-to-br from-slate-900 to-indigo-950/60 border-amber-500/40 text-slate-300' 
              : 'bg-slate-950/90 border-slate-800/80 text-slate-400'
          }`}>
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5">
                {isCorePlan ? <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{isCorePlan ? 'Core Pro Quotas' : 'Monthly Usage'}</span>
              </span>
              <span className="text-[10px] uppercase font-mono text-slate-500">{isCorePlan ? 'Pro' : 'Free'}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span>Links</span>
                <span className="font-mono font-bold text-slate-200">
                  {user?.monthlyLinkCount || 0} / {isCorePlan ? '100' : '50'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    ((user?.monthlyLinkCount || 0) / (isCorePlan ? 100 : 50)) > 0.8 ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, ((user?.monthlyLinkCount || 0) / (isCorePlan ? 100 : 50)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span>QR Codes</span>
                <span className="font-mono font-bold text-slate-200">
                  {user?.monthlyQrCodeCount || 0} / {isCorePlan ? '5' : '2'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    ((user?.monthlyQrCodeCount || 0) / (isCorePlan ? 5 : 2)) > 0.8 ? 'bg-amber-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, ((user?.monthlyQrCodeCount || 0) / (isCorePlan ? 5 : 2)) * 100)}%` }}
                />
              </div>
            </div>

            {!isCorePlan && (
              <Link
                to="/dashboard/billing"
                className="w-full mt-2 py-1.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition-all block text-center"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Upgrade to Core</span>
              </Link>
            )}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8BFF&color=fff`}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user?.name || 'Loading...'}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isCorePlan 
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {user?.plan || 'free'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-lg flex items-center justify-between px-4 z-40">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-orange-500 flex items-center justify-center font-bold text-white text-base">
            N
          </div>
          <span className="font-bold text-lg text-white">Nano<span className="text-orange-500">Link</span></span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col pt-16">
          <div className="p-4 border-b border-slate-800">
            <button
              onClick={() => { setMobileMenuOpen(false); openCreateLinkModal(); }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Short Link</span>
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[...navItems, ...bottomNavItems].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
                >
                  <Icon className="w-5 h-5 text-indigo-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-3">
              <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold text-white">{user?.name}</div>
                <div className="text-xs text-orange-400 uppercase font-bold">{user?.plan} plan</div>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-red-400 hover:bg-slate-800 rounded-xl">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen pt-16 md:pt-0 overflow-x-hidden">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Pass down openCreateLinkModal and openCreateQrModal to child routes via context/outlet */}
          <Outlet context={{ openCreateLinkModal, openCreateQrModal }} />
        </div>
      </main>

      {/* Shared Create Link Modal (Section 2 & 6.6) */}
      <CreateLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        initialUrl={initialModalUrl}
        onSuccess={() => {
          setIsLinkModalOpen(false);
          // Force refresh on current route if needed
        }}
      />

      {/* Shared Create QR Modal (Section 2 & 6.8) */}
      <CreateQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onSuccess={() => {
          setIsQrModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
