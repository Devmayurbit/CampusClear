import { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { authApi, getAuthToken, setAuthToken, removeAuthToken, getUserData, setUserData, removeUserData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole, LoginRequest, RegisterRequest, GoogleSignInRequest } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  googleSignIn: (data: GoogleSignInRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getAuthToken();
  const [userState, setUserState] = useState<User | null>(getUserData());
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync auth state on mount
  useEffect(() => {
    if (token && !userState) {
      const storedUser = getUserData();
      if (storedUser) {
        setUserState(storedUser);
      }
    }
    setIsInitialized(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await authApi.auth.login(data);
      return response;
    },
    onSuccess: (response: any) => {
      const payload = response?.data ?? response;
      const { token, user } = payload || {};

      if (!token || !user) {
        toast({
          title: "Login failed",
          description: "Unexpected server response",
          variant: "destructive",
        });
        return;
      }

      // Ensure role is uppercase
      const normalizedUser: User = {
        ...user,
        role: (user.role?.toUpperCase() || "STUDENT") as UserRole,
      };

      setAuthToken(token);
      setUserState(normalizedUser);
      setUserData(normalizedUser);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${normalizedUser.role.toLowerCase()}`,
      });

      // Route based on role
      setTimeout(() => {
        if (normalizedUser.role === "ADMIN") {
          setLocation("/admin/dashboard");
        } else if (normalizedUser.role === "FACULTY") {
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
    mutationFn: async (data: RegisterRequest) => {
      const response = await authApi.auth.register(data);
      return response;
    },
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

  const googleSignInMutation = useMutation({
    mutationFn: async (data: GoogleSignInRequest) => {
      const response = await authApi.auth.googleSignIn(data);
      return response;
    },
    onSuccess: (response: any) => {
      const payload = response?.data ?? response;
      const { token, user } = payload || {};

      if (!token || !user) {
        toast({
          title: "Google Sign-in failed",
          description: "Unexpected server response",
          variant: "destructive",
        });
        return;
      }

      // Ensure role is uppercase
      const normalizedUser: User = {
        ...user,
        role: (user.role?.toUpperCase() || "STUDENT") as UserRole,
      };

      setAuthToken(token);
      setUserState(normalizedUser);
      setUserData(normalizedUser);

      toast({
        title: "Welcome!",
        description: "Google Sign-in successful",
      });

      // Route based on role
      setTimeout(() => {
        if (normalizedUser.role === "ADMIN") {
          setLocation("/admin/dashboard");
        } else if (normalizedUser.role === "FACULTY") {
          setLocation("/faculty/dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Google Sign-in failed",
        description: error.message || "Unable to sign in with Google",
        variant: "destructive",
      });
    },
  });

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
  };

  const googleSignIn = async (data: GoogleSignInRequest) => {
    await googleSignInMutation.mutateAsync(data);
  };

  const logout = () => {
    removeAuthToken();
    removeUserData();
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
    isLoading: !isInitialized || loginMutation.isPending || registerMutation.isPending || googleSignInMutation.isPending,
    isAuthenticated: !!token && !!userState,
    userRole: userState?.role || null,
    login,
    register,
    googleSignIn,
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
  return userRole === "ADMIN";
}

export function useIsFaculty() {
  const { userRole } = useAuth();
  return userRole === "FACULTY";
}

export function useIsStudent() {
  const { userRole } = useAuth();
  return userRole === "STUDENT";
}
