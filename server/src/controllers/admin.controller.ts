import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Certificate } from "../models/Certificate";
import { Student } from "../models/Student";
import { sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role } from "../utils/roles";

export async function getAllRequests(req: Request, res: Response) {
  const { status, page = 1, limit = 20 } = req.query;

  const filter: any = {};
  if (status) {
    filter.overallStatus = status;
  }

  const requests = await NoDuesRequest.find(filter)
    .populate("studentId", "fullName enrollmentNo email program batch")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await NoDuesRequest.countDocuments(filter);

  res.json({
    success: true,
    data: requests,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function approveRequest(req: Request, res: Response) {
  const adminId = (req as any).user.userId;
  const { requestId } = req.params;

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  request.libraryClearance = {
    status: "APPROVED",
    remarks: request.libraryClearance?.remarks || "",
    updatedBy: adminId,
    updatedAt: new Date(),
  } as any;
  request.accountClearance = {
    status: "APPROVED",
    remarks: request.accountClearance?.remarks || "",
    updatedBy: adminId,
    updatedAt: new Date(),
  } as any;
  request.hostelClearance = {
    status: "APPROVED",
    remarks: request.hostelClearance?.remarks || "",
    updatedBy: adminId,
    updatedAt: new Date(),
  } as any;
  request.departmentClearance = {
    status: "APPROVED",
    remarks: request.departmentClearance?.remarks || "",
    updatedBy: adminId,
    updatedAt: new Date(),
  } as any;
  request.overallStatus = "APPROVED";
  await request.save();

  const student = await Student.findById(request.studentId);
  if (student) {
    try {
      await sendEmail({
        to: student.email,
        subject: "No-Dues Certificate Approved - CDGI Portal",
        html: `
          <h1>Congratulations!</h1>
          <p>Hi ${student.fullName},</p>
          <p>Your No-Dues request has been approved.</p>
          <p>You can now download your No-Dues certificate from the portal.</p>
          <p><strong>Enrollment No:</strong> ${student.enrollmentNo || "N/A"}</p>
        `,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }

  await logAudit({
    actorId: adminId,
    actorRole: Role.ADMIN,
    action: "APPROVE_NODUES",
    targetType: "NoDuesRequest",
    targetId: requestId,
  });

  res.json({
    success: true,
    message: "Request approved",
    data: request,
  });
}

export async function rejectRequest(req: Request, res: Response) {
  const adminId = (req as any).user.userId;
  const { requestId } = req.params;
  const { reason } = req.body;

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  request.overallStatus = "REJECTED";
  await request.save();

  const student = await Student.findById(request.studentId);
  if (student) {
    try {
      await sendEmail({
        to: student.email,
        subject: "No-Dues Request Status - CDGI Portal",
        html: `
          <h1>Request Status Update</h1>
          <p>Hi ${student.fullName},</p>
          <p>Your No-Dues request has been rejected.</p>
          <p><strong>Reason:</strong> ${reason || "Check with departments"}</p>
          <p>Please contact the respective departments for clarification.</p>
        `,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }

  await logAudit({
    actorId: adminId,
    actorRole: Role.ADMIN,
    action: "REJECT_NODUES",
    targetType: "NoDuesRequest",
    targetId: requestId,
  });

  res.json({
    success: true,
    message: "Request rejected",
    data: request,
  });
}

export async function getAdminDashboard(req: Request, res: Response) {
  const allRequests = await NoDuesRequest.find({}).lean();

  const stats = {
    total: allRequests.length,
    approved: allRequests.filter((r: any) => r.overallStatus === "APPROVED").length,
    pending: allRequests.filter((r: any) => r.overallStatus === "PENDING").length,
    rejected: allRequests.filter((r: any) => r.overallStatus === "REJECTED").length,
  };

  const recentRequests = await NoDuesRequest.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("studentId", "fullName enrollmentNo email");

  const certificates = await Certificate.countDocuments();

  res.json({
    success: true,
    data: {
      stats,
      recentRequests,
      certificatesIssued: certificates,
    },
  });
}

export async function getAuditLogs(req: Request, res: Response) {
  const { page = 1, limit = 50, action, actorRole } = req.query;

  const filter: any = {};
  if (action) filter.action = action;
  if (actorRole) filter.actorRole = actorRole;

  const { AuditLog } = await import("../models/AuditLog");

  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await AuditLog.countDocuments(filter);

  res.json({
    success: true,
    data: logs,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function getSystemStats(req: Request, res: Response) {
  const { AuditLog } = await import("../models/AuditLog");

  const totalStudents = await Student.countDocuments({ role: { $in: [Role.STUDENT, "student"] } });
  const totalFaculty = await (
    await import("../models/Faculty")
  ).Faculty.countDocuments();
  const totalAdmins = await (await import("../models/Admin")).Admin.countDocuments();

  const totalRequests = await NoDuesRequest.countDocuments();
  const totalCertificates = await Certificate.countDocuments();
  const auditLogCount = await AuditLog.countDocuments();

  res.json({
    success: true,
    data: {
      users: {
        students: totalStudents,
        faculty: totalFaculty,
        admins: totalAdmins,
      },
      requests: {
        total: totalRequests,
        certificates: totalCertificates,
      },
      auditLogs: auditLogCount,
    },
  });
}
