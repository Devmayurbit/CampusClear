import { createContext, useContext } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getAuthToken();

  const { data: student, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuthToken(data.token);
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

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuthToken(data.token);
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

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    removeAuthToken();
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    setLocation("/login");
  };

  const contextValue = {
    student: student || null,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!student,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}