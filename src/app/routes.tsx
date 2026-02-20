import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Home } from "./pages/Home";
import { Inventory } from "./pages/Inventory";
import { Recipes } from "./pages/Recipes";
import { SmartFilter } from "./pages/SmartFilter";
import { Planning } from "./pages/Planning";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Wrap DashboardLayout with ProtectedRoute
const ProtectedDashboardLayout = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedDashboardLayout,
    children: [
      { index: true, Component: Home },
      { path: "inventory", Component: Inventory },
      { path: "recipes", Component: Recipes },
      { path: "smart-filter", Component: SmartFilter },
      { path: "planning", Component: Planning },
    ],
  },
]);
