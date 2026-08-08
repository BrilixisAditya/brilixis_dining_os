import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* ----------------------------- Types ----------------------------- */

export type UserRole =
  | "OWNER"
  | "MANAGER"
  | "WAITER"
  | "KITCHEN"
  | "CUSTOMER";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;

  hasRole: (role: UserRole) => boolean;
}

/* ---------------------------- Context ---------------------------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------------------- Provider --------------------------- */

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  /* ---------------- Initial Session Check ---------------- */

  useEffect(() => {
    refreshSession();
  }, []);

  /* ---------------- Login ---------------- */

  const login = async () => {
    try {
      setIsLoading(true);

      // TODO:
      // Call auth.service.ts
      // const response = await authService.login(...);

      // Temporary Demo User
      setUser({
        id: "1",
        name: "Restaurant Manager",
        email: "manager@restaurant.com",
        role: "MANAGER",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- Logout ---------------- */

  const logout = async () => {
    try {
      // TODO:
      // await authService.logout();

      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- Refresh Session ---------------- */

  const refreshSession = async () => {
    try {
      setIsLoading(true);

      // TODO:
      // const user = await authService.refreshSession();

      // Demo
      setUser(null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- Role Helper ---------------- */

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,

        login,
        logout,
        refreshSession,

        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ----------------------------- Hook ----------------------------- */

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };