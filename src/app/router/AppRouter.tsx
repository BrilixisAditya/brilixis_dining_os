import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "@/src/pages/auth/AuthLayout";
import CustomerPage from "@/src/pages/customer/CustomerPage";
import KitchenPage from "@/src/pages/kitchen/KitchenPage";
import { ManagerPage } from "@/src/pages/manager/ManagerPage";
import { OwnerPage } from "@/src/pages/owner/OwnerPage";
import { WaiterPage } from "@/src/pages/waiter/WaiterPage";
import { LoginPage } from "@/src/pages/auth/LoginPage";
import { RestaurantRegisterPage } from "@/src/pages/auth/RestaurantRegisterPage";
import NotFoundPage from "@/src/components/common/NotFoundPage";
import { GuestOnlyRoute } from "./GuestOnlyRoute";
import { ProtectedRoute } from "./ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ----------------------------------------------------------------- */}
        {/* Customer                                                          */}
        {/* ----------------------------------------------------------------- */}

        <Route path="/" element={<CustomerPage />} />

        <Route path="/customer" element={<CustomerPage />} />

        {/* ----------------------------------------------------------------- */}
        {/* Guest-only authentication routes                                */}
        {/* ----------------------------------------------------------------- */}

        <Route element={<GuestOnlyRoute />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="login" replace />} />

            <Route path="login" element={<LoginPage />} />

            <Route
              path="register-merchant"
              element={<RestaurantRegisterPage />}
            />
          </Route>
        </Route>

        {/* ----------------------------------------------------------------- */}
        {/* Owner dashboard                                                   */}
        {/* ----------------------------------------------------------------- */}

        <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
          <Route path="/admin/dashboard/owner" element={<OwnerPage />} />
        </Route>

        {/* ----------------------------------------------------------------- */}
        {/* Manager dashboard                                                 */}
        {/*                                                                      */}
        {/* Owner is intentionally included.                                 */}
        {/* Owner = restaurant admin with authority over manager dashboard.  */}
        {/* ----------------------------------------------------------------- */}

        <Route element={<ProtectedRoute allowedRoles={["owner", "manager"]} />}>
          <Route path="/admin/dashboard/manager" element={<ManagerPage />} />
        </Route>

        {/* ----------------------------------------------------------------- */}
        {/* Waiter dashboard                                                  */}
        {/* ----------------------------------------------------------------- */}

        <Route element={<ProtectedRoute allowedRoles={["waiter"]} />}>
          <Route path="/staff/dashboard/waiter" element={<WaiterPage />} />
        </Route>

        {/* ----------------------------------------------------------------- */}
        {/* Kitchen dashboard                                                 */}
        {/* ----------------------------------------------------------------- */}

        <Route element={<ProtectedRoute allowedRoles={["kitchen"]} />}>
          <Route path="/staff/dashboard/kitchen" element={<KitchenPage />} />
        </Route>

        {/* ----------------------------------------------------------------- */}
        {/* Unknown route                                                     */}
        {/* ----------------------------------------------------------------- */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
