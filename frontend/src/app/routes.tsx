import { createHashRouter, lazy, Suspense } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const Inventory = lazy(() => import("./pages/Inventory"));
const MyRecipes = lazy(() => import("./pages/MyRecipes"));
const PublicRecipes = lazy(() => import("./pages/PublicRecipes"));
const Planning = lazy(() => import("./pages/Planning"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>
);

// Suspense wrapper for protected routes
const SuspenseProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
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
        Component: () => (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ) 
      },
      { 
        path: "inventory", 
        Component: () => (
          <Suspense fallback={<PageLoader />}>
            <Inventory />
          </Suspense>
        ) 
      },
      { 
        path: "my-recipes", 
        Component: () => (
          <Suspense fallback={<PageLoader />}>
            <MyRecipes />
          </Suspense>
        ) 
      },
      { 
        path: "public-recipes", 
        Component: () => (
          <Suspense fallback={<PageLoader />}>
            <PublicRecipes />
          </Suspense>
        ) 
      },
      { 
        path: "planning", 
        Component: () => (
          <Suspense fallback={<PageLoader />}>
            <Planning />
          </Suspense>
        ) 
      },
    ],
  },
]);
