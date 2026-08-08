import AppRouter from "./app/router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/RestaurantContext";

export default function App() {
  return (
    <AuthProvider>
        <RestaurantProvider>
            <AppRouter />
        </RestaurantProvider>
    </AuthProvider>
  );
}
