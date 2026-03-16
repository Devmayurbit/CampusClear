import { z } from "zod";

// ==================== USER SCHEMAS ====================
export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  role: z.enum(["student", "faculty", "admin"]).default("student"),
  // Student fields
  enrollmentNo: z.string().optional(),
  program: z.string().optional(),
  batch: z.string().optional(),
  // Faculty fields
  departmentId: z.string().optional(),
  facultyId: z.string().optional(),
  designation: z.string().optional(),
});

export type RegisterData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["M", "F", "Other"]).optional(),
  // Student-specific
  semester: z.number().optional(),
  cgpa: z.number().optional(),
  credits: z.number().optional(),
  expectedGraduation: z.string().optional(),
  // Emergency contact
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactEmail: z.string().email().optional(),
});

// ==================== USER TYPES ====================
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNo?: string;
  program?: string;
  batch?: string;
  semester?: number;
  cgpa?: number;
  credits?: number;
  expectedGraduation?: Date;
  role: "student" | "faculty" | "admin";
  phone?: string;
  address?: string;
  profilePhoto?: string;
  gender?: "M" | "F" | "Other";
  dateOfBirth?: Date;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InsertStudent = Omit<User, "_id" | "createdAt" | "updatedAt">;

// ==================== NO-DUES SCHEMAS ====================
export const submitNoDuesSchema = z.object({
  reason: z.string().min(10).max(500),
});

// ==================== NO-DUES TYPES ====================
export interface NoDuesApplication {
  _id?: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  enrollmentNo?: string;
  program?: string;
  batch?: string;
  semester?: number;
  reason: string;
  departments: Map<string, DepartmentClearance>;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "CERTIFICATE_GENERATED";
  certificateId?: string;
  certificateGeneratedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepartmentClearance {
  departmentId?: string;
  departmentName?: string;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  completedRequirements?: string[];
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  updatedAt?: Date;
}

// ==================== DEPARTMENT TYPES ====================
export interface Department {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  headFacultyId?: string;
  requirements?: string[];
  isActive: boolean;
  email?: string;
  phone?: string;
  officeLocation?: string;
}

// ==================== CERTIFICATE TYPES ====================
export interface Certificate {
  _id?: string;
  certificateId: string;
  studentId: string;
  noDuesId: string;
  studentName: string;
  enrollmentNo?: string;
  program?: string;
  batch?: string;
  generatedAt: Date;
  generatedBy?: string;
  pdfPath?: string;
  qrCodeData?: string;
  isValid: boolean;
  downloadCount: number;
}

export type Student = User;

// ==================== AUDIT LOG TYPES ====================
export interface AuditLog {
  _id?: string;
  action: string;
  actor: {
    id: string;
    email: string;
    role: "student" | "faculty" | "admin";
  };
  target?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}
