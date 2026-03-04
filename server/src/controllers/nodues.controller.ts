import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role, UserRole } from "../utils/roles";

const clearanceKeys = [
  "libraryClearance",
  "labClearance",
  "tpClearance",
  "sportsClearance",
  "accountClearance",
  "hostelClearance",
  "departmentClearance",
] as const;

function mapDepartmentToClearance(department?: string) {
  switch (department) {
    case "LIBRARY":
      return "libraryClearance" as const;
    case "LAB":
      return "labClearance" as const;
    case "TP":
      return "tpClearance" as const;
    case "SPORTS":
      return "sportsClearance" as const;
    case "ACCOUNTS":
      return "accountClearance" as const;
    case "HOSTEL":
      return "hostelClearance" as const;
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

  console.log("📝 Creating No-Dues request for student:", studentId);

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    console.error("❌ Student not found:", studentId);
    throw new ApiError(404, "NOT_FOUND", "Student not found");
  }

  console.log("✅ Student found:", student.fullName, student.email);

  // Check for existing active request
  const existing = await NoDuesRequest.findOne({
    studentId,
    overallStatus: { $in: ["PENDING", "APPROVED"] },
  });

  if (existing) {
    console.log("⚠️ Student already has an active request:", existing._id);
    throw new ApiError(400, "DUPLICATE", "You already have an active No-Dues request");
  }

  // Create new request
  const request = await NoDuesRequest.create({
    studentId,
    remarks: remarks || "",
    overallStatus: "PENDING",
    libraryClearance: { status: "PENDING", remarks: "" },
    labClearance: { status: "PENDING", remarks: "" },
    tpClearance: { status: "PENDING", remarks: "" },
    sportsClearance: { status: "PENDING", remarks: "" },
    accountClearance: { status: "PENDING", remarks: "" },
    hostelClearance: { status: "PENDING", remarks: "" },
    departmentClearance: { status: "PENDING", remarks: "" },
  });

  console.log("✅ No-Dues request created successfully:", request._id);

  // Log audit trail
  await logAudit({
    actorId: studentId,
    actorRole: Role.STUDENT,
    action: "CREATE_NODUES",
    targetType: "NoDuesRequest",
    targetId: request._id.toString(),
  });

  res.status(201).json({
    success: true,
    message: "No-Dues request created successfully",
    data: request,
  });
}

export async function getMyNoDues(req: Request, res: Response) {
  const studentId = (req as any).user.userId;

  console.log("📖 Fetching No-Dues request for student:", studentId);

  const request = await NoDuesRequest.findOne({ studentId })
    .populate("studentId", "fullName enrollmentNo email")
    .sort({ createdAt: -1 })
    .lean();

  if (request) {
    console.log("✅ Found No-Dues request:", request._id, "Status:", request.overallStatus);
  } else {
    console.log("ℹ️ No active No-Dues request found for student");
  }

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

export async function deleteNoDuesRequest(req: Request, res: Response) {
  const studentId = (req as any).user.userId;
  const { id } = req.params;

  console.log("🗑️ Deleting No-Dues request:", id, "for student:", studentId);

  // Find the request
  const request = await NoDuesRequest.findById(id);
  if (!request) {
    console.error("❌ Request not found:", id);
    throw new ApiError(404, "NOT_FOUND", "No-Dues request not found");
  }

  // Verify ownership - only the student who created it can delete
  if (request.studentId.toString() !== studentId) {
    console.error("❌ Unauthorized delete attempt. Request owner:", request.studentId, "Student:", studentId);
    throw new ApiError(403, "FORBIDDEN", "You can only delete your own No-Dues request");
  }

  // Only allow deletion of PENDING or REJECTED requests
  if (request.overallStatus === "APPROVED") {
    console.error("❌ Cannot delete approved request:", id);
    throw new ApiError(400, "BAD_REQUEST", "Cannot delete an approved No-Dues request");
  }

  // Delete the request
  await NoDuesRequest.findByIdAndDelete(id);

  console.log("✅ No-Dues request deleted successfully:", id);

  // Log audit trail
  await logAudit({
    actorId: studentId,
    actorRole: Role.STUDENT,
    action: "DELETE_NODUES",
    targetType: "NoDuesRequest",
    targetId: id,
  });

  res.json({
    success: true,
    message: "No-Dues request deleted successfully",
  });
}
