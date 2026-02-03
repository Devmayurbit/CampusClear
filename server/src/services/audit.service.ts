import { AuditLog } from "../models/AuditLog";

export async function logAudit(params: {
  actorId: string;
  actorRole: "STUDENT" | "FACULTY" | "ADMIN";
  action: string;
  targetType: string;
  targetId?: string;
  ipAddress?: string;
}) {
  return AuditLog.create({
    actorId: params.actorId,
    actorRole: params.actorRole,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    ipAddress: params.ipAddress,
  });
}
