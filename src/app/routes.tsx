import { createHashRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Home } from "./pages/Home";
import { Inventory } from "./pages/Inventory";
import { Recipes } from "./pages/Recipes";
import { Planning } from "./pages/Planning";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Wrap DashboardLayout with ProtectedRoute
const ProtectedDashboardLayout = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

// HashRouter doesn't need basename for GitHub Pages deployment
// The hash part (#/) handles routing independently of the base path
export const router = createHashRouter([
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
      { path: "planning", Component: Planning },
    ],
  },
]);
