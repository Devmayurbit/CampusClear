import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Login from "@/pages/login";
import Register from "@/pages/register";
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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/nodues" component={NoDues} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/departments" component={AdminDepartments} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route path="/faculty/dashboard" component={FacultyDashboard} />
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
