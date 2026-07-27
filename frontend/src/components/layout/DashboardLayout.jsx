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
import ErrorBoundary from '../common/ErrorBoundary';

const DashboardLayout = () => {
 const { user, logout, isCorePlan } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
 const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
 const [isQrModalOpen, setIsQrModalOpen] = useState(false);
 const [initialModalUrl, setInitialModalUrl] = useState('');
 const [initialQrLink, setInitialQrLink] = useState(null);

 // Function to open link modal with optional prefill
 const openCreateLinkModal = (url = '') => {
 setInitialModalUrl(url);
 setIsLinkModalOpen(true);
 setCreateDropdownOpen(false);
 };

 const openCreateQrModal = (link = null) => {
 setInitialQrLink(link && typeof link === 'object' && link._id ? link : null);
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
  <div className="min-h-screen bg-white text-black flex font-light">
    {/* Sidebar - Desktop */}
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 shrink-0 fixed inset-y-0 z-30">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-neutral-200">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#1A00FF] flex items-center justify-center font-bold text-white text-lg">
            N
          </div>
          <span className="font-bold text-xl tracking-tight text-black">
            Nano<span className="text-[#FF6206]">Link</span>
          </span>
        </Link>
      </div>

      {/* Create New Button with Dropdown (Section 6.3) */}
      <div className="p-4 relative">
        <button
          onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
          className="w-full py-3 px-4 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium transition-all flex items-center justify-between group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
            </div>
            <span className="text-sm font-medium">Create New</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${createDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {createDropdownOpen && (
          <div className="absolute left-4 right-4 mt-2 bg-white border border-neutral-200 py-2 z-50 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => openCreateLinkModal()}
              className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-neutral-50 flex items-center gap-3 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 bg-neutral-100 text-black flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-black">Short Link</div>
                <div className="text-xs text-neutral-500 font-normal">Shorten a destination URL</div>
              </div>
            </button>
            <button
              onClick={openCreateQrModal}
              className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-neutral-50 flex items-center gap-3 transition-colors mt-1 cursor-pointer"
            >
              <div className="w-7 h-7 bg-neutral-100 text-black flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-black">QR Code</div>
                <div className="text-xs text-neutral-500 font-normal">Generate scan-ready QR</div>
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
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-[#1A00FF] text-white font-medium shadow-sm'
                  : 'text-black/70 hover:text-black hover:bg-neutral-100 font-normal'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 pb-2">
          <div className="h-px bg-neutral-200 mx-2" />
        </div>

        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-[#1A00FF] text-white font-medium shadow-sm'
                  : 'text-black/70 hover:text-black hover:bg-neutral-100 font-normal'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Real-Time Quota Indicator Badge (Step 15) */}
      <div className="px-4 pb-4">
        <div className="p-3.5 border border-neutral-200 bg-neutral-50 text-black text-xs space-y-2.5">
          <div className="flex items-center justify-between font-semibold text-black">
            <span className="flex items-center gap-1.5">
              {isCorePlan ? <Crown className="w-3.5 h-3.5 text-[#FF6206] fill-[#FF6206]" /> : <Sparkles className="w-3.5 h-3.5 text-[#1A00FF]" />}
              <span>{isCorePlan ? 'Core Pro Quotas' : 'Monthly Usage'}</span>
            </span>
            <span className="text-[10px] uppercase font-mono text-neutral-500">{isCorePlan ? 'Pro' : 'Free'}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-600 font-normal">
              <span>Links</span>
              <span className="font-mono font-medium text-black">
                {user?.monthlyLinkCount || 0} / {isCorePlan ? '100' : '50'}
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
              <div 
                className="h-full bg-[#1A00FF] transition-all duration-300"
                style={{ width: `${Math.min(100, ((user?.monthlyLinkCount || 0) / (isCorePlan ? 100 : 50)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-600 font-normal">
              <span>QR Codes</span>
              <span className="font-mono font-medium text-black">
                {user?.monthlyQrCodeCount || 0} / {isCorePlan ? '50' : '10'}
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
              <div 
                className="h-full bg-[#FF6206] transition-all duration-300"
                style={{ width: `${Math.min(100, ((user?.monthlyQrCodeCount || 0) / (isCorePlan ? 50 : 10)) * 100)}%` }}
              />
            </div>
          </div>

          {!isCorePlan && (
            <Link
              to="/dashboard/billing"
              className="w-full mt-2 py-1.5 px-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all block text-center shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Upgrade to Core</span>
            </Link>
          )}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1A00FF&color=fff`}
              alt={user?.name}
              className="w-9 h-9 object-cover border border-neutral-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-black truncate">{user?.name || 'Loading...'}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-normal px-1.5 py-0.5 uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
                  {user?.plan || 'free'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    {/* Mobile Top Navbar */}
    <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-40">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#1A00FF] flex items-center justify-center font-bold text-white text-base">
          N
        </div>
        <span className="font-bold text-lg text-black">Nano<span className="text-[#FF6206]">Link</span></span>
      </Link>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 text-black hover:bg-neutral-100"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>

    {/* Mobile Menu Drawer */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col pt-16">
        <div className="p-4 border-b border-neutral-200">
          <button
            onClick={() => { setMobileMenuOpen(false); openCreateLinkModal(); }}
            className="w-full py-3 bg-[#FF6206] hover:bg-[#FF6206]/90 text-white font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Short Link</span>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[...navItems, ...bottomNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 text-base transition-all ${
                  isActive ? 'bg-[#1A00FF] text-white font-medium shadow-sm' : 'text-black font-normal hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 border border-neutral-200" />
            <div>
              <div className="font-semibold text-black">{user?.name}</div>
              <div className="text-xs text-neutral-500 uppercase font-normal">{user?.plan} plan</div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2.5 text-neutral-500 hover:text-black hover:bg-neutral-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    )}

 {/* Main Content Area */}
 <main className="flex-1 md:pl-64 flex flex-col min-h-screen pt-16 md:pt-0 overflow-x-hidden">
 <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
 {/* Pass down openCreateLinkModal and openCreateQrModal to child routes via context/outlet */}
 <ErrorBoundary>
 <Outlet context={{ openCreateLinkModal, openCreateQrModal }} />
 </ErrorBoundary>
 </div>
 </main>

 {/* Shared Create Link Modal (Section 2 & 6.6) */}
 <CreateLinkModal
 isOpen={isLinkModalOpen}
 onClose={() => setIsLinkModalOpen(false)}
 initialUrl={initialModalUrl}
 onSuccess={() => {
 window.dispatchEvent(new Event('nanolink_data_change'));
 }}
 />

 {/* Shared Create QR Modal (Section 2 & 6.8) */}
 <CreateQrCodeModal
 isOpen={isQrModalOpen}
 onClose={() => {
 setIsQrModalOpen(false);
 setInitialQrLink(null);
 }}
 initialLink={initialQrLink}
 onSuccess={() => {
 window.dispatchEvent(new Event('nanolink_data_change'));
 }}
 />
 </div>
 );
};

export default DashboardLayout;
