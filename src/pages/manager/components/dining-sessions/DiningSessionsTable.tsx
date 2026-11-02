import { useEffect, useState } from "react";
import type { DiningSession } from "@/src/services/dining_session.service";
import DiningSessionStatusBadge from "./DiningSessionStatusBadge";

interface DiningSessionsTableProps {
  sessions: DiningSession[];
  onCloseSession: (sessionId: number) => Promise<void>;
}

function formatStartedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(session: DiningSession, now: number): string {
  const startTime = new Date(session.startedAt).getTime();

  if (Number.isNaN(startTime)) {
    return "—";
  }

  const endTime = session.endedAt
    ? new Date(session.endedAt).getTime()
    : session.status === "open"
      ? now
      : null;

  if (endTime === null || Number.isNaN(endTime)) {
    return "—";
  }

  const totalMinutes = Math.max(0, Math.floor((endTime - startTime) / 60_000));

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export default function DiningSessionsTable({
  sessions,
  onCloseSession,
}: DiningSessionsTableProps) {
  const [now, setNow] = useState(() => Date.now());
  const [closingSessionId, setClosingSessionId] = useState<number | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleCloseSession = async (session: DiningSession) => {
    if (session.status !== "open" || closingSessionId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Close session #${session.id} for ${session.tableName} (${session.tableCode})?`,
    );

    if (!confirmed) {
      return;
    }

    setClosingSessionId(session.id);

    try {
      await onCloseSession(session.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to close the dining session. Please try again.",
      );
    } finally {
      setClosingSessionId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#ECE7E1] bg-[#FAF9F6] text-[10px] uppercase tracking-wider text-[#8C7A6B]">
            <th className="px-4 py-3 font-bold">Session</th>
            <th className="px-4 py-3 font-bold">Table</th>
            <th className="px-4 py-3 font-bold">Started At</th>
            <th className="px-4 py-3 font-bold">Duration</th>
            <th className="px-4 py-3 font-bold">Status</th>
            <th className="px-4 py-3 font-bold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#ECE7E1]/70">
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="transition-colors hover:bg-[#FAF9F6]"
            >
              <td className="px-4 py-4">
                <span className="font-mono text-xs font-bold text-[#2D2D2D]">
                  #{session.id}
                </span>
              </td>

              <td className="px-4 py-4">
                <div className="text-xs font-bold text-[#2D2D2D]">
                  {session.tableName}
                </div>
                <div className="mt-1 text-[10px] text-[#8C7A6B]">
                  {session.tableCode}
                </div>
              </td>

              <td className="px-4 py-4 text-xs text-[#6B7280]">
                {formatStartedAt(session.startedAt)}
              </td>

              <td className="px-4 py-4">
                <span className="text-xs font-semibold text-[#2D2D2D]">
                  {formatDuration(session, now)}
                </span>
              </td>

              <td className="px-4 py-4">
                <DiningSessionStatusBadge status={session.status} />
              </td>
              <td className="px-4 py-4">
                {session.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => void handleCloseSession(session)}
                    disabled={closingSessionId !== null}
                    className="whitespace-nowrap rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {closingSessionId === session.id
                      ? "Closing..."
                      : "Close Session"}
                  </button>
                ) : (
                  <span className="text-xs text-[#8C7A6B]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
