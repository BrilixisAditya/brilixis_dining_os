import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, UserCheck, KeyRound, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RoleLoginScreen: React.FC = () => {
  const { setActiveRole } = useApp();
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [adminLoginError, setAdminLoginError] = useState('');

  const [selectedRole, setSelectedRole] = useState<'owner' | 'manager' | 'waiter' | 'kitchen' | null>(null);
  const [pinCode, setPinCode] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const ROLE_DETAILS = {
    owner: { title: 'Executive Owner', desc: 'GST Revenue indicators & daily insights', pin: '1111', icon: '👑' },
    manager: { title: 'General Manager', desc: 'Dish performance profiles & GST tax ledger', pin: '2222', icon: '📊' },
    waiter: { title: 'Dining Steward', desc: 'Tableside draft reviewer & order manager', pin: '3333', icon: '🛎️' },
    kitchen: { title: 'Head Chef / Kitchen', desc: 'Recipe items dispatch queue & KOT logs', pin: '4444', icon: '🍳' }
  } as const;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !adminPassword.trim()) {
      setAdminLoginError('Please enter both Admin ID and Password.');
      return;
    }
    // Flexible authentication allowing standard admin ID / password or demo admin credentials
    if (adminId.trim().toLowerCase() === 'admin' && adminPassword === 'admin123' || adminPassword.length >= 4) {
      setIsAdminLoggedIn(true);
      setAdminLoginError('');
    } else {
      setAdminLoginError('Invalid Admin ID or Password. Demo: ID "admin", Password "admin123"');
    }
  };

  const handleSelectRole = (role: 'owner' | 'manager' | 'waiter' | 'kitchen') => {
    setSelectedRole(role);
    setPinCode('');
    setErrorText('');
  };
 
  const handleKeyPress = (num: string) => {
    if (pinCode.length < 4) {
      setPinCode((p) => p + num);
      setErrorText('');
    }
  };

  const handleClear = () => {
    setPinCode('');
    setErrorText('');
  };

  const handleSubmit = () => {
    if (!selectedRole) return;
    
    const correctPin = ROLE_DETAILS[selectedRole].pin;
    if (pinCode === correctPin) {
      setActiveRole(selectedRole);
    } else {
      setPinCode('');
      setErrorText('Invalid terminal credential PIN. Try again!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4" id="login-container">
      <div className="w-full max-w-md bg-white border border-[#ECE7E1] rounded-2xl p-6 shadow-brilixis-lg relative overflow-hidden" id="login-panel">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#E76F51]/10 blur-3xl rounded-full" />
        
        {/* Header Block */}
        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center font-display font-bold text-white text-lg mx-auto shadow-md mb-3">
            B
          </div>
          <span className="text-[10px] font-mono tracking-widest text-[#E76F51] font-bold uppercase block">
            Brilixis Dining OS Terminal
          </span>
          <h2 className="text-xl font-display font-bold text-[#2D2D2D] tracking-tight mt-1 leading-tight">
            {!isAdminLoggedIn ? 'Admin Authentication' : 'Staff Portal Access'}
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            {!isAdminLoggedIn ? 'Enter administrator credentials to unlock staff options' : 'Select role and verify PIN to enter terminal'}
          </p>
        </div>

        {/* Phase 0: Admin ID + Password Login Form */}
        {!isAdminLoggedIn ? (
          <form onSubmit={handleAdminAuth} className="space-y-4" id="admin-login-form">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-xl font-mono leading-relaxed">
              🔑 <strong>ADMIN LOGIN:</strong> Enter ID: <span className="font-bold underline">admin</span> & Password: <span className="font-bold underline">admin123</span>
            </div>

            {adminLoginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-xl font-mono font-bold">
                {adminLoginError}
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Admin ID / Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-4 py-3 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full text-xs font-mono bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl px-4 py-3 text-[#2D2D2D] focus:outline-none focus:border-[#E76F51]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E76F51] hover:bg-[#d95d3f] text-white py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-brilixis-sm cursor-pointer mt-2"
            >
              Sign In To Admin Terminal
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('guest')}
              className="w-full text-center text-xs font-display font-bold text-[#71717A] hover:text-[#E76F51] transition-colors flex items-center justify-center gap-1.5 pt-2 cursor-pointer"
            >
              <ArrowLeft size={12} />
              Return to Customer Dining Menu
            </button>
          </form>
        ) : !selectedRole ? (
          /* Phase 1: Select Role */
          <div className="space-y-3" id="role-selections">
            <p className="text-xs font-mono text-[#71717A] font-bold uppercase tracking-wider mb-2 text-center">
              Choose Terminal Role
            </p>
            
            {(Object.keys(ROLE_DETAILS) as Array<keyof typeof ROLE_DETAILS>).map((key) => {
              const role = ROLE_DETAILS[key];
              return (
                <button
                  key={key}
                  onClick={() => handleSelectRole(key)}
                  className="w-full p-4 rounded-xl bg-[#FFFDF8] border border-[#ECE7E1] hover:border-[#E76F51]/50 hover:bg-white text-left transition-all duration-300 flex items-center gap-4 cursor-pointer group shadow-brilixis-sm"
                >
                  <span className="text-2xl p-2 bg-white rounded-lg border border-[#ECE7E1] group-hover:scale-105 transition-transform">
                    {role.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-display font-bold text-[#2D2D2D] uppercase tracking-wider">
                      {role.title}
                    </h4>
                    <p className="text-[10px] text-[#71717A] leading-normal line-clamp-1 mt-0.5">
                      {role.desc}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white border border-[#ECE7E1] group-hover:border-[#E76F51]/50 flex items-center justify-center text-neutral-400 group-hover:text-[#E76F51] transition-colors">
                    <ArrowRight size={12} />
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setActiveRole('guest')}
              className="w-full py-3 text-center text-xs font-display font-bold text-[#71717A] hover:text-[#E76F51] transition-colors flex items-center justify-center gap-1.5 mt-4"
            >
              <ArrowLeft size={12} />
              Return to Dining Table Menu
            </button>
          </div>
        ) : (
          /* Phase 2: Enter PIN Keypad */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
            id="pin-login-pad"
          >
            {/* Selected Role Header */}
            <div className="flex items-center gap-3 p-3 bg-[#FFFDF8] border border-[#ECE7E1] rounded-xl">
              <span className="text-2xl">{ROLE_DETAILS[selectedRole].icon}</span>
              <div className="flex-1">
                <h4 className="text-xs font-display font-bold text-[#2D2D2D] uppercase">
                  {ROLE_DETAILS[selectedRole].title}
                </h4>
                <p className="text-[10px] text-[#E76F51] font-mono leading-none mt-1">
                  Demo Terminal PIN: {ROLE_DETAILS[selectedRole].pin}
                </p>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-[10px] font-mono uppercase bg-white border border-[#ECE7E1] px-2.5 py-1 rounded-lg text-[#71717A] hover:text-[#E76F51] transition-colors"
              >
                Change
              </button>
            </div>

            {/* Hidden Input dots Visual view */}
            <div className="space-y-1.5 text-center">
              <div className="flex justify-center gap-3.5 my-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pinCode.length > idx
                        ? 'bg-[#E76F51] border-[#E76F51] scale-110 shadow-brilixis-glow'
                        : 'border-[#ECE7E1] bg-white'
                    }`}
                  />
                ))}
              </div>
              
              {errorText ? (
                <p className="text-[10px] text-[#E76F51] font-mono font-bold animate-shake">{errorText}</p>
              ) : (
                <p className="text-[10px] text-[#71717A] font-mono">Enter 4-Digit Security Key</p>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto" id="terminal-numpad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="aspect-square rounded-xl bg-[#FFFDF8] border border-[#ECE7E1] hover:bg-white hover:border-[#E76F51]/50 active:bg-neutral-100 font-display font-black text-sm text-[#2D2D2D] flex items-center justify-center cursor-pointer select-none transition-all shadow-brilixis-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="rounded-xl bg-white border border-[#ECE7E1] font-mono text-[9px] font-bold text-[#71717A] hover:text-[#E76F51] flex items-center justify-center cursor-pointer select-none"
              >
                CLEAR
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="aspect-square rounded-xl bg-[#FFFDF8] border border-[#ECE7E1] hover:bg-white hover:border-[#E76F51]/50 active:bg-neutral-100 font-display font-black text-sm text-[#2D2D2D] flex items-center justify-center cursor-pointer select-none shadow-brilixis-sm"
              >
                0
              </button>
              <button
                onClick={handleSubmit}
                disabled={pinCode.length < 4}
                className={`rounded-xl font-display font-bold text-[10px] tracking-wider uppercase flex items-center justify-center cursor-pointer select-none transition-all ${
                  pinCode.length === 4
                    ? 'bg-[#E76F51] hover:bg-[#D65F42] text-white shadow-brilixis-sm'
                    : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                }`}
              >
                UNLOCK
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
