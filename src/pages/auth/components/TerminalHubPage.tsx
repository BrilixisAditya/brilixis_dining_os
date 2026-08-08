import React, { useState } from 'react';
import { ROLE_DETAILS } from './RoleSelectorMenu';
import { PinLoginBoard } from './PinLoginBoard';
import { ShieldCheck, LogOut, ArrowRight, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { useRestaurant } from '@/src/context/RestaurantContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/src/components/common/Navbar';

export const TerminalHubPage: React.FC = () => {
  const { restaurantGstProfile } = useRestaurant();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'manager' | 'waiter' | 'kitchen' | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Reset back to public sign-in page
    navigate('/auth/login');
  };

  const handleRoleUnlocked = (role: 'owner' | 'manager' | 'waiter' | 'kitchen') => {
      // Map unlocked role to its route path
    const routeMap = {
      owner: '/admin/dashboard/owner',
      manager: '/admin/dashboard/manager',
      waiter: '/staff/dashboard/waiter',
      kitchen: '/staff/dashboard/kitchen',
    };
    navigate(routeMap[role]);
  };

  return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
                  <Navbar />
                  <main className="max-w-xl mx-auto px-4 py-8 relative z-10">
                     <div className="min-h-[85vh] flex flex-col items-center justify-start p-3 sm:p-6" id="terminal-hub-container">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#E8E4DA] p-5 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E76F51]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Authenticated Account Session Header Bar */}
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-display font-extrabold text-base shrink-0 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block leading-tight">
                Account Authenticated • Session Active
              </span>
              <h3 className="text-xs sm:text-sm font-display font-bold text-emerald-950 truncate">
                {restaurantGstProfile?.restaurantName || 'Hush Dine & Lounge'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-xs"
            title="Sign Out of Restaurant Account"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-mono tracking-widest text-[#E76F51] font-bold uppercase block">
            Brilixis Staff Terminal Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1F2226] tracking-tight mt-1">
            {selectedRole ? 'Enter Security PIN' : 'Select Terminal Role'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6168] mt-1 max-w-md mx-auto">
            {selectedRole
              ? `Enter 4-digit PIN to access ${ROLE_DETAILS[selectedRole].title}`
              : 'Choose your staff role below and enter your assigned 4-digit security PIN'}
          </p>
        </div>

        {/* Role Terminal Cards or PIN Board */}
        {selectedRole ? (
          <PinLoginBoard
            role={selectedRole}
            onBackToRoles={() => setSelectedRole(null)}
            onSuccess={handleRoleUnlocked}
          />
        ) : (
          <div className="space-y-3.5" id="role-selection-grid">
            {(Object.keys(ROLE_DETAILS) as Array<keyof typeof ROLE_DETAILS>).map((key) => {
              const role = ROLE_DETAILS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRole(key)}
                  className="w-full p-4 rounded-2xl bg-[#FFFDF8] border border-[#ECE7E1] hover:border-[#E76F51] hover:bg-white text-left transition-all duration-300 flex items-center gap-4 cursor-pointer group shadow-xs hover:shadow-md min-h-[68px]"
                >
                  <span className="text-2xl sm:text-3xl p-2.5 bg-white rounded-xl border border-[#ECE7E1] group-hover:scale-105 transition-transform shrink-0">
                    {role.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-display font-bold text-[#2D2D2D] uppercase tracking-wider">
                        {role.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#E76F51] bg-[#E76F51]/10 px-2 py-0.5 rounded font-bold shrink-0">
                        PIN: {role.pin}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A] leading-normal line-clamp-1 mt-0.5">
                      {role.desc}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#ECE7E1] group-hover:border-[#E76F51] flex items-center justify-center text-neutral-400 group-hover:text-[#E76F51] transition-colors shrink-0">
                    <ArrowRight size={16} />
                  </div>
                </button>
              );
            })}

            <div className="pt-3 border-t border-[#ECE7E1] flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/customer')}
                className="text-xs font-display font-bold text-[#71717A] hover:text-[#1F2226] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Return to Customer Menu
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-display font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                Sign Out Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
                  </main>
                </div>
   
  );
};
