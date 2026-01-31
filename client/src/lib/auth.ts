import { apiRequest } from "./queryClient";

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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: "student" | "faculty" | "admin";
      enrollmentNo?: string;
      department?: string;
    };
  };
}

export const authApi = {
  // Student registration
  register: async (data: RegisterData) => {
    return apiRequest<AuthResponse>("POST", "/auth/register", data);
  },

  // Universal login for all roles
  login: async (data: LoginData) => {
    return apiRequest<AuthResponse>("POST", "/auth/login", data);
  },

  // Email verification for student registration
  verifyEmail: async (token: string) => {
    return apiRequest("POST", "/auth/verify-email", { token });
  },

  // Create faculty/admin (admin only)
  createStaff: async (data: {
    fullName: string;
    email: string;
    role: "faculty" | "admin";
    department?: string;
    password: string;
  }) => {
    return apiRequest("POST", "/auth/staff", data);
  },

  // No-Dues endpoints
  nodues: {
    submit: async (reason: string) => {
      return apiRequest("POST", "/nodues/submit", { reason });
    },

    verify: async (token: string) => {
      return apiRequest("POST", "/nodues/verify", { token });
    },

    getMyRequest: async () => {
      return apiRequest("GET", "/nodues/my-request");
    },

    getHistory: async () => {
      return apiRequest("GET", "/nodues/history");
    },

    updateDepartmentStatus: async (requestId: string, department: string, status: string, remarks?: string) => {
      return apiRequest("PUT", `/nodues/${requestId}/department`, {
        requestId,
        department,
        status,
        remarks,
      });
    },
  },

  // Faculty endpoints
  faculty: {
    getDashboard: async () => {
      return apiRequest("GET", "/faculty/dashboard");
    },

    getRequests: async () => {
      return apiRequest("GET", "/faculty/requests");
    },

    getRequest: async (requestId: string) => {
      return apiRequest("GET", `/faculty/requests/${requestId}`);
    },

    updateStatus: async (requestId: string, status: string, remarks?: string) => {
      return apiRequest("PUT", `/faculty/requests/${requestId}/update`, {
        status,
        remarks,
      });
    },

    search: async (enrollmentNo: string) => {
      return apiRequest("GET", `/faculty/search?enrollmentNo=${enrollmentNo}`);
    },
  },

  // Admin endpoints
  admin: {
    getDashboard: async () => {
      return apiRequest("GET", "/admin/dashboard");
    },

    getRequests: async (status?: string, page?: number) => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (page) params.append("page", page.toString());
      return apiRequest("GET", `/admin/requests?${params}`);
    },

    approveRequest: async (requestId: string) => {
      return apiRequest("PUT", `/admin/requests/${requestId}/approve`);
    },

    rejectRequest: async (requestId: string, reason: string) => {
      return apiRequest("PUT", `/admin/requests/${requestId}/reject`, { reason });
    },

    getAuditLogs: async (page?: number) => {
      const params = page ? `?page=${page}` : "";
      return apiRequest("GET", `/admin/audit-logs${params}`);
    },

    getStats: async () => {
      return apiRequest("GET", "/admin/stats");
    },
  },

  // Certificate endpoints
  certificate: {
    generate: async (requestId: string) => {
      return apiRequest("POST", `/certificate/${requestId}/generate`);
    },

    verify: async (certificateId: string) => {
      return apiRequest("GET", `/certificate/verify/${certificateId}`);
    },

    getMyList: async () => {
      return apiRequest("GET", "/certificate/my-certificates");
    },

    getList: async (page?: number) => {
      const params = page ? `?page=${page}` : "";
      return apiRequest("GET", `/certificate/list${params}`);
    },

    download: async (certificateId: string) => {
      return apiRequest("GET", `/certificate/${certificateId}/download`);
    },
  },
};

export const getAuthToken = () => localStorage.getItem("token");
export const setAuthToken = (token: string) => localStorage.setItem("token", token);
export const removeAuthToken = () => localStorage.removeItem("token");

export const setUserData = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUserData = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUserData = () => {
  localStorage.removeItem("user");
};
