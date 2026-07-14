import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Pricing = () => {
  const { user } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.plan === 'core') {
      toast.success("You are already on the Core plan!");
      return;
    }

    try {
      const response = await api.post('/payments/create-order');
      const order = response.data;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'NanoLink',
        description: 'Upgrade to Core Plan',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Successfully upgraded to Core Plan!');
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error) {
            toast.error('Payment verification failed. Please try again.');
          }
        },
        theme: {
          color: '#4f46e5', // indigo-600
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not initiate payment. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Simple, transparent pricing</h1>
        <p className="text-xl text-slate-600">Choose the plan that fits your needs. Upgrade anytime.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-6 right-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                With ads
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-slate-300 mb-6">Perfect for getting started</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold">$0</span>
              <span className="text-slate-300">/month</span>
            </div>
          </div>
          <div className="p-8">
            <button 
              onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
              className="w-full py-4 px-6 rounded-xl border-2 border-slate-900 text-slate-900 font-bold text-lg hover:bg-slate-900 hover:text-white transition-colors mb-8"
            >
              Get Started
            </button>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>50</strong> links/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>3</strong> custom back-halves/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>2</strong> QR codes/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700">Unlimited clicks & QR scans</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700">Basic QR customizations</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <X className="w-6 h-6 text-slate-400 shrink-0" />
                <span className="text-slate-500 line-through">Advanced analytics history</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core Plan */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-600 relative transform md:-translate-y-4">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-6 right-6">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Core</h3>
            <p className="text-slate-300 mb-6">For professionals and growing brands</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold">$10</span>
              <span className="text-slate-300">/month</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">Billed monthly or $120/year</p>
          </div>
          <div className="p-8">
            <button 
              onClick={handleUpgrade}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-600/30 mb-8"
            >
              Upgrade to Core
            </button>
            <p className="font-semibold text-slate-900 mb-4">Everything in Free, plus:</p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>100</strong> links/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>Unlimited</strong> custom back-halves</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>5</strong> QR codes/month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700"><strong>30 days</strong> of analytics history</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700">UTM builder</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-indigo-600 shrink-0" />
                <span className="text-slate-700">Link & QR code redirect editing</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="relative group flex items-start gap-3 w-full">
                  <Check className="w-6 h-6 text-slate-300 shrink-0" />
                  <span className="text-slate-400 flex items-center gap-2 w-full justify-between">
                    NanoLink Assist (AI)
                    <Info className="w-4 h-4 text-slate-400" />
                  </span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Coming soon
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple X icon for the list since it's not imported above
const X = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export default Pricing;
