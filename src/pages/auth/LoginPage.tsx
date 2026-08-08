import React, { useState } from "react";
import { ArrowLeft, Loader2, KeyRound, ShieldCheck, Lock } from "lucide-react";
import { AuthService } from "@/src/services/auth.service";
import { useNavigate } from "react-router-dom";

// ⚠️ THIS LOGIN PAGE IS FOR ADMIN AND STAFF ONLY


export const LoginPage = () => {
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();


  const onReturnToDining = () => navigate('/customer');
  const onGoToRegister = () => navigate('/auth/register-merchant');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !adminPassword.trim()) {
      setErrorText("Please enter both Account ID / Email and Password.");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");

    try {
      const response = await AuthService.loginAdmin({
        adminId,
        password: adminPassword,
      });
      if (response.success) {
        // Navigate directly to post-login Terminal Hub page when login get's success
        switch(response.role){
          case 'owner':
              return navigate("/admin/dashboard/owner");
              break;
          case 'manager':
              return navigate("/admin/dashboard/manager");
              break;
          case 'waiter':
              return navigate("/staff/dashboard/waiter");
              break;
          case 'kitchen':
              return navigate("/staff/dashboard/kitchen");
              break;
          default:
            setErrorText("Something went wrong while logging-in!");
        }
      } else {
        setErrorText(response.message || "Authentication failed.");
      }
    } catch (err) {
      setErrorText("Server connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          Restaurant Account Sign-In
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6168] mt-1 max-w-md mx-auto">
            Sign in with your registered restaurant credentials to open staff terminal hub
          </p>
        </div>

    <form
      onSubmit={handleSubmit}
      className="space-y-4 text-left"
      id="admin-login-form"
    >
      {/* Demo Credentials Notice */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-900 text-xs rounded-2xl font-sans leading-relaxed flex items-start gap-3 shadow-xs">
        <KeyRound size={20} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-display font-bold uppercase text-[11px] block text-amber-800">
            Account Credentials Required
          </strong>
          <span className="text-[11px]">
            Enter your Restaurant Account ID or registered Email address and
            Password.
            <br />
            <strong>Demo Credentials:</strong> ID{" "}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">
              admin
            </code>{" "}
            & Password{" "}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">
              admin123
            </code>
          </span>
        </div>
      </div>

      {errorText && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono font-bold flex items-center gap-2">
          <Lock size={16} className="text-rose-600 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      <div>
        <label className="form-label text-xs font-semibold">
          Account ID / Username *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. admin or owner@hush.com"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="input-field min-h-[44px] font-mono text-xs sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="form-label text-xs font-semibold">
          Password *
        </label>
        <input
          type="password"
          required
          placeholder="••••••••"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="input-field min-h-[44px] font-mono text-xs sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full min-h-[48px] py-3.5 text-xs sm:text-sm uppercase tracking-wider mt-2 flex justify-center items-center gap-2 font-bold cursor-pointer shadow-md"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Authenticating Account...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>Sign In & Unlock Role Terminals</span>
          </>
        )}
      </button>

      <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
        <button
          type="button"
          onClick={onGoToRegister}
          className="text-xs font-display font-bold text-[#E76F51] hover:underline cursor-pointer"
        >
          Need an account? Register restaurant
        </button>

        <button
          type="button"
          onClick={onReturnToDining}
          className="text-xs font-display font-bold text-[#71717A] hover:text-[#1F2226] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Return to Customer Menu
        </button>
      </div>
    </form>
    </div>
    </div>
  );
};
