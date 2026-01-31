import type { Request, Response, NextFunction } from "express";
import AuditLog from "../models/AuditLog";
import type { AuthenticatedRequest } from "./auth";

export interface AuditLogPayload {
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: any;
  changes?: any;
  statusCode?: number;
  errorMessage?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  actorId?: string;
  actorRole?: string;
  actorName?: string;
  actorEmail?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: any;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  endpoint?: string;
  statusCode?: number;
  errorMessage?: string;
}) {
  try {
    await AuditLog.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit log failure shouldn't block requests
  }
}

/**
 * Middleware: Auto-log requests
 */
export function auditMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // Capture original send
  const originalSend = res.send.bind(res);

  res.send = function (data: any) {
    // Log after response is sent
    setImmediate(() => {
      createAuditLog({
        actorId: req.user?.userId,
        actorRole: req.user?.role,
        actorEmail: req.user?.email,
        httpMethod: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    });

    return originalSend(data);
  };

  next();
}

/**
 * Helper to log specific actions
 */
export async function logAction(
  req: AuthenticatedRequest,
  payload: AuditLogPayload
) {
  return createAuditLog({
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    actorEmail: req.user?.email,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    ...payload,
  });
}
