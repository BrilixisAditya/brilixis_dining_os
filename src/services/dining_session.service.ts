import { apiRequest } from "./api/client";

export type DiningSessionStatus = "open" | "closed" | "cancelled";

type LaravelDiningSessionStatus = 1 | 2 | 3;

interface LaravelDiningSession {
  id: number;
  restaurant_id: number;
  table_id: number;
  status: LaravelDiningSessionStatus;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  table: {
    id: number;
    table_name: string;
    table_code: string;
  };
}

interface LaravelDiningSessionListResponse {
  success: boolean;
  message: string;
  data: LaravelDiningSession[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface DiningSession {
  id: number;
  restaurantId: number;
  tableId: number;
  tableName: string;
  tableCode: string;
  status: DiningSessionStatus;
  startedAt: string;
  endedAt: string | null;
}

export interface DiningSessionPagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface DiningSessionList {
  sessions: DiningSession[];
  pagination: DiningSessionPagination;
}

function normalizeStatus(
  status: LaravelDiningSessionStatus,
): DiningSessionStatus {
  switch (status) {
    case 1:
      return "open";
    case 2:
      return "closed";
    case 3:
      return "cancelled";
  }
}

function normalizeSession(session: LaravelDiningSession): DiningSession {
  return {
    id: session.id,
    restaurantId: session.restaurant_id,
    tableId: session.table_id,
    tableName: session.table.table_name,
    tableCode: session.table.table_code,
    status: normalizeStatus(session.status),
    startedAt: session.started_at,
    endedAt: session.ended_at,
  };
}

export class DiningSessionService {
  static async getSessions(options?: {
    status?: LaravelDiningSessionStatus;
    perPage?: number;
  }): Promise<DiningSessionList> {
    const response = await apiRequest<LaravelDiningSessionListResponse>(
      "/api/v1/restaurant/dining-sessions",
      {
        method: "GET",
        query: {
          status: options?.status,
          per_page: options?.perPage ?? 20,
        },
      },
    );

    return {
      sessions: response.data.map(normalizeSession),
      pagination: {
        currentPage: response.pagination.current_page,
        perPage: response.pagination.per_page,
        total: response.pagination.total,
        lastPage: response.pagination.last_page,
      },
    };
  }

  static async closeSession(sessionId: number): Promise<void> {
    const response = await apiRequest<{
      success: boolean;
      message: string;
    }>(`/api/v1/restaurant/dining-sessions/${sessionId}/close`, {
      method: "PATCH",
    });

    if (!response.success) {
      throw new Error(
        response.message || "Unable to close the dining session.",
      );
    }
  }
}
