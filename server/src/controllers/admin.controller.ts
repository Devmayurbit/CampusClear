import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Certificate } from "../models/Certificate";
import { Student } from "../models/Student";
import { sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role } from "../utils/roles";
import { Department } from "../models/Department";
import { Faculty } from "../models/Faculty";
import { Admin } from "../models/Admin";
import { SuperAdmin } from "../models/SuperAdmin";
import { hashPassword } from "../utils/password";

function splitName(fullName?: string) {
  const cleaned = (fullName || "").trim();
  if (!cleaned) return { firstName: "", lastName: "" };
  const parts = cleaned.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

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

export async function getAdminNoDues(req: Request, res: Response) {
  const requests = await NoDuesRequest.find({})
    .populate("studentId", "fullName enrollmentNo email program batch")
    .sort({ createdAt: -1 })
    .lean();

  const mapped = requests.map((item: any) => ({
    _id: item._id,
    studentName: item.studentId?.fullName || "N/A",
    studentEmail: item.studentId?.email || "N/A",
    enrollmentNo: item.studentId?.enrollmentNo || "",
    program: item.studentId?.program || "",
    batch: item.studentId?.batch || "",
    status: item.overallStatus,
    feeStatus: item.feeStatus || "UNPAID",
    createdAt: item.createdAt,
  }));

  res.json({
    success: true,
    data: mapped,
  });
}

export async function approveRequest(req: Request, res: Response) {
  const adminId = (req as any).user.userId;
  const actorRole = (req as any).user.role || Role.ADMIN;
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
  request.labClearance = {
    status: "APPROVED",
    remarks: request.labClearance?.remarks || "",
    updatedBy: adminId,
    updatedAt: new Date(),
  } as any;
  request.tpClearance = {
    status: "APPROVED",
    remarks: request.tpClearance?.remarks || "",
    updatedBy: adminId,
    updatedAt: new Date(),
  } as any;
  request.sportsClearance = {
    status: "APPROVED",
    remarks: request.sportsClearance?.remarks || "",
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
    actorRole,
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

export async function approveNoDuesById(req: Request, res: Response) {
  req.params.requestId = req.params.id;
  return approveRequest(req, res);
}

export async function rejectRequest(req: Request, res: Response) {
  const adminId = (req as any).user.userId;
  const actorRole = (req as any).user.role || Role.ADMIN;
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
    actorRole,
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

export async function rejectNoDuesById(req: Request, res: Response) {
  req.params.requestId = req.params.id;
  return rejectRequest(req, res);
}

export async function getStudents(req: Request, res: Response) {
  const students = await Student.find({ role: { $in: [Role.STUDENT, "student"] } })
    .sort({ createdAt: -1 })
    .lean();

  const mapped = students.map((student: any) => {
    const { firstName, lastName } = splitName(student.fullName);
    return {
      _id: student._id,
      firstName,
      lastName,
      email: student.email,
      enrollmentNo: student.enrollmentNo || "",
      program: student.program || "",
      batch: student.batch || "",
      role: student.role,
      isVerified: Boolean(student.verified),
    };
  });

  res.json({
    success: true,
    data: mapped,
  });
}

export async function getDepartments(req: Request, res: Response) {
  const departments = await Department.find({ isActive: true })
    .sort({ name: 1 })
    .lean();

  res.json({
    success: true,
    data: departments,
  });
}

export async function createDepartment(req: Request, res: Response) {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "VALIDATION_ERROR", "Department name is required");
  }

  const normalizedName = String(name).trim().toUpperCase();
  const existing = await Department.findOne({ name: normalizedName });
  if (existing) {
    throw new ApiError(409, "DUPLICATE", "Department already exists");
  }

  const department = await Department.create({
    name: normalizedName,
    description: description || "",
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: "Department created",
    data: department,
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
        superAdmins: await SuperAdmin.countDocuments(),
      },
      requests: {
        total: totalRequests,
        certificates: totalCertificates,
      },
      auditLogs: auditLogCount,
    },
  });
}

export async function getAllUsers(req: Request, res: Response) {
  const [students, faculty, admins, superAdmins] = await Promise.all([
    Student.find({ role: { $in: [Role.STUDENT, "student"] } }).lean(),
    Faculty.find({}).lean(),
    Admin.find({}).lean(),
    SuperAdmin.find({}).lean(),
  ]);

  const mappedStudents = students.map((item: any) => ({
    _id: item._id,
    fullName: item.fullName,
    email: item.email,
    role: Role.STUDENT,
    department: null,
    isActive: Boolean(item.isActive),
    verified: Boolean(item.verified),
    createdAt: item.createdAt,
  }));

  const mappedFaculty = faculty.map((item: any) => ({
    _id: item._id,
    fullName: item.fullName,
    email: item.email,
    role: Role.FACULTY,
    department: item.department || null,
    isActive: Boolean(item.isActive),
    verified: true,
    createdAt: item.createdAt,
  }));

  const mappedAdmins = admins.map((item: any) => ({
    _id: item._id,
    fullName: item.fullName,
    email: item.email,
    role: Role.ADMIN,
    department: null,
    isActive: Boolean(item.isActive),
    verified: true,
    createdAt: item.createdAt,
  }));

  const mappedSuperAdmins = superAdmins.map((item: any) => ({
    _id: item._id,
    fullName: item.fullName,
    email: item.email,
    role: Role.SUPER_ADMIN,
    department: item.department || null,
    isActive: Boolean(item.isActive),
    verified: true,
    createdAt: item.createdAt,
  }));

  const users = [...mappedStudents, ...mappedFaculty, ...mappedAdmins, ...mappedSuperAdmins]
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  res.json({
    success: true,
    data: users,
  });
}

