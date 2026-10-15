import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { AuthUser, UserRole } from "../types/AuthTypes";

import { AuthService } from "../services/auth.service";

import { clearAuthToken, getAuthToken } from "../services/api/client";

interface AuthContextType {
  user: AuthUser | null;

  role: UserRole | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  /**
   * Validate the stored token against Laravel
   * and restore the current user.
   */
  refreshSession: () => Promise<UserRole | null>;

  /**
   * Logout current device.
   */
  logout: () => Promise<void>;

  /**
   * Logout all devices.
   */
  logoutAll: () => Promise<void>;

  /**
   * Check current user's role.
   */
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [role, setRole] = useState<UserRole | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restore the authenticated session.
   *
   * IMPORTANT:
   *
   * localStorage contains only the token.
   *
   * Laravel remains the source of truth
   * for whether the token is valid.
   */
  const refreshSession = async (): Promise<UserRole | null> => {
    const token = getAuthToken();

    /*
     * No persisted token means there is
     * no authenticated session.
     */
    if (!token) {
      setUser(null);
      setRole(null);
      setIsLoading(false);

      return null;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.checkMe();

      /*
       * Token exists locally but Laravel
       * says the session is not valid.
       */
      if (!response.success || !response.data?.user) {
        clearAuthToken();

        setUser(null);
        setRole(null);

        return null;
      }

      setUser(response.data.user);

      const authenticatedRole = response.data.role ?? null;

      setRole(authenticatedRole);

      return authenticatedRole;
    } catch (error) {
      console.error("Session validation failed:", error);

      /*
       * check-me failed. Treat the local
       * authentication session as invalid.
       */
      clearAuthToken();

      setUser(null);
      setRole(null);

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Restore session when the application starts.
   */
  useEffect(() => {
    void refreshSession();
  }, []);

  /**
   * Logout current device.
   */
  const logout = async (): Promise<void> => {
    try {
      /*
       * apiRequest() automatically adds
       * the current Bearer token.
       */
      await AuthService.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      /*
       * Even if the network request fails,
       * the browser must stop considering
       * this user authenticated.
       */
      clearAuthToken();

      setUser(null);
      setRole(null);
    }
  };

  /**
   * Logout from all devices.
   */
  const logoutAll = async (): Promise<void> => {
    try {
      await AuthService.logoutAll();
    } catch (error) {
      console.error("Logout-all request failed:", error);
    } finally {
      clearAuthToken();

      setUser(null);
      setRole(null);
    }
  };

  const hasRole = (expectedRole: UserRole): boolean => {
    return role === expectedRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,

        role,

        isAuthenticated: user !== null,

        isLoading,

        refreshSession,

        logout,

        logoutAll,

        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
