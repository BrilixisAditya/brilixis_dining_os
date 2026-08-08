import { AuthLayout } from "@/src/pages/auth/AuthLayout";
import CustomerPage from "@/src/pages/customer/CustomerPage";
import KitchenPage from "@/src/pages/kitchen/KitchenPage";
import { ManagerPage } from "@/src/pages/manager/ManagerPage";
import { OwnerPage } from "@/src/pages/owner/OwnerPage";
import { WaiterPage } from "@/src/pages/waiter/WaiterPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/src/pages/auth/LoginPage";
import { RestaurantRegisterPage } from "@/src/pages/auth/RestaurantRegisterPage";


function AppRouter(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CustomerPage/>} />
                <Route path="/customer" element={<CustomerPage/>} />
                
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage  />} />
                    <Route path="register-merchant" element={<RestaurantRegisterPage/>} />
                </Route> 
                
                {/* Page Routes */}
                <Route path="/admin/dashboard/owner" element={<OwnerPage/>} />
                <Route path="/admin/dashboard/manager" element={<ManagerPage/>} />
                <Route path="/staff/dashboard/waiter" element={<WaiterPage/>} />
                <Route path="/staff/dashboard/kitchen" element={<KitchenPage/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;