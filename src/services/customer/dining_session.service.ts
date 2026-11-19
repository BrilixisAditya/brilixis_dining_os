import { apiRequest } from "../api/client";

/** Data the customer needs after a QR code has been validated. */
export interface DiningSessionContext {
  qrToken: string;
  diningSessionId: string;
  tableId: string;
  tableName: string;
  restaurantId: string;
  restaurantName: string;
}

/**
 * Actual Laravel response contract:
 *
 * POST /api/v1/restaurant/customer/enter-dining-session
 *
 * Request:
 * {
 *   qr_token: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   data: {
 *     created: boolean,
 *     session: {
 *       id: number,
 *       restaurant_id: number,
 *       table_id: number,
 *       status: number,
 *       started_at: string,
 *       ended_at: string | null,
 *       created_at: string,
 *       updated_at: string
 *     }
 *   }
 * }
 */

interface DiningSessionApiResponse {
  success: boolean;
  message?: string;
  data?: {
    created: boolean;
    session?: {
      id: number;
      restaurant_id: number;
      table_id: number;
      status: number;
      started_at: string;
      ended_at: string | null;
      created_at: string;
      updated_at: string;
    };
    table?: {
      table_name: string;
    };
    restaurant_name?: string;
  };
}

/**
 * Validates the QR token on Laravel's side and
 * resolves the dining session, table, and restaurant.
 */
export async function enterDiningSession(
  qrToken: string,
  diningSessionId?: string,
): Promise<DiningSessionContext> {
  // Build the request payload.
  const requestBody: {
    qr_token: string;
    dining_session_id?: number;
  } = {
    qr_token: qrToken,
  };

  // Include the exact session ID when resuming a previous session.
  if (diningSessionId !== undefined) {
    const parsedSessionId = Number(diningSessionId);

    if (!Number.isSafeInteger(parsedSessionId) || parsedSessionId <= 0) {
      throw new Error("Invalid dining session ID.");
    }

    requestBody.dining_session_id = parsedSessionId;
  }

  const response = await apiRequest<DiningSessionApiResponse>(
    "/api/v1/restaurant/customer/enter-dining-session",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
  );

  console.log("Enter dining session response:", response);

  // Backend explicitly tells us whether the request succeeded.
  if (!response.success) {
    throw new Error(response.message || "The QR code could not be validated.");
  }

  const session = response.data?.session;
  const table = response.data?.table;
  const restaurant_name = response.data?.restaurant_name;

  // The backend says success=true, but we still validate
  // that the required session object was actually returned.
  if (!session) {
    throw new Error("The dining session was not returned by the server.");
  }

  if (!table) {
    throw new Error("The table information was not returned by the server.");
  }

  if (!restaurant_name) {
    throw new Error("The restaurant name was not returned by the server.");
  }

  if (
    session.id === undefined ||
    session.id === null ||
    session.table_id === undefined ||
    session.table_id === null ||
    session.restaurant_id === undefined ||
    session.restaurant_id === null
  ) {
    throw new Error(
      "The dining session information returned by the server is incomplete.",
    );
  }

  return {
    qrToken,

    // Convert database integer IDs to strings for
    // consistent frontend handling.
    diningSessionId: String(session.id),

    tableId: String(session.table_id),

    tableName: table.table_name,

    restaurantId: String(session.restaurant_id),
    restaurantName: restaurant_name,
  };
}
