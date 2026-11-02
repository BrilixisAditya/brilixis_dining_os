import { RefreshCw, UtensilsCrossed } from "lucide-react";
import useDiningSessions from "@/src/hooks/useDiningSessions";
import DiningSessionsTable from "./DiningSessionsTable";
import { DiningSessionService } from "@/src/services/dining_session.service";

export default function DiningSessionsTab() {
  const { sessions, pagination, isLoading, error, refreshSessions } =
    useDiningSessions();

  const handleCloseSession = async (sessionId: number) => {
    await DiningSessionService.closeSession(sessionId);
    await refreshSessions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[#ECE7E1] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-[#E76F51]">
            Floor Operations
          </span>

          <h3 className="mt-1 text-lg font-display font-black text-[#2D2D2D]">
            Dining Sessions
          </h3>

          <p className="mt-1 text-xs text-[#8C7A6B]">
            Monitor table seating, session duration, and current status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshSessions()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#ECE7E1] bg-[#FFFDF8] px-4 py-3 text-xs font-bold text-[#2D2D2D] transition-colors hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh Sessions
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"
        >
          <p className="font-bold">Unable to load dining sessions.</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-[#ECE7E1] bg-white">
        <div className="flex flex-col gap-1 border-b border-[#ECE7E1] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-display font-bold text-[#2D2D2D]">
            Session Records
          </h4>

          <span className="text-[11px] text-[#8C7A6B]">
            {pagination
              ? `Showing ${sessions.length} of ${pagination.total} sessions`
              : `${sessions.length} sessions loaded`}
          </span>
        </div>

        {isLoading && sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <RefreshCw size={22} className="animate-spin text-[#E76F51]" />
            <p className="text-xs text-[#8C7A6B]">Loading dining sessions...</p>
          </div>
        ) : error && sessions.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#8C7A6B]">
            Session records are unavailable. Use Refresh Sessions to retry.
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <UtensilsCrossed size={28} className="mb-3 text-[#C8B8A9]" />
            <h5 className="text-sm font-bold text-[#2D2D2D]">
              No dining sessions found
            </h5>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8C7A6B]">
              Sessions will appear here when customers begin seating at
              restaurant tables.
            </p>
          </div>
        ) : (
          <DiningSessionsTable
            sessions={sessions}
            onCloseSession={handleCloseSession}
          />
        )}
      </div>
    </div>
  );
}
