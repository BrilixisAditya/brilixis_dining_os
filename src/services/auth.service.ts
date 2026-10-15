import { apiRequest } from "./api/client";

import {
  AdminLoginCredentials,
  AuthUser,
  CheckMeResponse,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
  RestaurantRegisterPayload,
  SetupAccountResponse,
  UserRole,
  VerifyOtpResponse,
} from "../types/AuthTypes";

/* -------------------------------------------------------------------------- */
/* Raw Laravel API response types                                            */
/* -------------------------------------------------------------------------- */

/**
 * Raw response returned by:
 *
 * POST /api/v1/auth/login
 *
 * IMPORTANT:
 * Laravel currently has two successful login shapes:
 *
 * Owner / manager:
 * {
 *   success: true,
 *   requires_otp: true,
 *   development_otp: "123456"
 * }
 *
 * Waiter / kitchen:
 * {
 *   success: true,
 *   data: {
 *     token: "...",
 *     user: {...}
 *   }
 * }
 */
interface LaravelLoginResponse {
  success: boolean;
  message?: string;

  requires_otp?: boolean;
  development_otp?: string;

  token?: string;
  token_type?: string;

  code?: string;
  can_logout_all?: boolean;

  data?: {
    token?: string;

    user?: Record<string, unknown>;

    role?: UserRole;
  };
}

/**
 * Raw response returned by:
 *
 * POST /api/v1/auth/verify-login-otp
 */
interface LaravelVerifyOtpResponse {
  success: boolean;
  message?: string;

  token?: string;
  token_type?: string;

  data?: {
    user?: Record<string, unknown>;

    role?: UserRole;
  };
}

/**
 * Raw response returned by:
 *
 * GET /api/v1/auth/check-me
 *
 * This supports both:
 *
 * data: {
 *   user: {...},
 *   role: "owner"
 * }
 *
 * and the CURRENT Laravel implementation:
 *
 * data: {
 *   id: 1,
 *   fullname: "...",
 *   ...
 * }
 */
interface LaravelCheckMeResponse {
  success: boolean;
  message?: string;

  data?: unknown;
}

/**
 * Raw registration response returned by Laravel.
 */
interface LaravelRegisterResponse {
  success: boolean;
  message?: string;

  data?: {
    restaurant_code?: string;
    restaurant_name?: string;
    owner_username?: string;
    status?: number;
    invitation_token?: string;
  };
}

/**
 * Raw account setup response.
 */
interface LaravelSetupAccountResponse {
  success: boolean;
  message?: string;
}

/**
 * Raw logout response.
 */
interface LaravelLogoutResponse {
  success: boolean;
  message?: string;
}

/* -------------------------------------------------------------------------- */
/* User normalization                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Convert Laravel user object into the frontend AuthUser model.
 *
 * Laravel uses snake_case:
 *
 * restaurant_id
 * phone_no
 * role_id
 *
 * React uses camelCase:
 *
 * restaurantId
 * phoneNo
 * roleId
 */
