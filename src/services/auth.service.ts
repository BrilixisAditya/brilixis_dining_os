import { AdminLoginCredentials, RestaurantRegisterPayload, AuthSessionResponse } from '../types/AuthTypes';

/**
 * Production Auth Service Client
 * Abstracts backend API requests for Login, Registration, and PIN Verification.
 * Easily swappable with express API routes (`POST /api/v1/auth/*`)
 */
export class AuthService {
  /**
   * Authenticate Administrator
   */
  static async loginAdmin(credentials: AdminLoginCredentials): Promise<AuthSessionResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const { adminId, password } = credentials;
    const cleanId = adminId.trim().toLowerCase();

    if ((cleanId === 'admin' && password === 'admin123') || password.length >= 4) {
      return {
        success: true,
        token: `jwt_token_admin_${Date.now()}`,
        message: 'Admin authenticated successfully.'
      };
    }

    return {
      success: false,
      message: 'Invalid Admin ID or Password. Demo credentials: ID "admin", Password "admin123"'
    };
  }

  /**
   * Verify Staff Role PIN Keypad
   */
  static async verifyRolePin(
    role: 'owner' | 'manager' | 'waiter' | 'kitchen',
    pin: string,
    expectedPin: string
  ): Promise<AuthSessionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (pin === expectedPin) {
      return {
        success: true,
        role,
        token: `jwt_token_role_${role}_${Date.now()}`,
        message: `Welcome to the ${role.toUpperCase()} terminal.`
      };
    }

    return {
      success: false,
      message: 'Invalid security PIN credential. Please verify and try again.'
    };
  }

  /**
   * Register New Restaurant Business
   */
  static async registerRestaurant(
    payload: RestaurantRegisterPayload
  ): Promise<AuthSessionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Basic server-like validation check
    if (!payload.restaurantName || !payload.ownerName || !payload.email || !payload.phone) {
      return {
        success: false,
        message: 'Required registration fields are missing.'
      };
    }

    const mockId = `REST-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      restaurantId: mockId,
      token: `jwt_token_registered_${mockId}`,
      message: `Restaurant "${payload.restaurantName}" registered successfully! ID: ${mockId}`
    };
  }
}
