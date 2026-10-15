import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/src/context/AuthContext";

import { UserRole } from "@/src/types/AuthTypes";

interface ProtectedRouteProps {
  /**
   * Roles allowed to access this route.
   *
   * Example:
   *
   * allowedRoles={["owner", "manager"]}
   */
  allowedRoles?: UserRole[];

  children?: React.ReactNode;
}

/**
 * Protects authenticated application routes.
 *
 * Responsibilities:
 * - Wait for AuthContext to restore the session.
 * - Redirect unauthenticated users to login.
 * - Restrict routes by role.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  const location = useLocation();

  /*
   * AuthContext may still be calling /auth/check-me.
   *
   * Never make authorization decisions before
   * that process is finished.
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-sm font-mono text-[#71717A]">
          Verifying session...
        </div>
      </div>
    );
  }

  /*
   * No valid authenticated session.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * Route is authenticated but also has
   * role-based authorization requirements.
   */
  if (allowedRoles && !role) {
    /*
     * The user has a token but the backend did
     * not provide a usable role.
     */
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    /*
     * Authenticated but not authorized.
     *
     * Send the user to their own dashboard.
     */
    switch (role) {
      case "owner":
        return <Navigate to="/admin/dashboard/owner" replace />;

      case "manager":
        return <Navigate to="/admin/dashboard/manager" replace />;

      case "waiter":
        return <Navigate to="/staff/dashboard/waiter" replace />;

      case "kitchen":
        return <Navigate to="/staff/dashboard/kitchen" replace />;

      default:
        return <Navigate to="/auth/login" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
