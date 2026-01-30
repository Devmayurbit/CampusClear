import { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { authApi, getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Student, LoginData, RegisterData } from "@shared/schema";

interface AuthContextType {
  student: Student | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Restore student from localStorage (page refresh safe)
const getStoredStudent = (): Student | null => {
  try {
    const raw = localStorage.getItem("student");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getAuthToken();

  const [studentState, setStudentState] = useState<Student | null>(
    getStoredStudent()
  );

  // ---------------------------
  // Load profile if token exists
  // ---------------------------
  const { isLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!token,
    retry: false,
    onSuccess: (profile) => {
      setStudentState(profile);
      localStorage.setItem("student", JSON.stringify(profile));
    },
    onError: () => {
      removeAuthToken();
      localStorage.removeItem("student");
      setStudentState(null);
      queryClient.clear();
    },
  });

  // ---------------------------
  // Login mutation
  // ---------------------------
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuthToken(data.token);

      setStudentState(data.student);
      localStorage.setItem("student", JSON.stringify(data.student));

      queryClient.setQueryData(["/api/profile"], data.student);

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });

      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ---------------------------
  // Register mutation
  // ---------------------------
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuthToken(data.token);

      setStudentState(data.student);
      localStorage.setItem("student", JSON.stringify(data.student));

      queryClient.setQueryData(["/api/profile"], data.student);

      toast({
        title: "Account created!",
        description: "Welcome to CDGI No-Dues System.",
      });

      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ---------------------------
  // Actions
  // ---------------------------
  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem("student");
    setStudentState(null);
    queryClient.clear();

    toast({
      title: "Logged out",
      description: "See you next time!",
    });

    setLocation("/");
  };

  // ---------------------------
  // Context value
  // ---------------------------
  const contextValue = {
    student: studentState,
    isLoading:
      isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending,

    login,
    register,
    logout,

    // ✅ Auth based only on token existence
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------
// Hook
// ---------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