function normalizeUser(
  rawUser: Record<string, unknown> | undefined,
): AuthUser | undefined {
  if (!rawUser) {
    return undefined;
  }

  return {
    id:
      rawUser.id !== undefined && rawUser.id !== null ? String(rawUser.id) : "",

    fullname: typeof rawUser.fullname === "string" ? rawUser.fullname : "",

    username: typeof rawUser.username === "string" ? rawUser.username : "",

    email: typeof rawUser.email === "string" ? rawUser.email : undefined,

    phoneNo:
      typeof rawUser.phone_no === "string" ? rawUser.phone_no : undefined,

    restaurantId:
      rawUser.restaurant_id !== undefined && rawUser.restaurant_id !== null
        ? String(rawUser.restaurant_id)
        : undefined,

    roleId:
      rawUser.role_id !== undefined && rawUser.role_id !== null
        ? String(rawUser.role_id)
        : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Role normalization                                                         */
/* -------------------------------------------------------------------------- */

function normalizeRole(value: unknown): UserRole | undefined {
  if (
    value === "owner" ||
    value === "manager" ||
    value === "waiter" ||
    value === "kitchen"
  ) {
    return value;
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Login response normalization                                               */
/* -------------------------------------------------------------------------- */

/**
 * Convert Laravel login response to frontend LoginResponse.
 */
function normalizeLoginResponse(response: LaravelLoginResponse): LoginResponse {
  return {
    success: response.success,

    message: response.message,

    /*
     * Laravel snake_case -> frontend camelCase.
     */
    requiresOtp: response.requires_otp,

    developmentOtp: response.development_otp,

    /*
     * IMPORTANT:
     *
     * Owner/manager OTP login does not return
     * a token here.
     *
     * Waiter/kitchen login returns:
     *
     * data.token
     *
     * Normalize both to one frontend field.
     */
    token: response.token ?? response.data?.token,

    tokenType: response.token_type,

    code: response.code,

    canLogoutAll: response.can_logout_all,

    data: {
      user: normalizeUser(response.data?.user),

      role: normalizeRole(response.data?.role),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* OTP response normalization                                                 */
/* -------------------------------------------------------------------------- */

function normalizeVerifyOtpResponse(
  response: LaravelVerifyOtpResponse,
): VerifyOtpResponse {
  return {
    success: response.success,

    message: response.message,

    token: response.token,

    tokenType: response.token_type,

    data: {
      user: normalizeUser(response.data?.user),

      role: normalizeRole(response.data?.role),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Check-me normalization                                                     */
/* -------------------------------------------------------------------------- */

function normalizeCheckMeResponse(
  response: LaravelCheckMeResponse,
): CheckMeResponse {
  const data = response.data;

  /*
   * Preferred backend shape:
   *
   * data: {
   *   user: {...},
   *   role: "owner"
   * }
   */
  if (isRecord(data) && isRecord(data.user)) {
    return {
      success: response.success,

      message: response.message,

      data: {
        user: normalizeUser(data.user),

        role: normalizeRole(data.role),
      },
    };
  }

  /*
   * CURRENT Laravel implementation:
   *
   * data: $request->user()
   *
   * So data itself is the user.
   *
   * Role may be unavailable until the backend
   * explicitly returns it.
   */
  if (isRecord(data)) {
    return {
      success: response.success,

      message: response.message,

      data: {
        user: normalizeUser(data),

        role: normalizeRole(data.role),
      },
    };
  }

  return {
    success: response.success,

    message: response.message,

    data: undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Registration response normalization                                        */
/* -------------------------------------------------------------------------- */

function normalizeRegisterResponse(
  response: LaravelRegisterResponse,
): RegisterResponse {
  return {
    success: response.success,

    message: response.message,

    data: {
      restaurantCode: response.data?.restaurant_code,

      restaurantName: response.data?.restaurant_name,

      ownerUsername: response.data?.owner_username,

      status: response.data?.status,

      invitationToken: response.data?.invitation_token,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/* -------------------------------------------------------------------------- */
/* Auth Service                                                               */
/* -------------------------------------------------------------------------- */

export class AuthService {
  /**
   * Login using username + password.
   *
   * Owner / manager:
   *   requiresOtp === true
   *
   * Waiter / kitchen:
   *   token is returned immediately.
   */
  static async login(
    credentials: AdminLoginCredentials,
  ): Promise<LoginResponse> {
    const response = await apiRequest<LaravelLoginResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          username: credentials.username.trim(),

          password: credentials.password,
        }),
      },
    );

    return normalizeLoginResponse(response);
  }

  /**
   * Verify OTP for owner/manager.
   */
  static async verifyLoginOtp(
    username: string,
    otp: string,
  ): Promise<VerifyOtpResponse> {
    const response = await apiRequest<LaravelVerifyOtpResponse>(
      "/api/v1/auth/verify-login-otp",
      {
        method: "POST",

        body: JSON.stringify({
          username: username.trim(),

          otp: otp.trim(),
        }),
      },
    );

    return normalizeVerifyOtpResponse(response);
  }

  /**
   * Validate and restore the current
   * authenticated user.
   */
  static async checkMe(): Promise<CheckMeResponse> {
    const response = await apiRequest<LaravelCheckMeResponse>(
      "/api/v1/auth/check-me",
      {
        method: "GET",
      },
    );

    return normalizeCheckMeResponse(response);
  }

  /**
   * Register a restaurant merchant.
   */
  static async registerRestaurant(
    payload: RestaurantRegisterPayload,
  ): Promise<RegisterResponse> {
    const response = await apiRequest<LaravelRegisterResponse>(
      "/api/v1/auth/restaurant/register-merchant",
      {
        method: "POST",

        body: JSON.stringify({
          restaurant_name: payload.restaurantName.trim(),

          owner_name: payload.ownerName.trim(),

          business_email_id: payload.email.trim().toLowerCase(),

          contact_no: payload.phone.trim(),

          gst_number: payload.gstNumber.trim() || null,

          fssai_number: payload.fssaiNumber.trim() || null,

          invoice_prefix: payload.invoicePrefix?.trim() || null,

          street_address: payload.address.trim() || null,

          city: payload.city.trim(),

          pincode: payload.pincode.trim() || null,

          state: payload.state.trim() || null,

          employee_staff_range: payload.employeeRange,

          total_dining_table: payload.totalTables,
        }),
      },
    );

    return normalizeRegisterResponse(response);
  }

  /**
   * Complete account setup using invitation token.
   */
  static async setupAccount(
    token: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<SetupAccountResponse> {
    return apiRequest<SetupAccountResponse>("/api/v1/auth/setup-account", {
      method: "POST",

      body: JSON.stringify({
        token,

        password,

        password_confirmation: passwordConfirmation,
      }),
    });
  }

  /**
   * Logout current device.
   */
  static async logout(): Promise<LogoutResponse> {
    return apiRequest<LogoutResponse>("/api/v1/auth/logout", {
      method: "POST",
    });
  }

  /**
   * Logout all devices.
   */
  static async logoutAll(): Promise<void> {
    await apiRequest("/api/v1/auth/logout-all", {
      method: "POST",
    });
  }
}
