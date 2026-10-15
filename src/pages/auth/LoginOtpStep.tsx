import React, { FormEvent, useEffect, useRef, useState } from "react";

import { ArrowLeft, KeyRound, Loader2, ShieldCheck, Lock } from "lucide-react";

interface LoginOtpStepProps {
  username: string;

  /**
   * Development-only OTP.
   *
   * Remove this from production once Laravel starts
   * sending OTP through email/SMS.
   */
  developmentOtp?: string;

  isSubmitting: boolean;

  errorText: string;

  onSubmit: (otp: string) => void;

  onBack: () => void;
}

export const LoginOtpStep: React.FC<LoginOtpStepProps> = ({
  username,
  developmentOtp,
  isSubmitting,
  errorText,
  onSubmit,
  onBack,
}) => {
  const [otp, setOtp] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Automatically focus OTP input when
   * the component becomes visible.
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      return;
    }

    onSubmit(cleanOtp);
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);

    setOtp(digits);
  };

  return (
    <div className="space-y-4">
      {/* Development-only OTP notice */}
      {developmentOtp && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
          <div className="flex items-start gap-3">
            <KeyRound size={20} className="text-amber-700 shrink-0 mt-0.5" />

            <div>
              <strong className="block text-[11px] uppercase font-bold">
                Development OTP
              </strong>

              <p className="text-[11px] mt-1">
                Your backend currently exposes the development OTP. Do not
                expose this value in production.
              </p>

              <code className="inline-block mt-2 bg-amber-100 px-2 py-1 rounded font-mono font-bold tracking-widest">
                {developmentOtp}
              </code>
            </div>
          </div>
        </div>
      )}

      {errorText && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono font-bold flex items-center gap-2">
          <Lock size={16} className="text-rose-600 shrink-0" />

          <span>{errorText}</span>
        </div>
      )}

      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck size={28} className="text-white" />
        </div>

        <h3 className="text-xl font-display font-bold text-[#1F2226] mt-4">
          Verify Your Login
        </h3>

        <p className="text-xs sm:text-sm text-[#5C6168] mt-1">
          Enter the 6-digit OTP sent for
        </p>

        <p className="text-xs font-mono font-bold text-[#1F2226] mt-1">
          {username}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-otp"
            className="form-label text-xs font-semibold"
          >
            One-Time Password *
          </label>

          <input
            ref={inputRef}
            id="login-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={otp}
            onChange={(event) => handleOtpChange(event.target.value)}
            placeholder="Enter 6-digit OTP"
            className="input-field min-h-[48px] font-mono text-center text-lg tracking-[0.45em]"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otp.length !== 6}
          className="btn-primary w-full min-h-[48px] py-3.5 text-xs sm:text-sm uppercase tracking-wider flex justify-center items-center gap-2 font-bold cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />

              <span>Verifying OTP...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />

              <span>Verify & Sign In</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full text-xs font-display font-bold text-[#71717A] hover:text-[#1F2226] transition-colors flex justify-center items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Login
        </button>
      </form>
    </div>
  );
};