export async function createUser(req: Request, res: Response) {
  const actorId = (req as any).user.userId;
  const { fullName, email, password, role, department } = req.body;

  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, "VALIDATION_ERROR", "fullName, email, password and role are required");
  }

  const normalizedEmail = String(email).toLowerCase();
  const normalizedRole = String(role).toUpperCase();
  const passwordHash = await hashPassword(password);

  if (normalizedRole === Role.FACULTY) {
    if (!department) {
      throw new ApiError(400, "VALIDATION_ERROR", "department is required for faculty");
    }
    const existing = await Faculty.findOne({ email: normalizedEmail });
    if (existing) throw new ApiError(409, "DUPLICATE", "Faculty already exists");

    const created = await Faculty.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      department: String(department).trim().toUpperCase(),
      role: Role.FACULTY,
      authProvider: "LOCAL",
      isActive: true,
    });

    await logAudit({
      actorId,
      actorRole: Role.SUPER_ADMIN,
      action: "CREATE_FACULTY",
      targetType: "Faculty",
      targetId: created._id.toString(),
    });

    return res.status(201).json({ success: true, message: "Faculty created", data: { id: created._id } });
  }

  if (normalizedRole === Role.ADMIN) {
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) throw new ApiError(409, "DUPLICATE", "Admin already exists");

    const created = await Admin.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      role: Role.ADMIN,
      authProvider: "LOCAL",
      isActive: true,
    });

    await logAudit({
      actorId,
      actorRole: Role.SUPER_ADMIN,
      action: "CREATE_ADMIN",
      targetType: "Admin",
      targetId: created._id.toString(),
    });

    return res.status(201).json({ success: true, message: "Admin created", data: { id: created._id } });
  }

  if (normalizedRole === Role.SUPER_ADMIN) {
    const existing = await SuperAdmin.findOne({ email: normalizedEmail });
    if (existing) throw new ApiError(409, "DUPLICATE", "Super admin already exists");

    const created = await SuperAdmin.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      department: department ? String(department).trim().toUpperCase() : undefined,
      role: Role.SUPER_ADMIN,
      authProvider: "LOCAL",
      isActive: true,
    });

    await logAudit({
      actorId,
      actorRole: Role.SUPER_ADMIN,
      action: "CREATE_SUPER_ADMIN",
      targetType: "SuperAdmin",
      targetId: created._id.toString(),
    });

    return res.status(201).json({ success: true, message: "Super admin created", data: { id: created._id } });
  }

  throw new ApiError(400, "VALIDATION_ERROR", "Invalid role");
}

export async function updateFeeStatus(req: Request, res: Response) {
  const actorId = (req as any).user.userId;
  const { requestId } = req.params;
  const { feeStatus } = req.body;

  const validStatuses = ["UNPAID", "PAID", "WAIVED"];
  if (!feeStatus || !validStatuses.includes(feeStatus)) {
    throw new ApiError(400, "VALIDATION_ERROR", "feeStatus must be UNPAID, PAID, or WAIVED");
  }

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  request.feeStatus = feeStatus;
  await request.save();

  await logAudit({
    actorId,
    actorRole: Role.SUPER_ADMIN,
    action: "UPDATE_FEE_STATUS",
    targetType: "NoDuesRequest",
    targetId: requestId,
  });

  res.json({
    success: true,
    message: `Fee status updated to ${feeStatus}`,
    data: { _id: request._id, feeStatus: request.feeStatus },
  });
}

export async function toggleUserStatus(req: Request, res: Response) {
  const actorId = (req as any).user.userId;
  const { role, userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "VALIDATION_ERROR", "isActive must be boolean");
  }

  const normalizedRole = String(role).toUpperCase();
  let updated: any = null;

  if (normalizedRole === Role.STUDENT) {
    updated = await Student.findByIdAndUpdate(userId, { isActive }, { new: true });
  } else if (normalizedRole === Role.FACULTY) {
    updated = await Faculty.findByIdAndUpdate(userId, { isActive }, { new: true });
  } else if (normalizedRole === Role.ADMIN) {
    updated = await Admin.findByIdAndUpdate(userId, { isActive }, { new: true });
  } else if (normalizedRole === Role.SUPER_ADMIN) {
    updated = await SuperAdmin.findByIdAndUpdate(userId, { isActive }, { new: true });
  } else {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid role");
  }

  if (!updated) {
    throw new ApiError(404, "NOT_FOUND", "User not found");
  }

  await logAudit({
    actorId,
    actorRole: Role.SUPER_ADMIN,
    action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    targetType: normalizedRole,
    targetId: userId,
  });

  res.json({
    success: true,
    message: `User ${isActive ? "activated" : "deactivated"}`,
    data: { _id: updated._id, isActive: updated.isActive, role: normalizedRole },
  });
}
