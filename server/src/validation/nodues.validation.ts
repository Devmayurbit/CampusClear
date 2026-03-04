import { z } from "zod";

/**
 * Validation schemas for No-Dues API endpoints
 */

export const createNoDuesSchema = z.object({
  remarks: z.string().max(500).optional().default(""),
});

export const approveNoDuesSchema = z.object({
  remarks: z.string().max(500).optional(),
  clearanceType: z.string().optional(),
});

export const rejectNoDuesSchema = z.object({
  remarks: z.string().min(1, "Rejection reason is required").max(500),
  clearanceType: z.string().optional(),
});

export const noDuesIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export type CreateNoDuesInput = z.infer<typeof createNoDuesSchema>;
export type ApproveNoDuesInput = z.infer<typeof approveNoDuesSchema>;
export type RejectNoDuesInput = z.infer<typeof rejectNoDuesSchema>;
export type NoDuesIdParams = z.infer<typeof noDuesIdParamsSchema>;
