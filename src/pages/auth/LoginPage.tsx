import React, { useState } from "react";

import { ArrowLeft, KeyRound, Loader2, ShieldCheck, Lock } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { AuthService } from "@/src/services/auth.service";

import { useAuth } from "@/src/context/AuthContext";

import { setAuthToken, ApiError } from "@/src/services/api/client";

import { LoginOtpStep } from "@/src/pages/auth/LoginOtpStep";

import { UserRole } from "@/src/types/AuthTypes";

export const LoginPage = () => {
  const navigate = useNavigate();

  const { refreshSession } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* Login fields                                                             */
  /* ------------------------------------------------------------------------ */

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  /* ------------------------------------------------------------------------ */
  /* OTP state                                                                */
  /* ------------------------------------------------------------------------ */

  const [pendingUsername, setPendingUsername] = useState("");

  const [developmentOtp, setDevelopmentOtp] = useState<string | undefined>(
    undefined,
  );

  const [isOtpStep, setIsOtpStep] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* UI state                                                                 */
  /* ------------------------------------------------------------------------ */

  const [errorText, setErrorText] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const onReturnToDining = () => {
    navigate("/customer");
  };

  const onGoToRegister = () => {
    navigate("/auth/register-merchant");
  };

  /**
   * Navigate according to the role
   * returned by Laravel.
   */
  const navigateByRole = (role: UserRole | null | undefined) => {
    switch (role) {
      case "owner":
        navigate("/admin/dashboard/owner");
        return;

      case "manager":
        navigate("/admin/dashboard/manager");
        return;

      case "waiter":
        navigate("/staff/dashboard/waiter");
        return;

      case "kitchen":
        navigate("/staff/dashboard/kitchen");
        return;

      default:
        setErrorText(
          "Login succeeded, but the authenticated user role could not be determined.",
        );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Username + password                                                      */
  /* ------------------------------------------------------------------------ */

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setErrorText("Please enter your username and password.");

      return;
    }

    setIsSubmitting(true);
    setErrorText("");

    try {
      const response = await AuthService.login({
        username: cleanUsername,

        password,
      });

      /*
       * Failed authentication.
       *
       * apiRequest() normally throws HTTP 4xx/5xx,
       * but this also protects us against a valid
       * HTTP response containing success=false.
       */
      if (!response.success) {
        setErrorText(response.message || "Authentication failed.");

        return;
      }

      /*
       * Owner / manager:
       *
       * Password is valid.
       * Laravel now expects OTP verification.
       *
       * DO NOT store a token yet because
       * there isn't one.
       */
      if (response.requiresOtp) {
        setPendingUsername(cleanUsername);

        setDevelopmentOtp(response.developmentOtp);

        setIsOtpStep(true);

        return;
      }

      /*
       * Waiter / kitchen:
       *
       * Laravel already issued a Sanctum token.
       */
      if (response.token) {
        /*
         * Persist token before making any
         * authenticated request.
         */
        setAuthToken(response.token);

        /*
         * Ask Laravel to validate the new
         * token and restore user + role.
         */
        const role = await refreshSession();

        /*
         * Only navigate after the authenticated
         * session has actually been established.
         */
        navigateByRole(role);

        return;
      }

      /*
       * Successful HTTP response but no authentication
       * challenge and no token.
       */
      setErrorText(
        "The server accepted the login but did not return an authentication token or OTP challenge.",
      );
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof ApiError) {
        setErrorText(error.message);
      } else {
        setErrorText(
          "Unable to connect to the authentication server. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* OTP verification                                                         */
  /* ------------------------------------------------------------------------ */

  const handleOtpSubmit = async (otp: string) => {
    setIsSubmitting(true);
    setErrorText("");

    try {
      const response = await AuthService.verifyLoginOtp(pendingUsername, otp);

      if (!response.success) {
        setErrorText(response.message || "OTP verification failed.");

        return;
      }

      /*
       * OTP was accepted.
       *
       * Now Laravel has actually created
       * the authenticated Sanctum token.
       */
      if (!response.token) {
        setErrorText(
          "OTP was accepted, but the server did not return an authentication token.",
        );

        return;
      }

      /*
       * Persist token BEFORE check-me.
       */
      setAuthToken(response.token);

      /*
       * Restore the authenticated session
       * from Laravel.
       */
      const role = await refreshSession();

      navigateByRole(role);
    } catch (error) {
      console.error("OTP verification error:", error);

      if (error instanceof ApiError) {
        setErrorText(error.message);
      } else {
        setErrorText("Unable to verify OTP. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Back from OTP                                                           */
  /* ------------------------------------------------------------------------ */

  const handleBackToLogin = () => {
    setIsOtpStep(false);

    setPendingUsername("");

    setDevelopmentOtp(undefined);

    setErrorText("");
  };

  /* ------------------------------------------------------------------------ */
  /* OTP screen                                                               */
  /* ------------------------------------------------------------------------ */

  if (isOtpStep) {
    return (
      <div
        className="min-h-[85vh] flex flex-col items-center justify-start p-3 sm:p-6"
        id="login-container"
      >
        <div
          className="max-w-xl w-full bg-white rounded-3xl border border-[#E8E4DA] p-5 sm:p-8 shadow-xl relative overflow-hidden"
          id="login-panel"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E76F51]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="text-center mb-6 relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E76F51] to-[#F4A261] flex items-center justify-center font-display font-black text-white text-2xl mx-auto shadow-md mb-3">
              B
            </div>

            <span className="text-[11px] font-mono tracking-widest text-[#E76F51] font-bold uppercase block">
              Brilixis Dining OS • Portal
            </span>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#1F2226] tracking-tight mt-1 leading-tight">
              Two-Step Verification
            </h2>
          </div>

          <LoginOtpStep
            username={pendingUsername}
            developmentOtp={developmentOtp}
            isSubmitting={isSubmitting}
            errorText={errorText}
            onSubmit={handleOtpSubmit}
            onBack={handleBackToLogin}
          />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Login screen                                                             */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="min-h-[85vh] flex flex-col items-center justify-start p-3 sm:p-6"
      id="login-container"
    >
      <div
        className="max-w-xl w-full bg-white rounded-3xl border border-[#E8E4DA] p-5 sm:p-8 shadow-xl relative overflow-hidden"
        id="login-panel"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E76F51]/10 blur-3xl rounded-full pointer-events-none" />

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
            Sign in with your registered restaurant credentials to open the
            staff terminal hub.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4 text-left"
          id="admin-login-form"
        >
          <div className="p-3.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-2xl font-sans leading-relaxed flex items-start gap-3 shadow-xs">
            <KeyRound size={20} className="text-[#E76F51] shrink-0 mt-0.5" />

            <div>
              <strong className="font-display font-bold uppercase text-[11px] block text-[#1F2226]">
                Restaurant Credentials
              </strong>

              <span className="text-[11px]">
                Enter the username generated for your restaurant account and
                your password.
                <br />
                Owner and manager accounts require OTP verification after
                password authentication.
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
            <label
              htmlFor="login-username"
              className="form-label text-xs font-semibold"
            >
              Username *
            </label>

            <input
              id="login-username"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. AB12_ADMIN"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="input-field min-h-[44px] font-mono text-xs sm:text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="form-label text-xs font-semibold"
            >
              Password *
            </label>

            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field min-h-[44px] font-mono text-xs sm:text-sm"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full min-h-[48px] py-3.5 text-xs sm:text-sm uppercase tracking-wider mt-2 flex justify-center items-center gap-2 font-bold cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />

                <span>Authenticating Account...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />

                <span>Continue Sign In</span>
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
