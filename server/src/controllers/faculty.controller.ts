import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role } from "../utils/roles";
import { sendEmail } from "../utils/email";

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
    request.labClearance?.status,
    request.tpClearance?.status,
    request.sportsClearance?.status,
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

  // Best-effort email notification
  try {
    const student = await Student.findById(request.studentId);
    if (student) {
      await sendEmail({
        to: student.email,
        subject: `No-Dues ${status} - ${faculty.department} Department`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">No-Dues Status Update</h2>
            <p>Hello <strong>${student.fullName}</strong>,</p>
            <p>Your <strong>${faculty.department}</strong> department clearance has been updated to: <strong>${status}</strong></p>
            ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
            <p>Please check the portal for more details.</p>
          </div>
        `,
      });
    }
  } catch (emailErr) {
    console.error("Status change email failed:", emailErr);
  }

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

// Bulk approve/reject requests
export async function bulkUpdateRequests(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { requestIds, status, remarks } = req.body;

  if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request IDs are required");
  }

  if (!status) {
    throw new ApiError(400, "VALIDATION_ERROR", "Status is required");
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const validStatuses = ["APPROVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid status");
  }

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  const results = [];

  for (const requestId of requestIds) {
    try {
      const request = await NoDuesRequest.findById(requestId);
      if (!request) continue;

      (request as any)[clearanceKey] = {
        status,
        remarks: remarks || `Bulk ${status.toLowerCase()} by faculty`,
        updatedBy: facultyId,
        updatedAt: new Date(),
      };

      const statuses = [
        request.libraryClearance?.status,
        request.labClearance?.status,
        request.tpClearance?.status,
        request.sportsClearance?.status,
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
        action: "BULK_UPDATE_NODUES",
        targetType: "NoDuesRequest",
        targetId: requestId,
      });

      results.push({ requestId, success: true });
    } catch (error) {
      results.push({ requestId, success: false, error: (error as Error).message });
    }
  }

  res.json({
    success: true,
    message: `Bulk update completed: ${results.filter(r => r.success).length}/${requestIds.length} succeeded`,
    data: results,
  });
}

// Get detailed student information
export async function getStudentDetails(req: Request, res: Response) {
  const { studentId } = req.params;

  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new ApiError(404, "NOT_FOUND", "Student not found");
  }

  const requests = await NoDuesRequest.find({ studentId }).lean();

  res.json({
    success: true,
    data: {
      student,
      noDuesHistory: requests,
    },
  });
}

// Export requests to CSV
export async function exportRequests(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { status, startDate, endDate } = req.query;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  let query: any = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const requests = await NoDuesRequest.find(query)
    .populate("studentId", "fullName enrollmentNo email program batch")
    .lean();

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  
  let filteredRequests = requests;
  if (status) {
    filteredRequests = requests.filter((req: any) => 
      req[clearanceKey]?.status === status
    );
  }

  // Create CSV content
  const csvHeaders = "Enrollment No,Student Name,Program,Batch,Status,Remarks,Updated At\n";
  const csvRows = filteredRequests.map((req: any) => {
    const student = req.studentId || {};
    const deptStatus = req[clearanceKey] || {};
    return `${student.enrollmentNo || ""},${student.fullName || ""},${student.program || ""},${student.batch || ""},${deptStatus.status || "PENDING"},"${deptStatus.remarks || ""}",${deptStatus.updatedAt || ""}`;
  }).join("\n");

  const csv = csvHeaders + csvRows;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=nodues-requests-${Date.now()}.csv`);
  res.send(csv);
}

// Get filtered requests with advanced options
export async function getFilteredRequests(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { status, batch, program, sortBy, sortOrder, search } = req.query;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  let studentQuery: any = {};
  if (batch) studentQuery.batch = batch;
  if (program) studentQuery.program = program;
  if (search) {
    studentQuery.$or = [
      { enrollmentNo: new RegExp(search as string, "i") },
      { fullName: new RegExp(search as string, "i") },
      { email: new RegExp(search as string, "i") },
    ];
  }

  const students = await Student.find(studentQuery).select("_id");
  const studentIds = students.map(s => s._id);

  let requestQuery: any = {};
  if (studentIds.length > 0) {
    requestQuery.studentId = { $in: studentIds };
  }

  let sortOptions: any = {};
  if (sortBy) {
    sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;
  } else {
    sortOptions.createdAt = -1;
  }

  const requests = await NoDuesRequest.find(requestQuery)
    .populate("studentId", "fullName enrollmentNo email program batch")
    .sort(sortOptions)
    .lean();

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  
  let filteredRequests = requests.map((req: any) => ({
    ...req,
    departmentStatus: req[clearanceKey],
    department: faculty.department,
  }));

  if (status && status !== "ALL") {
    filteredRequests = filteredRequests.filter((req: any) => 
      (req.departmentStatus?.status || "PENDING") === status
    );
  }

  res.json({
    success: true,
    data: filteredRequests,
    total: filteredRequests.length,
    filters: { status, batch, program, search },
  });
}

// Add detailed remarks to a request
export async function addRequestRemarks(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { requestId } = req.params;
  const { remarks } = req.body;

  if (!remarks || remarks.trim() === "") {
    throw new ApiError(400, "VALIDATION_ERROR", "Remarks are required");
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "NOT_FOUND", "Faculty not found");
  }

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  const clearanceKey = mapDepartmentToClearance(faculty.department);
  const currentStatus = (request as any)[clearanceKey];

  (request as any)[clearanceKey] = {
    ...currentStatus,
    remarks: remarks.trim(),
    updatedBy: facultyId,
    updatedAt: new Date(),
  };

  await request.save();

  await logAudit({
    actorId: facultyId,
    actorRole: Role.FACULTY,
    action: "ADD_REMARKS",
    targetType: "NoDuesRequest",
    targetId: requestId,
  });

  res.json({
    success: true,
    message: "Remarks added successfully",
    data: request,
  });
}
