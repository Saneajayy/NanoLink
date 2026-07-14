import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import UpgradeModal from './components/UpgradeModal';

function App() {
  const { user } = useContext(AuthContext) || {};
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{ limitType?: string, message?: string }>({});

  useEffect(() => {
    const handleQuotaExceeded = (event: any) => {
      setUpgradeModalData(event.detail || {});
      setIsUpgradeModalOpen(true);
    };

    window.addEventListener('quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Toaster position="top-right" />
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        limitType={upgradeModalData.limitType}
        message={upgradeModalData.message}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/links/:id" element={<Analytics />} />
      </Routes>
    </div>
  );
}

export default App;
