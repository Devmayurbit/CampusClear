import { apiRequest } from "./queryClient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleSignInRequest,
  NoDuesRequest,
  ApproveClearanceRequest,
} from "../types";

export const authApi = {
  // Auth endpoints - /api/v1/auth/...
  auth: {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      return apiRequest<AuthResponse>("POST", "/api/v1/auth/register", data);
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
      return apiRequest<AuthResponse>("POST", "/api/v1/auth/login", data);
    },

    verifyEmail: async (token: string) => {
      return apiRequest("POST", "/api/v1/auth/verify-email", { token });
    },

    forgotPassword: async (data: ForgotPasswordRequest) => {
      return apiRequest("POST", "/api/v1/auth/forgot-password", data);
    },

    resetPassword: async (data: ResetPasswordRequest) => {
      return apiRequest("POST", "/api/v1/auth/reset-password", data);
    },

    googleSignIn: async (data: GoogleSignInRequest): Promise<AuthResponse> => {
      return apiRequest<AuthResponse>("POST", "/api/v1/auth/google", data);
    },

    // Admin only - create staff
    createStaff: async (data: {
      fullName: string;
      email: string;
      role: "FACULTY" | "ADMIN";
      department?: string;
      password: string;
    }) => {
      return apiRequest("POST", "/api/v1/auth/staff", data);
    },
  },

  // No-Dues endpoints - /api/v1/nodues/...
  nodues: {
    create: async (data?: any) => {
      return apiRequest<NoDuesRequest>("POST", "/api/v1/nodues/create", data || {});
    },

    getMe: async () => {
      return apiRequest<NoDuesRequest>("GET", "/api/v1/nodues/me");
    },

    getAll: async (page?: number) => {
      const url = page ? `/api/v1/nodues/all?page=${page}` : "/api/v1/nodues/all";
      return apiRequest<{ data: NoDuesRequest[]; total: number }>("GET", url);
    },

    approveClearance: async (requestId: string, clearanceType: string, data?: ApproveClearanceRequest) => {
      return apiRequest("PUT", `/api/v1/nodues/approve/${requestId}`, {
        clearanceType,
        ...data,
      });
    },

    rejectClearance: async (requestId: string, clearanceType: string, remarks?: string) => {
      return apiRequest("PUT", `/api/v1/nodues/reject/${requestId}`, {
        clearanceType,
        remarks,
      });
    },
  },

  // Faculty endpoints - /api/v1/faculty/...
  faculty: {
    getDashboard: async () => {
      return apiRequest("GET", "/api/v1/faculty/dashboard");
    },

    getRequests: async (page?: number) => {
      const url = page ? `/api/v1/faculty/requests?page=${page}` : "/api/v1/faculty/requests";
      return apiRequest<NoDuesRequest[]>("GET", url);
    },

    getRequest: async (requestId: string) => {
      return apiRequest<NoDuesRequest>("GET", `/api/v1/faculty/requests/${requestId}`);
    },

    updateRequestStatus: async (
      requestId: string,
      data: { clearanceType: string; status: "APPROVED" | "REJECTED"; remarks?: string }
    ) => {
      return apiRequest("PUT", `/api/v1/faculty/requests/${requestId}/update`, data);
    },

    search: async (enrollmentNo: string) => {
      return apiRequest<NoDuesRequest[]>("GET", `/api/v1/faculty/search?enrollmentNo=${enrollmentNo}`);
    },
  },

  // Admin endpoints - /api/v1/admin/...
  admin: {
    getDashboard: async () => {
      return apiRequest("GET", "/api/v1/admin/dashboard");
    },

    getRequests: async (page?: number, status?: string) => {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (status) params.append("status", status);
      const query = params.toString();
      const url = query ? `/api/v1/admin/requests?${query}` : "/api/v1/admin/requests";
      return apiRequest<{ data: NoDuesRequest[]; total: number }>("GET", url);
    },

    approveRequest: async (requestId: string, remarks?: string) => {
      return apiRequest("PUT", `/api/v1/admin/requests/${requestId}/approve`, { remarks });
    },

    rejectRequest: async (requestId: string, remarks?: string) => {
      return apiRequest("PUT", `/api/v1/admin/requests/${requestId}/reject`, { remarks });
    },

    getAuditLogs: async (page?: number) => {
      const url = page ? `/api/v1/admin/audit-logs?page=${page}` : "/api/v1/admin/audit-logs";
      return apiRequest("GET", url);
    },

    getStats: async () => {
      return apiRequest("GET", "/api/v1/admin/stats");
    },
  },
};

// Token management
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");

// User data management
export const getUserData = () => {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

export const setUserData = (user: any) => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const removeUserData = () => {
  localStorage.removeItem("auth_user");
};
