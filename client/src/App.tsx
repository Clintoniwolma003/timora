import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Billing from "./pages/Billing";
import Unauthorized from "./pages/Unauthorized";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/unauthorized"} component={Unauthorized} />
      <Route path={"/404"} component={NotFound} />

      {/* Protected Routes - Staff Dashboard */}
      <Route
        path={"/dashboard"}
        component={() => (
          <ProtectedRoute
            component={StaffDashboard}
            requiredRoles={["staff", "company_admin", "super_admin"]}
          />
        )}
      />

      {/* Protected Routes - Admin Dashboard */}
      <Route
        path={"/admin"}
        component={() => (
          <ProtectedRoute
            component={AdminDashboard}
            requiredRoles={["company_admin", "super_admin"]}
          />
        )}
      />

      {/* Billing Page */}
      <Route
        path={"/billing"}
        component={() => (
          <ProtectedRoute
            component={Billing}
            requiredRoles={["company_admin", "super_admin"]}
          />
        )}
      />

      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
