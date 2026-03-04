import { z } from "zod";

/**
 * Validation schemas for Authentication API endpoints
 */

export const registerStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  enrollmentNo: z.string().min(3, "Enrollment number is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  program: z.string().max(100).optional(),
  batch: z.string().max(20).optional(),
  role: z.literal("STUDENT").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const registerStaffSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["FACULTY", "ADMIN", "SUPER_ADMIN"]),
  department: z.string().max(100).optional(),
  employeeId: z.string().max(50).optional(),
  designation: z.string().max(100).optional(),
  adminKey: z.string().min(1, "Admin setup key is required"),
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterStaffInput = z.infer<typeof registerStaffSchema>;
