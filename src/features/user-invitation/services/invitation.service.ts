import { apiRequest } from "@/src/services/api/client";

export interface SetupInvitationPasswordPayload {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface SetupInvitationPasswordResponse {
  success?: boolean;
  message?: string;
  username?: string;
  data?: {
    username?: string;
  };
}

/**
 * Completes the password setup for an invitation.
 * The current Laravel route is POST /api/v1/auth/setup-account.
 */
export function setupInvitationPassword(
  payload: SetupInvitationPasswordPayload,
): Promise<SetupInvitationPasswordResponse> {
  return apiRequest<SetupInvitationPasswordResponse>("/api/v1/auth/setup-account", {
    method: "POST",
    body: JSON.stringify({
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    }),
  });
}
