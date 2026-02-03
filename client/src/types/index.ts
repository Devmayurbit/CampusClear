/**
 * User Types
 */
export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  enrollmentNo?: string;
  department?: string;
  authProvider?: "LOCAL" | "GOOGLE";
}

/**
 * Auth Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  enrollmentNo: string;
  email: string;
  password: string;
  program?: string;
  batch?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface GoogleSignInRequest {
  idToken: string;
}

/**
 * No-Dues Types
 */
export type NoDuesStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ClearanceStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Clearance {
  status: ClearanceStatus;
  remarks: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface NoDuesRequest {
  _id?: string;
  id?: string;
  studentId?: string;
  overallStatus: NoDuesStatus;
  libraryClearance: Clearance;
  accountClearance: Clearance;
  hostelClearance: Clearance;
  departmentClearance: Clearance;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  studentInfo?: {
    fullName: string;
    enrollmentNo: string;
    email: string;
  };
}

export interface CreateNoDuesRequest {
  remarks?: string;
}

export interface ApproveClearanceRequest {
  remarks?: string;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  error?: string;
}

/**
 * Pagination
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total?: number;
  page?: number;
  pages?: number;
}
