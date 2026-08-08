import React, { useState } from 'react';
import { AdminLoginForm } from './components/AdminLoginForm';
import { RestaurantRegisterForm } from './components/RestaurantRegisterForm';
import { Shield, Building2 } from 'lucide-react';
import { useRestaurant } from '@/src/context/RestaurantContext';
import { useNavigate } from 'react-router-dom';

export const RoleLoginScreen: React.FC = () => {
  const {updateRestaurantGstProfile} = useRestaurant();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const navigate = useNavigate();

  const handleAdminSuccess = (userId?: string) => {
    // Navigate directly to post-login Terminal Hub page
    navigate('/auth/terminal');
  };

  const handleRegistrationSuccess = (payload: any) => {
    updateRestaurantGstProfile({
      restaurantName: payload.restaurantName,
      legalBusinessName: payload.ownerName,
      gstin: payload.gstNumber || '27AAPCH1234F1Z5',
      fssaiNumber: payload.fssaiNumber || '11521001000123',
      address: payload.address,
      state: payload.state,
      stateCode: payload.stateCode || '27',
      pincode: payload.pincode,
      phoneNumber: payload.phone,
      email: payload.email,
      invoicePrefix: payload.invoicePrefix || 'INV-2026',
      financialYear: '2026-27',
      taxConfig: 'BOTH',
    });

    // Return to Account Sign-In
    setActiveTab('login');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start p-3 sm:p-6" id="login-container">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E8E4DA] p-5 sm:p-8 shadow-xl relative overflow-hidden" id="login-panel">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E76F51]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center font-display font-black text-white text-2xl mx-auto shadow-md mb-3">
            B
          </div>
          <span className="text-[11px] font-mono tracking-widest text-[#E76F51] font-bold uppercase block">
            Brilixis Dining OS • Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1F2226] tracking-tight mt-1 leading-tight">
            {activeTab === 'register' ? 'Restaurant Business Onboarding' : 'Restaurant Account Sign-In'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6168] mt-1 max-w-md mx-auto">
            {activeTab === 'register'
              ? 'Complete food business registration to activate digital tableside ordering & GST billing'
              : 'Sign in with your registered restaurant credentials to open staff terminal hub'}
          </p>
        </div>

        {/* Clean 2-Tab Navigation Switcher (No awkward wrapping, 100% responsive) */}
        <div className="flex bg-[#F4F1EA] p-1.5 rounded-2xl border border-[#E8E4DA] mb-6 gap-2 shadow-inner" id="auth-mode-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-display font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-[#E76F51] shadow-md border border-[#E8E4DA]'
                : 'text-[#5C6168] hover:text-[#1F2226]'
            }`}
          >
            <Shield size={18} className={activeTab === 'login' ? 'text-[#E76F51]' : 'text-[#71717A]'} />
            <span>Account Sign-In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-display font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-[#E76F51] shadow-md border border-[#E8E4DA]'
                : 'text-[#5C6168] hover:text-[#1F2226]'
            }`}
          >
            <Building2 size={18} className={activeTab === 'register' ? 'text-[#E76F51]' : 'text-[#71717A]'} />
            <span>Register Business</span>
          </button>
        </div>

        {/* Dynamic Auth Views */}
        {activeTab === 'register' ? (
          <RestaurantRegisterForm
            onSuccess={handleRegistrationSuccess}
            onReturnToLogin={() => setActiveTab('login')}
          />
        ) : (
          <AdminLoginForm
            onSuccess={handleAdminSuccess}
            onReturnToDining={() => navigate('/')}
            onGoToRegister={() => setActiveTab('register')}
          />
        )}
      </div>
    </div>
  );
};
