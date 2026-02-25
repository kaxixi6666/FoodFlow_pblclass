import { createHashRouter } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Inventory } from "./pages/Inventory";
import { MyRecipes } from "./pages/MyRecipes";
import { PublicRecipes } from "./pages/PublicRecipes";
import { Planning } from "./pages/Planning";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Suspense wrapper for protected routes
const SuspenseProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);

// Suspense wrapper for dashboard layout
const SuspenseDashboardLayout = () => (
  <SuspenseProtectedRoute>
    <DashboardLayout />
  </SuspenseProtectedRoute>
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
    Component: SuspenseDashboardLayout,
    children: [
      { 
        index: true, 
        Component: Home,
      },
      { 
        path: "inventory", 
        Component: Inventory,
      },
      { 
        path: "my-recipes", 
        Component: MyRecipes,
      },
      { 
        path: "public-recipes", 
        Component: PublicRecipes,
      },
      { 
        path: "planning", 
        Component: Planning,
      },
    ],
  },
]);
