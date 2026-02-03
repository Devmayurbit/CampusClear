import { Navigate } from "wouter";
import { useAuth, useIsAdmin, useIsFaculty, useIsStudent } from "@/hooks/use-auth";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, requiredRoles, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <Navigate to="/login" />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      return fallback || <Navigate to="/" />;
    }
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      {children}
    </ProtectedRoute>
  );
}

export function FacultyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["FACULTY"]}>
      {children}
    </ProtectedRoute>
  );
}

export function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["STUDENT"]}>
      {children}
    </ProtectedRoute>
  );
}
