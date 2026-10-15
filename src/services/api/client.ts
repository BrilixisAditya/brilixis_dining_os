/**
 * Central HTTP client used by frontend services.
 *
 * Responsibilities:
 * - Build API URLs
 * - Add query parameters
 * - Attach authentication token
 * - Send JSON requests
 * - Parse responses
 * - Normalize HTTP errors
 */

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);

    this.name = "ApiError";

    this.status = status;

    this.data = data;
  }
}

/* -------------------------------------------------------------------------- */
/* Authentication token                                                       */
/* -------------------------------------------------------------------------- */

const AUTH_TOKEN_KEY = "brilixis_auth_token";

/**
 * Store Sanctum Bearer token.
 *
 * localStorage allows the authentication token
 * to survive page reloads and browser restarts.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Read current authentication token.
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Remove authentication token.
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/* -------------------------------------------------------------------------- */
/* API configuration                                                          */
/* -------------------------------------------------------------------------- */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

/* -------------------------------------------------------------------------- */
/* URL builder                                                                */
/* -------------------------------------------------------------------------- */

function buildUrl(
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const url = new URL(path, `${API_BASE_URL || window.location.origin}/`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

/* -------------------------------------------------------------------------- */
/* Response parser                                                            */
/* -------------------------------------------------------------------------- */

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

/* -------------------------------------------------------------------------- */
/* Main request function                                                      */
/* -------------------------------------------------------------------------- */

export async function apiRequest<T>(
  path: string,
  options: RequestInit & {
    query?: Record<string, string | number | undefined>;
  } = {},
): Promise<T> {
  const { query, headers, ...requestOptions } = options;

  const token = getAuthToken();

  const response = await fetch(buildUrl(path, query), {
    ...requestOptions,

    headers: {
      Accept: "application/json",

      ...(requestOptions.body !== undefined
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      /*
       * Automatically authenticate
       * requests when a token exists.
       */
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...headers,
    },
  });

  const data = await parseResponse(response);
  console.log(data);

  if (!response.ok) {
    /*
     * The server says the token is invalid,
     * expired, revoked, or otherwise unauthorized.
     *
     * Remove the local copy so AuthContext does
     * not keep trying to use a dead token.
     */
    if (response.status === 401) {
      clearAuthToken();
    }

    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `Request failed with HTTP ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

/* -------------------------------------------------------------------------- */
/* Error helpers                                                              */
/* -------------------------------------------------------------------------- */

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return error instanceof ApiError ? error.message : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
