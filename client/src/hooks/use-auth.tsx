import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { authApi, getAuthToken, setAuthToken, removeAuthToken, getUserData, setUserData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "student" | "faculty" | "admin";
  enrollmentNo?: string;
  department?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  enrollmentNo: string;
  email: string;
  password: string;
  program: string;
  batch: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: "student" | "faculty" | "admin" | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getAuthToken();
  const [userState, setUserState] = useState<User | null>(getUserData());

  // Sync auth state on mount
  useEffect(() => {
    if (token && !userState) {
      const storedUser = getUserData();
      if (storedUser) {
        setUserState(storedUser);
      }
    }
  }, [token, userState]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response: any) => {
      const { token, user } = response.data;
      
      setAuthToken(token);
      setUserState(user);
      setUserData(user);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.role}`,
      });

      // Route based on role
      setTimeout(() => {
        if (user.role === "admin") {
          setLocation("/admin/dashboard");
        } else if (user.role === "faculty") {
          setLocation("/faculty/dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to register",
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
    localStorage.removeItem("user");
    setUserState(null);
    queryClient.clear();

    toast({
      title: "Logged out",
      description: "See you next time!",
    });

    setLocation("/");
  };

  const contextValue: AuthContextType = {
    user: userState,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!token && !!userState,
    userRole: userState?.role || null,
    login,
    register,
    logout,
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

// Helper hooks for role-based logic
export function useIsAdmin() {
  const { userRole } = useAuth();
  return userRole === "admin";
}

export function useIsFaculty() {
  const { userRole } = useAuth();
  return userRole === "faculty";
}

export function useIsStudent() {
  const { userRole } = useAuth();
  return userRole === "student";
}
