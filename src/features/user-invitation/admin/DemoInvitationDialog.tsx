import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Mail, X } from "lucide-react";

export interface DemoInvitationDialogProps {
  fullname: string;
  email: string;
  username: string;
  token: string;
  onClose: () => void;
}

/**
 * Demo-only replacement for an email engine.
 * It previews the invitation and lets an admin copy/share the actual link.
 * It deliberately does not send email or persist the raw invitation token.
 */
export default function DemoInvitationDialog({
  fullname,
  email,
  username,
  token,
  onClose,
}: DemoInvitationDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const invitationUrl = useMemo(() => {
    // Assumes the React app is served from the domain root, as in the current Vite setup.
    const url = new URL("/accept-invitation", window.location.origin);
    url.searchParams.set("token", token);
    return url.toString();
  }, [token]);

  const copyInvitationLink = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyError(
        "Clipboard access was blocked. Select the invitation link above and copy it manually.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-invitation-title"
        className="my-8 w-full max-w-xl space-y-5 rounded-2xl border border-[#ECE7E1] bg-white p-5 shadow-2xl sm:p-6"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C83214]/10 text-[#C83214]">
              <Mail size={19} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C83214]">
                Demo email workflow
              </p>
              <h2 id="demo-invitation-title" className="mt-1 text-lg font-bold text-[#2D2D2D]">
                Staff invitation is ready
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation dialog"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={18} />
          </button>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <strong>No email has been sent.</strong> This isolated demo component previews the invitation. Copy the link and share it manually. An email provider can be connected later without changing the password setup page.
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E8E5DD]">
          <div className="border-b border-[#E8E5DD] bg-[#FAF9F6] px-4 py-3 text-xs text-[#6B7280]">
            <p><span className="font-semibold text-[#2D2D2D]">To:</span> {email}</p>
            <p className="mt-1"><span className="font-semibold text-[#2D2D2D]">Subject:</span> Set up your restaurant staff account</p>
          </div>
          <div className="space-y-3 p-4 text-sm leading-6 text-[#454545]">
            <p>Hello {fullname},</p>
            <p>
              You have been invited to set up your staff account. Open the secure one-time link below to create your password and complete account setup.
            </p>
            <div className="rounded-lg border border-dashed border-[#E8E5DD] bg-[#FFFDF8] p-3">
              <label htmlFor="demo-invitation-url" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                One-time invitation link
              </label>
              <input
                id="demo-invitation-url"
                type="text"
                readOnly
                value={invitationUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="w-full rounded-lg border border-[#E8E5DD] bg-white px-3 py-2 font-mono text-xs text-[#2D2D2D] outline-none focus:border-[#E76F51]"
              />
              <p className="mt-2 text-[11px] text-[#6B7280]">
                This link contains a secret token. Treat it like a password. According to the current staff API, it expires after 3 days and can be used once.
              </p>
            </div>
            <p>After setup, use your assigned username to sign in:</p>
            <p className="inline-flex rounded-lg bg-[#FAF9F6] px-3 py-2 font-mono text-sm font-bold text-[#2D2D2D]">
              {username}
            </p>
            <p>Thank you.</p>
          </div>
        </div>

        {copyError && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
            {copyError}
          </p>
        )}

        <footer className="flex flex-col-reverse gap-2 border-t border-[#ECE7E1] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => window.open(invitationUrl, "_blank", "noopener,noreferrer")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E5DD] px-4 py-2.5 text-xs font-bold text-[#454545] hover:bg-[#FAF9F6]"
          >
            Preview setup page <ExternalLink size={14} />
          </button>
          <button
            type="button"
            onClick={() => void copyInvitationLink()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C83214] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#A82912]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Invitation link copied" : "Copy invitation link"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-neutral-100 px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-200"
          >
            Done
          </button>
        </footer>
      </section>
    </div>
  );
}
