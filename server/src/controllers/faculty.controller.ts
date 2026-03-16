import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role } from "../utils/roles";

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

export async function getFacultyRequests(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const requests = await NoDuesRequest.find({})
    .populate("studentId", "fullName enrollmentNo email program batch")
    .lean();

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  const filtered = requests.map((req: any) => ({
    ...req,
    departmentStatus: req[clearanceKey],
    department: faculty.department,
  }));

  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

export async function getFacultyRequestById(req: Request, res: Response) {
  const { requestId } = req.params;
  const facultyId = (req as any).user.userId;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const request = await NoDuesRequest.findById(requestId).populate(
    "studentId",
    "fullName enrollmentNo email program batch"
  );

  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  const clearanceKey = mapDepartmentToClearance(faculty.department);

  res.json({
    success: true,
    data: {
      ...request.toObject(),
      myDepartmentStatus: (request as any)[clearanceKey],
      department: faculty.department,
    },
  });
}

export async function updateRequestStatus(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { requestId } = req.params;
  const { status, remarks } = req.body;

  if (!status) {
    throw new ApiError(400, "VALIDATION_ERROR", "Status is required");
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  const validStatuses = ["APPROVED", "PENDING", "REJECTED"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid status");
  }

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  (request as any)[clearanceKey] = {
    status,
    remarks: remarks || "",
    updatedBy: facultyId,
    updatedAt: new Date(),
  };

  const statuses = [
    request.libraryClearance?.status,
    request.accountClearance?.status,
    request.hostelClearance?.status,
    request.departmentClearance?.status,
  ];

  if (statuses.includes("REJECTED")) {
    request.overallStatus = "REJECTED";
  } else if (statuses.every((s) => s === "APPROVED")) {
    request.overallStatus = "APPROVED";
  } else {
    request.overallStatus = "PENDING";
  }

  await request.save();

  await logAudit({
    actorId: facultyId,
    actorRole: Role.FACULTY,
    action: "FACULTY_UPDATE_NODUES",
    targetType: "NoDuesRequest",
    targetId: requestId,
  });

  res.json({
    success: true,
    message: `Request status updated to ${status}`,
    data: request,
  });
}

export async function searchStudentRequest(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { enrollmentNo } = req.query;

  if (!enrollmentNo) {
    throw new ApiError(400, "VALIDATION_ERROR", "Enrollment number required");
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const student = await Student.findOne({ enrollmentNo });
  if (!student) {
    throw new ApiError(404, "NOT_FOUND", "Student not found");
  }

  const request = await NoDuesRequest.findOne({
    studentId: student._id,
  }).populate("studentId", "fullName enrollmentNo email program batch");

  if (!request) {
    return res.json({
      success: true,
      data: null,
      message: "No request found for this student",
    });
  }

  const clearanceKey = mapDepartmentToClearance(faculty.department);

  res.json({
    success: true,
    data: {
      ...request.toObject(),
      myDepartmentStatus: (request as any)[clearanceKey],
    },
  });
}

export async function getFacultyDashboard(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const requests = await NoDuesRequest.find({}).lean();

  const stats = {
    totalRequests: requests.length,
    cleared: 0,
    pending: 0,
    hold: 0,
  };

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  requests.forEach((req: any) => {
    const deptStatus = req[clearanceKey]?.status;
    if (deptStatus === "APPROVED") stats.cleared++;
    else if (deptStatus === "REJECTED") stats.hold++;
    else stats.pending++;
  });

  res.json({
    success: true,
    data: {
      faculty: {
        id: faculty._id,
        name: faculty.fullName,
        email: faculty.email,
        department: faculty.department,
      },
      stats,
    },
  });
}
