import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, AdminRoute, FacultyRoute, StudentRoute } from "@/components/ProtectedRoute";
import Navbar from "@/components/navbar";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import Footer from "@/components/Footer";
import NoDues from "@/pages/nodues";
import AdminDashboard from "@/pages/AdminDashboard";
import FacultyDashboard from "@/pages/FacultyDashboard";
import AdminApplications from "@/pages/AdminApplications";
import AdminStudents from "@/pages/AdminStudents";
import AdminDepartments from "@/pages/AdminDepartments";
import AdminAuditLogs from "@/pages/AdminAuditLogs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute requiredRoles={["STUDENT"]}>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/nodues">
        {() => (
          <StudentRoute>
            <NoDues />
          </StudentRoute>
        )}
      </Route>

      {/* Admin routes */}
      <Route path="/admin/dashboard">
        {() => (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      </Route>

      <Route path="/admin/applications">
        {() => (
          <AdminRoute>
            <AdminApplications />
          </AdminRoute>
        )}
      </Route>

      <Route path="/admin/students">
        {() => (
          <AdminRoute>
            <AdminStudents />
          </AdminRoute>
        )}
      </Route>

      <Route path="/admin/departments">
        {() => (
          <AdminRoute>
            <AdminDepartments />
          </AdminRoute>
        )}
      </Route>

      <Route path="/admin/audit-logs">
        {() => (
          <AdminRoute>
            <AdminAuditLogs />
          </AdminRoute>
        )}
      </Route>

      {/* Faculty routes */}
      <Route path="/faculty/dashboard">
        {() => (
          <FacultyRoute>
            <FacultyDashboard />
          </FacultyRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
            <Navbar />
            <Router />
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
