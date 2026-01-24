import { apiRequest } from "./queryClient";
import type { LoginData, RegisterData, Student } from "@shared/schema";

export interface AuthResponse {
  message: string;
  student: Student;
  token: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  getProfile: async (): Promise<Student> => {
    const response = await apiRequest("GET", "/api/profile");
    return response.json();
  },

  updateProfile: async (data: Partial<Student>) => {
    const response = await apiRequest("PUT", "/api/profile", data);
    return response.json();
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    
    const response = await fetch("/api/profile/photo", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload photo");
    }

    return response.json();
  },
};

export const getAuthToken = () => localStorage.getItem("token");
export const setAuthToken = (token: string) => localStorage.setItem("token", token);
export const removeAuthToken = () => localStorage.removeItem("token");
