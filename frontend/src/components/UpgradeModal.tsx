import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType?: string;
  message?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, limitType, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  let limitTitle = 'Plan Limit Reached';
  if (limitType === 'linksPerMonth') limitTitle = 'Link Limit Reached';
  if (limitType === 'customBackHalvesPerMonth') limitTitle = 'Custom Alias Limit Reached';
  if (limitType === 'qrCodesPerMonth') limitTitle = 'QR Code Limit Reached';

  const handleUpgradeClick = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
              <Lock className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{limitTitle}</h2>
          <p className="text-slate-600 mb-6">
            {message || "You've hit the limits of your current plan. Upgrade to NanoLink Core to get higher limits and access advanced features."}
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleUpgradeClick}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              View Plans & Upgrade
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
