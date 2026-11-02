import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { getApiErrorMessage } from "@/src/services/api/client";
import { setupInvitationPassword } from "../services/invitation.service";

export default function InvitationPasswordSetupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage(
        "This invitation link is missing its token. Ask your manager for a new invitation.",
      );
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await setupInvitationPassword({
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setUsername(response.data?.username ?? response.username ?? null);
      setCompleted(true);
      setPassword("");
      setPasswordConfirmation("");

      // Replace the URL after success so a completed one-time token is not left visible.
      setSearchParams({}, { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "We could not complete account setup. The link may be invalid, expired or already used.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-4 py-10 text-[#2D2D2D] sm:py-16">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#E8E5DD] bg-white shadow-sm">
        <div className="bg-[#262626] px-6 py-7 text-white sm:px-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            {completed ? <CheckCircle2 size={22} /> : <KeyRound size={22} />}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
            Restaurant staff account
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            {completed ? "Account setup submitted" : "Create your password"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {completed
              ? "Your password setup request completed. Follow the sign-in guidance below."
              : "Use the one-time invitation provided by your restaurant to finish setting up your account."}
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          {completed ? (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Password setup completed.</p>
                  <p className="mt-1 text-xs leading-5">
                    {username ? (
                      <>
                        Your username is{" "}
                        <strong className="font-mono">{username}</strong>.
                      </>
                    ) : (
                      "Use the username your manager shared with you."
                    )}{" "}
                    Keep it safe for future sign-in.
                  </p>
                </div>
              </div>
              <p className="text-xs leading-5 text-[#6B7280]">
                If you cannot sign in, contact your manager. Restaurant
                activation or business verification requirements may also
                restrict access.
              </p>
              <a
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#C83214] px-4 py-3 text-sm font-bold text-white hover:bg-[#A82912]"
              >
                Go to sign in
              </a>
            </div>
          ) : !token ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            >
              <p className="font-bold">Invitation link is incomplete</p>
              <p className="mt-1 text-xs leading-5">
                The token is missing from this URL. Ask your manager to generate
                or share the invitation link again.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-950">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <p>
                  This link identifies your account. You do not need to enter a
                  username on this page. Your assigned username will be shown
                  after setup if the API returns it.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="invitation-password"
                  className="block text-xs font-bold text-[#454545]"
                >
                  Password
                </label>
                <input
                  id="invitation-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[#DEDAD2] bg-white px-4 py-3 text-sm outline-none focus:border-[#C83214] focus:ring-2 focus:ring-[#C83214]/10"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="invitation-password-confirmation"
                  className="block text-xs font-bold text-[#454545]"
                >
                  Confirm password
                </label>
                <input
                  id="invitation-password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  placeholder="Enter the same password again"
                  className="w-full rounded-xl border border-[#DEDAD2] bg-white px-4 py-3 text-sm outline-none focus:border-[#C83214] focus:ring-2 focus:ring-[#C83214]/10"
                />
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-900"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !password || !passwordConfirmation}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C83214] px-4 py-3 text-sm font-bold text-white hover:bg-[#A82912] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {isSubmitting ? "Setting up account..." : "Create password"}
              </button>
              <p className="text-center text-[11px] leading-5 text-[#77736B]">
                Invitation links are one-time use and may expire. If this link
                no longer works, contact your restaurant manager.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
