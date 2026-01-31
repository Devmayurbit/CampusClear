import { Request, Response } from "express";
import crypto from "crypto";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Student } from "../models/Student";
import { sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";

export async function submitNoDuesRequest(req: Request, res: Response) {
  const studentId = (req as any).user.userId;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "VALIDATION_ERROR", "Reason is required");
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "NOT_FOUND", "Student not found");
  }

  // Check if already has pending/approved request
  const existing = await NoDuesRequest.findOne({
    studentId,
    overallStatus: { $in: ["PENDING", "APPROVED"] },
  });

  if (existing) {
    throw new ApiError(400, "DUPLICATE", "You already have an active request");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const request = await NoDuesRequest.create({
    studentId,
    reason,
    verificationToken,
    verified: false,
    overallStatus: "PENDING",
    departments: {
      library: { status: "PENDING", remarks: "" },
      accounts: { status: "PENDING", remarks: "" },
      hostel: { status: "PENDING", remarks: "" },
      lab: { status: "PENDING", remarks: "" },
      tp: { status: "PENDING", remarks: "" },
      sports: { status: "PENDING", remarks: "" },
    },
  });

  // Send verification email
  const verificationLink = `${process.env.FRONTEND_URL}/verify-nodues?token=${verificationToken}`;
  try {
    await sendEmail({
      to: student.email,
      subject: "Verify Your No-Dues Request - CDGI Portal",
      html: `
        <h1>No-Dues Request Submitted</h1>
        <p>Hi ${student.fullName},</p>
        <p>Your No-Dues request has been submitted. Please verify it by clicking below:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Request
        </a>
        <p><strong>Enrollment No:</strong> ${student.enrollmentNo}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }

  await logAudit({
    actorId: studentId,
    actorRole: "student",
    action: "SUBMIT_NODUES",
    targetType: "NoDuesRequest",
    targetId: request._id.toString(),
  });

  res.status(201).json({
    success: true,
    message: "Request submitted. Check your email to verify.",
    data: { id: request._id },
  });
}

export async function verifyNoDuesRequest(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "VALIDATION_ERROR", "Verification token required");
  }

  const request = await NoDuesRequest.findOne({ verificationToken: token });
  if (!request) {
    throw new ApiError(400, "INVALID_TOKEN", "Invalid or expired token");
  }

  request.verified = true;
  request.verificationToken = undefined;
  await request.save();

  await logAudit({
    actorId: request.studentId.toString(),
    actorRole: "student",
    action: "VERIFY_NODUES",
    targetType: "NoDuesRequest",
    targetId: request._id.toString(),
  });

  res.json({
    success: true,
    message: "Request verified. Departments can now review.",
  });
}

export async function getStudentRequest(req: Request, res: Response) {
  const studentId = (req as any).user.userId;

  const request = await NoDuesRequest.findOne({ studentId })
    .populate("studentId", "fullName enrollmentNo email")
    .lean();

  if (!request) {
    return res.json({
      success: true,
      data: null,
      message: "No active request found",
    });
  }

  res.json({
    success: true,
    data: request,
  });
}

export async function getRequestHistory(req: Request, res: Response) {
  const studentId = (req as any).user.userId;

  const requests = await NoDuesRequest.find({ studentId })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: requests,
    total: requests.length,
  });
}

export async function updateDepartmentStatus(req: Request, res: Response) {
  const facultyId = (req as any).user.userId;
  const { requestId, department, status, remarks } = req.body;

  if (!requestId || !department || !status) {
    throw new ApiError(400, "VALIDATION_ERROR", "Missing required fields");
  }

  const validStatuses = ["PENDING", "CLEARED", "HOLD"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid status");
  }

  const validDepts = ["library", "accounts", "hostel", "lab", "tp", "sports"];
  if (!validDepts.includes(department)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid department");
  }

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  if (!request.verified) {
    throw new ApiError(400, "NOT_VERIFIED", "Request not verified yet");
  }

  // Update department status
  (request.departments as any)[department] = {
    status,
    remarks: remarks || "",
    updatedBy: facultyId,
  };

  // Check if all departments are CLEARED
  const allCleared = Object.values(request.departments as any).every(
    (dept: any) => dept.status === "CLEARED"
  );

  if (allCleared) {
    request.overallStatus = "APPROVED";
  } else {
    const anyHold = Object.values(request.departments as any).some(
      (dept: any) => dept.status === "HOLD"
    );
    request.overallStatus = anyHold ? "HOLD" : "PENDING";
  }

  await request.save();

  await logAudit({
    actorId: facultyId,
    actorRole: "faculty",
    action: "UPDATE_NODUES_STATUS",
    targetType: "NoDuesRequest",
    targetId: requestId,
  });

  res.json({
    success: true,
    message: `${department} status updated to ${status}`,
    data: request,
  });
}
