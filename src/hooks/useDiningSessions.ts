import { useCallback, useEffect, useState } from "react";
import {
  DiningSession,
  DiningSessionPagination,
  DiningSessionService,
} from "@/src/services/dining_session.service";
import { getApiErrorMessage } from "@/src/services/api/client";

interface UseDiningSessionsReturn {
  sessions: DiningSession[];
  pagination: DiningSessionPagination | null;
  isLoading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
}

export default function useDiningSessions(): UseDiningSessionsReturn {
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [pagination, setPagination] = useState<DiningSessionPagination | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DiningSessionService.getSessions();

      setSessions(result.sessions);
      setPagination(result.pagination);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to load dining sessions.",
      );

      setError(message);
      console.error("Failed to fetch dining sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  return {
    sessions,
    pagination,
    isLoading,
    error,
    refreshSessions,
  };
}
