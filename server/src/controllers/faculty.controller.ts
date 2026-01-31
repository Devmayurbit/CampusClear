import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";

export async function getFacultyRequests(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const requests = await NoDuesRequest.find({
    verified: true,
  })
    .populate("studentId", "fullName enrollmentNo email program batch")
    .lean();

  // Filter requests for the faculty's department
  const filtered = requests.map((req: any) => ({
    ...req,
    departmentStatus: req.departments[faculty.department],
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

  res.json({
    success: true,
    data: {
      ...request.toObject(),
      myDepartmentStatus: (request.departments as any)[faculty.department],
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

  const validStatuses = ["CLEARED", "PENDING", "HOLD"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid status");
  }

  // Update the specific department
  (request.departments as any)[faculty.department] = {
    status,
    remarks: remarks || "",
    updatedBy: facultyId,
    updatedAt: new Date(),
  };

  // Check overall status
  const allStatuses = Object.values(request.departments as any);
  const allCleared = (allStatuses as any[]).every((d) => d.status === "CLEARED");
  const anyHold = (allStatuses as any[]).some((d) => d.status === "HOLD");

  if (allCleared) {
    request.overallStatus = "APPROVED";
  } else if (anyHold) {
    request.overallStatus = "HOLD";
  } else {
    request.overallStatus = "PENDING";
  }

  await request.save();

  await logAudit({
    actorId: facultyId,
    actorRole: "faculty",
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

  res.json({
    success: true,
    data: {
      ...request.toObject(),
      myDepartmentStatus: (request.departments as any)[faculty.department],
    },
  });
}

export async function getFacultyDashboard(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const requests = await NoDuesRequest.find({ verified: true }).lean();

  const stats = {
    totalRequests: requests.length,
    cleared: 0,
    pending: 0,
    hold: 0,
  };

  requests.forEach((req: any) => {
    const deptStatus = req.departments[faculty.department]?.status;
    if (deptStatus === "CLEARED") stats.cleared++;
    else if (deptStatus === "HOLD") stats.hold++;
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
