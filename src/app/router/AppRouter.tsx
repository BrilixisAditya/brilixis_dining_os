import { TerminalHubPage } from "@/src/pages/auth/components/TerminalHubPage";
import { LoginPage } from "@/src/pages/auth/LoginPage";
import CustomerPage from "@/src/pages/customer/CustomerPage";
import KitchenPage from "@/src/pages/kitchen/KitchenPage";
import { ManagerPage } from "@/src/pages/manager/ManagerPage";
import { OwnerPage } from "@/src/pages/owner/OwnerPage";
import { WaiterPage } from "@/src/pages/waiter/WaiterPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";


function AppRouter(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CustomerPage/>} />
                <Route path="/customer" element={<CustomerPage/>} />
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage/>} />
                <Route path="/auth/terminal" element={<TerminalHubPage/>} />
                
                {/* Page Routes */}
                <Route path="/admin/dashboard/manager" element={<ManagerPage/>} />
                <Route path="/staff/dashboard/waiter" element={<WaiterPage/>} />
                <Route path="/staff/dashboard/kitchen" element={<KitchenPage/>} />
                <Route path="/admin/dashboard/owner" element={<OwnerPage/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;