import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/src/context/AuthContext";

/**
 * Routes wrapped with GuestOnlyRoute can only be opened
 * when the user is NOT authenticated.
 *
 * Examples:
 * /auth/login
 * /auth/register-merchant
 */
interface GuestOnlyRouteProps {
  children?: React.ReactNode;
}

export const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  const location = useLocation();

  /*
   * AuthContext is still checking the persisted
   * Sanctum token with Laravel.
   *
   * Do not redirect while that check is running.
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-sm font-mono text-[#71717A]">
          Restoring session...
        </div>
      </div>
    );
  }

  /*
   * Already authenticated:
   * send the user to the correct dashboard.
   */
  if (isAuthenticated) {
    /*
     * Owner gets access to both:
     *
     * /admin/dashboard/owner
     * /admin/dashboard/manager
     *
     * For a generic /auth route, owner lands
     * on owner dashboard.
     */
    if (role === "owner") {
      return (
        <Navigate
          to="/admin/dashboard/owner"
          replace
          state={{
            from: location.pathname,
          }}
        />
      );
    }

    if (role === "manager") {
      return (
        <Navigate
          to="/admin/dashboard/manager"
          replace
          state={{
            from: location.pathname,
          }}
        />
      );
    }

    if (role === "waiter") {
      return (
        <Navigate
          to="/staff/dashboard/waiter"
          replace
          state={{
            from: location.pathname,
          }}
        />
      );
    }

    if (role === "kitchen") {
      return (
        <Navigate
          to="/staff/dashboard/kitchen"
          replace
          state={{
            from: location.pathname,
          }}
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
