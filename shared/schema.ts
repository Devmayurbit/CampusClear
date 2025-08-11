import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentNo: text("enrollment_no").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  program: text("program").notNull(),
  batch: text("batch").notNull(),
  address: text("address"),
  profilePhoto: text("profile_photo"),
  cgpa: text("cgpa"),
  credits: text("credits"),
  semester: text("semester"),
  expectedGraduation: text("expected_graduation"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactRelation: text("emergency_contact_relation"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactEmail: text("emergency_contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clearances = pgTable("clearances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  departmentId: varchar("department_id").notNull().references(() => departments.id),
  status: text("status").notNull().default("pending"), // pending, cleared, rejected
  requirements: text("requirements").array().default([]),
  completedRequirements: text("completed_requirements").array().default([]),
  remarks: text("remarks"),
  clearedAt: timestamp("cleared_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertClearanceSchema = createInsertSchema(clearances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  enrollmentNo: z.string().min(1, "Enrollment number is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertStudentSchema.pick({
  enrollmentNo: true,
  email: true,
  password: true,
  fullName: true,
  program: true,
  batch: true,
}).extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Clearance = typeof clearances.$inferSelect;
export type InsertClearance = z.infer<typeof insertClearanceSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
