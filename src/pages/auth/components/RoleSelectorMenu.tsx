import React from 'react';
import { ArrowRight, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';

export interface RoleDetail {
  title: string;
  desc: string;
  pin: string;
  icon: string;
}

export const ROLE_DETAILS: Record<'owner' | 'manager' | 'waiter' | 'kitchen', RoleDetail> = {
  owner: { title: 'Executive Owner', desc: 'GST Revenue indicators & daily insights', pin: '1111', icon: '👑' },
  manager: { title: 'General Manager', desc: 'Dish performance profiles & GST tax ledger', pin: '2222', icon: '📊' },
  waiter: { title: 'Dining Steward', desc: 'Tableside draft reviewer & order manager', pin: '3333', icon: '🛎️' },
  kitchen: { title: 'Head Chef / Kitchen', desc: 'Recipe items dispatch queue & KOT logs', pin: '4444', icon: '🍳' }
};

interface RoleSelectorMenuProps {
  authenticatedUser?: string;
  onSelectRole: (role: 'owner' | 'manager' | 'waiter' | 'kitchen') => void;
  onLogoutAccount: () => void;
  onReturnToDining: () => void;
}

export const RoleSelectorMenu: React.FC<RoleSelectorMenuProps> = ({
  authenticatedUser,
  onSelectRole,
  onLogoutAccount,
  onReturnToDining,
}) => {
  return (
    <div className="space-y-4" id="role-selections">
      {/* Session Banner */}
      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold block leading-none">
              Account Session Active
            </span>
            <span className="text-xs font-display font-bold text-emerald-950">
              {authenticatedUser || 'Admin User'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogoutAccount}
          className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-mono font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LogOut size={14} />
          <span>Lock / Sign Out</span>
        </button>
      </div>

      <div className="pb-1 border-b border-[#ECE7E1]">
        <p className="text-xs font-mono text-[#71717A] font-bold uppercase tracking-wider">
          Select Terminal Role & Enter Security PIN
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(Object.keys(ROLE_DETAILS) as Array<keyof typeof ROLE_DETAILS>).map((key) => {
          const role = ROLE_DETAILS[key];
          return (
            <button
              key={key}
              onClick={() => onSelectRole(key)}
              className="w-full p-4 rounded-2xl bg-[#FFFDF8] border border-[#ECE7E1] hover:border-[#E76F51] hover:bg-white text-left transition-all duration-300 flex items-center gap-4 cursor-pointer group shadow-xs hover:shadow-md min-h-[64px]"
            >
              <span className="text-2xl sm:text-3xl p-2.5 bg-white rounded-xl border border-[#ECE7E1] group-hover:scale-105 transition-transform shrink-0">
                {role.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-display font-bold text-[#2D2D2D] uppercase tracking-wider">
                    {role.title}
                  </h4>
                  <span className="text-[10px] font-mono text-[#E76F51] bg-[#E76F51]/10 px-2 py-0.5 rounded font-bold">
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
      </div>

      <button
        onClick={onReturnToDining}
        className="w-full py-3 text-center text-xs font-display font-bold text-[#71717A] hover:text-[#E76F51] transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Return to Customer Dining Table Menu
      </button>
    </div>
  );
};
