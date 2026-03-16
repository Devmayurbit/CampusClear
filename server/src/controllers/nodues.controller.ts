import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role, UserRole } from "../utils/roles";

const clearanceKeys = [
  "libraryClearance",
  "accountClearance",
  "hostelClearance",
  "departmentClearance",
] as const;

function mapDepartmentToClearance(department?: string) {
  switch (department) {
    case "LIBRARY":
      return "libraryClearance" as const;
    case "ACCOUNTS":
      return "accountClearance" as const;
    case "HOSTEL":
      return "hostelClearance" as const;
    case "LAB":
    case "TP":
    case "SPORTS":
    default:
      return "departmentClearance" as const;
  }
}

function recomputeOverallStatus(request: any) {
  const statuses = clearanceKeys.map((key) => request[key]?.status || "PENDING");
  if (statuses.includes("REJECTED")) return "REJECTED";
  if (statuses.every((s) => s === "APPROVED")) return "APPROVED";
  return "PENDING";
}

export async function createNoDuesRequest(req: Request, res: Response) {
  const studentId = (req as any).user.userId;
  const { remarks } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "NOT_FOUND", "Student not found");
  }

  const existing = await NoDuesRequest.findOne({
    studentId,
    overallStatus: { $in: ["PENDING", "APPROVED"] },
  });

  if (existing) {
    throw new ApiError(400, "DUPLICATE", "You already have an active request");
  }

  const request = await NoDuesRequest.create({
    studentId,
    remarks: remarks || "",
    overallStatus: "PENDING",
    libraryClearance: { status: "PENDING", remarks: "" },
    accountClearance: { status: "PENDING", remarks: "" },
    hostelClearance: { status: "PENDING", remarks: "" },
    departmentClearance: { status: "PENDING", remarks: "" },
  });

  await logAudit({
    actorId: studentId,
    actorRole: Role.STUDENT,
    action: "CREATE_NODUES",
    targetType: "NoDuesRequest",
    targetId: request._id.toString(),
  });

  res.status(201).json({
    success: true,
    message: "No-Dues request created",
    data: request,
  });
}

export async function getMyNoDues(req: Request, res: Response) {
  const studentId = (req as any).user.userId;

  const request = await NoDuesRequest.findOne({ studentId })
    .populate("studentId", "fullName enrollmentNo email")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: request || null,
  });
}

export async function getAllNoDues(req: Request, res: Response) {
  const { status } = req.query;
  const filter: any = {};
  if (status) {
    filter.overallStatus = status;
  }

  const requests = await NoDuesRequest.find(filter)
    .populate("studentId", "fullName enrollmentNo email")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: requests,
    total: requests.length,
  });
}

export async function approveNoDues(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const role = (req as any).user.role as UserRole;
  const { id } = req.params;
  const { remarks } = req.body;

  const request = await NoDuesRequest.findById(id);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  if (role === Role.ADMIN) {
    clearanceKeys.forEach((key) => {
      request[key] = {
        status: "APPROVED",
        remarks: request[key]?.remarks || "",
        updatedBy: userId,
        updatedAt: new Date(),
      } as any;
    });
  } else {
    const faculty = await Faculty.findById(userId);
    if (!faculty) {
      throw new ApiError(404, "NOT_FOUND", "Faculty not found");
    }
    const clearanceKey = mapDepartmentToClearance(faculty.department);
    request[clearanceKey] = {
      status: "APPROVED",
      remarks: remarks || "",
      updatedBy: userId,
      updatedAt: new Date(),
    } as any;
  }

  request.overallStatus = recomputeOverallStatus(request);
  await request.save();

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: "APPROVE_NODUES",
    targetType: "NoDuesRequest",
    targetId: id,
  });

  res.json({
    success: true,
    message: "No-Dues request approved",
    data: request,
  });
}

export async function rejectNoDues(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const role = (req as any).user.role as UserRole;
  const { id } = req.params;
  const { remarks } = req.body;

  const request = await NoDuesRequest.findById(id);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  if (role === Role.ADMIN) {
    request.overallStatus = "REJECTED";
  } else {
    const faculty = await Faculty.findById(userId);
    if (!faculty) {
      throw new ApiError(404, "NOT_FOUND", "Faculty not found");
    }
    const clearanceKey = mapDepartmentToClearance(faculty.department);
    request[clearanceKey] = {
      status: "REJECTED",
      remarks: remarks || "",
      updatedBy: userId,
      updatedAt: new Date(),
    } as any;
    request.overallStatus = "REJECTED";
  }

  await request.save();

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: "REJECT_NODUES",
    targetType: "NoDuesRequest",
    targetId: id,
  });

  res.json({
    success: true,
    message: "No-Dues request rejected",
    data: request,
  });
}
