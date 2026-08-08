import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { ROLE_DETAILS } from './RoleSelectorMenu';
import { AuthService } from './authService';

interface PinLoginBoardProps {
  role: 'owner' | 'manager' | 'waiter' | 'kitchen';
  onBackToRoles: () => void;
  onSuccess: (role: 'owner' | 'manager' | 'waiter' | 'kitchen') => void;
}

export const PinLoginBoard: React.FC<PinLoginBoardProps> = ({ role, onBackToRoles, onSuccess }) => {
  const [pinCode, setPinCode] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const roleInfo = ROLE_DETAILS[role];

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

  const handleSubmit = async () => {
    if (pinCode.length < 4 || isVerifying) return;

    setIsVerifying(true);
    setErrorText('');

    try {
      const response = await AuthService.verifyRolePin(role, pinCode, roleInfo.pin);
      if (response.success) {
        onSuccess(role);
      } else {
        setPinCode('');
        setErrorText(response.message || 'Invalid PIN code. Please try again.');
      }
    } catch (err) {
      setErrorText('Authentication request failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 max-w-sm mx-auto"
      id="pin-login-pad"
    >
      {/* Selected Role Header */}
      <div className="flex items-center gap-3.5 p-3.5 bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl shadow-xs">
        <span className="text-3xl p-2 bg-white rounded-xl border border-[#ECE7E1]">{roleInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-display font-bold text-[#2D2D2D] uppercase tracking-wide">
            {roleInfo.title}
          </h4>
          <p className="text-xs text-[#E76F51] font-mono font-bold mt-0.5">
            Demo Security PIN: {roleInfo.pin}
          </p>
        </div>
        <button
          onClick={onBackToRoles}
          disabled={isVerifying}
          className="text-xs font-mono font-bold uppercase bg-white border border-[#ECE7E1] px-3 py-1.5 rounded-xl text-[#71717A] hover:text-[#E76F51] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          Change Role
        </button>
      </div>

      {/* Input dots */}
      <div className="space-y-2 text-center">
        <div className="flex justify-center gap-4 my-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                pinCode.length > idx
                  ? 'bg-[#E76F51] border-[#E76F51] scale-110 shadow-md'
                  : 'border-[#ECE7E1] bg-white'
              }`}
            />
          ))}
        </div>

        {errorText ? (
          <p className="text-xs text-rose-600 font-mono font-bold">{errorText}</p>
        ) : (
          <p className="text-xs text-[#71717A] font-mono font-semibold flex items-center justify-center gap-1.5">
            <KeyRound size={14} className="text-[#E76F51]" />
            <span>Enter 4-Digit Security Key</span>
          </p>
        )}
      </div>

      {/* Touch-optimized Keypad Grid (Touch Targets >= 48px) */}
      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto" id="terminal-numpad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num)}
            disabled={isVerifying}
            className="h-14 rounded-2xl bg-[#FFFDF8] border border-[#ECE7E1] hover:bg-white hover:border-[#E76F51] active:bg-neutral-100 font-display font-black text-lg text-[#2D2D2D] flex items-center justify-center cursor-pointer select-none transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          disabled={isVerifying}
          className="h-14 rounded-2xl bg-white border border-[#ECE7E1] font-mono text-xs font-bold text-[#71717A] hover:text-[#E76F51] flex items-center justify-center cursor-pointer select-none active:scale-95 disabled:opacity-50"
        >
          CLEAR
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          disabled={isVerifying}
          className="h-14 rounded-2xl bg-[#FFFDF8] border border-[#ECE7E1] hover:bg-white hover:border-[#E76F51] active:bg-neutral-100 font-display font-black text-lg text-[#2D2D2D] flex items-center justify-center cursor-pointer select-none shadow-xs active:scale-95 disabled:opacity-50"
        >
          0
        </button>
        <button
          onClick={handleSubmit}
          disabled={pinCode.length < 4 || isVerifying}
          className={`h-14 rounded-2xl font-display font-bold text-xs tracking-wider uppercase flex items-center justify-center cursor-pointer select-none transition-all active:scale-95 ${
            pinCode.length === 4 && !isVerifying
              ? 'btn-primary'
              : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
          }`}
        >
          {isVerifying ? <Loader2 size={18} className="animate-spin" /> : 'UNLOCK'}
        </button>
      </div>

      <button
        type="button"
        onClick={onBackToRoles}
        className="w-full text-center text-xs font-display font-bold text-[#71717A] hover:text-[#E76F51] transition-colors flex items-center justify-center gap-1 cursor-pointer pt-2"
      >
        <ArrowLeft size={14} />
        Back to Terminal Roles
      </button>
    </motion.div>
  );
};
