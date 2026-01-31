import type { Express, Response } from "express";
import crypto from "crypto";
import NoDues from "../models/NoDues";
import User from "../models/User";
import Department from "../models/Department";
import {
  authenticateToken,
  requireRole,
  type AuthenticatedRequest,
} from "../middleware/auth";
import { logAction } from "../middleware/audit";
import { ApiError, asyncHandler } from "../middleware/errorHandler";
import { sendVerificationEmail, sendNoDuesSubmittedEmail } from "../mailer";

/**
 * Student: Submit new No-Dues application
 */
export const submitNoDues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { reason } = req.body;

    // Only students can submit
    if (req.user?.role !== "student") {
      throw new ApiError(403, "FORBIDDEN", "Only students can submit No-Dues");
    }

    const student = await User.findById(req.user.userId);
    if (!student) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    // Check if already has pending application
    const existingApplication = await NoDues.findOne({
      studentId: student._id,
      status: { $nin: ["APPROVED", "REJECTED"] },
    });

    if (existingApplication) {
      throw new ApiError(
        409,
        "APPLICATION_EXISTS",
        "You already have a pending No-Dues application"
      );
    }

    // Get all departments (for initialization)
    const departments = await Department.find({ isActive: true });

    // Create departments map
    const departmentsMap = new Map();
    departments.forEach((dept) => {
      departmentsMap.set(dept._id.toString(), {
        departmentId: dept._id,
        departmentName: dept.name,
        status: "pending",
        completedRequirements: [],
        updatedAt: new Date(),
      });
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create No-Dues application
    const noDues = await NoDues.create({
      studentId: student._id,
      studentEmail: student.email,
      studentName: `${student.firstName} ${student.lastName}`,
      enrollmentNo: student.enrollmentNo,
      program: student.program,
      batch: student.batch,
      semester: student.semester,
      reason,
      departments: departmentsMap,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      status: "PENDING_VERIFICATION",
    });

    // Send verification email
    const verifyLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/nodues/verify/${verificationToken}`;
    try {
      await sendVerificationEmail(
        student.email,
        verifyLink,
        student.firstName
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    // Log action
    await logAction(req, {
      action: "NODUES_SUBMIT",
      targetType: "nodues",
      targetId: noDues._id.toString(),
      details: { reason },
    });

    res.status(201).json({
      success: true,
      message:
        "No-Dues application submitted. Please verify your email to proceed.",
      data: {
        noDuesId: noDues._id,
        status: noDues.status,
      },
    });
  }
);

/**
 * Verify No-Dues email
 */
export const verifyNoDues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.params;

    if (!token) {
      throw new ApiError(400, "MISSING_TOKEN", "Verification token required");
    }

    const noDues = await NoDues.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!noDues) {
      throw new ApiError(
        400,
        "INVALID_TOKEN",
        "Invalid or expired verification token"
      );
    }

    // Mark as verified
    noDues.isEmailVerified = true;
    noDues.emailVerifiedAt = new Date();
    noDues.status = "VERIFIED";
    noDues.verificationToken = undefined;
    noDues.verificationTokenExpiry = undefined;
    await noDues.save();

    // Log action
    await logAction(req, {
      action: "NODUES_VERIFY",
      targetType: "nodues",
      targetId: noDues._id.toString(),
    });

    res.json({
      success: true,
      message: "No-Dues verified. Departments can now review your application.",
      data: {
        noDuesId: noDues._id,
        status: noDues.status,
      },
    });
  }
);

/**
 * Student: Get their No-Dues applications
 */
export const getStudentNoDues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "student") {
      throw new ApiError(403, "FORBIDDEN", "Only students can view their applications");
    }

    const noDues = await NoDues.find({
      studentId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: noDues,
    });
  }
);

/**
 * Get single No-Dues application
 */
export const getNoDuesById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const noDues = await NoDues.findById(id);

    if (!noDues) {
      throw new ApiError(404, "NOT_FOUND", "No-Dues application not found");
    }

    // Authorization: students can only view their own, faculty can view assigned departments, admin can view all
    if (req.user?.role === "student" && noDues.studentId.toString() !== req.user.userId) {
      throw new ApiError(403, "FORBIDDEN", "You can only view your own applications");
    }

    res.json({
      success: true,
      data: noDues,
    });
  }
);

/**
 * Faculty: Get No-Dues applications for their department
 */
export const getFacultyNoDues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "faculty") {
      throw new ApiError(403, "FORBIDDEN", "Only faculty can access this endpoint");
    }

    const faculty = await User.findById(req.user.userId);
    if (!faculty || !faculty.departmentId) {
      throw new ApiError(
        400,
        "INVALID_DEPARTMENT",
        "Faculty must be assigned to a department"
      );
    }

    const department = await Department.findById(faculty.departmentId);
    if (!department) {
      throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Department not found");
    }

    // Find all No-Dues with VERIFIED status or IN_PROGRESS
    const noDuesList = await NoDues.find({
      status: { $in: ["VERIFIED", "IN_PROGRESS"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Filter to show only relevant department info
    const filtered = noDuesList.map((nd) => ({
      ...nd,
      departmentData: nd.departments?.get(faculty.departmentId.toString()),
    }));

    res.json({
      success: true,
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
        },
        applications: filtered,
      },
    });
  }
);

/**
 * Faculty: Approve No-Dues for their department
 */
export const approveDepartmentClearance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { noDuesId } = req.params;
    const { remarks, completedRequirements } = req.body;

    if (req.user?.role !== "faculty") {
      throw new ApiError(403, "FORBIDDEN", "Only faculty can approve clearances");
    }

    const faculty = await User.findById(req.user.userId);
    if (!faculty || !faculty.departmentId) {
      throw new ApiError(400, "INVALID_DEPARTMENT", "Faculty not assigned to department");
    }

    const noDues = await NoDues.findById(noDuesId);
    if (!noDues) {
      throw new ApiError(404, "NOT_FOUND", "No-Dues application not found");
    }

    // Update department clearance
    const deptData = noDues.departments?.get(faculty.departmentId.toString());
    if (!deptData) {
      throw new ApiError(400, "INVALID_ACTION", "This department is not part of this application");
    }

    deptData.status = "approved";
    deptData.remarks = remarks;
    deptData.completedRequirements = completedRequirements || [];
    deptData.approvedBy = faculty._id;
    deptData.approvedAt = new Date();
    deptData.updatedAt = new Date();

    noDues.departments?.set(faculty.departmentId.toString(), deptData);

    // Check if all departments approved
    const allApproved = Array.from(noDues.departments?.values() || []).every(
      (dept: any) => dept.status === "approved"
    );

    if (allApproved) {
      noDues.status = "APPROVED";
    } else {
      noDues.status = "IN_PROGRESS";
    }

    await noDues.save();

    // Log action
    await logAction(req, {
      action: "NODUES_APPROVE",
      targetType: "nodues",
      targetId: noDues._id.toString(),
      details: { departmentId: faculty.departmentId, remarks },
    });

    res.json({
      success: true,
      message: "Clearance approved",
      data: noDues,
    });
  }
);

/**
 * Faculty: Reject No-Dues for their department
 */
export const rejectDepartmentClearance = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { noDuesId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      throw new ApiError(400, "MISSING_FIELD", "Rejection reason is required");
    }

    if (req.user?.role !== "faculty") {
      throw new ApiError(403, "FORBIDDEN", "Only faculty can reject clearances");
    }

    const faculty = await User.findById(req.user.userId);
    if (!faculty || !faculty.departmentId) {
      throw new ApiError(400, "INVALID_DEPARTMENT", "Faculty not assigned to department");
    }

    const noDues = await NoDues.findById(noDuesId);
    if (!noDues) {
      throw new ApiError(404, "NOT_FOUND", "No-Dues application not found");
    }

    // Update department clearance
    const deptData = noDues.departments?.get(faculty.departmentId.toString());
    if (!deptData) {
      throw new ApiError(400, "INVALID_ACTION", "This department is not part of this application");
    }

    deptData.status = "rejected";
    deptData.rejectionReason = rejectionReason;
    deptData.approvedBy = faculty._id;
    deptData.approvedAt = new Date();
    deptData.updatedAt = new Date();

    noDues.departments?.set(faculty.departmentId.toString(), deptData);
    noDues.status = "IN_PROGRESS"; // Can be resubmitted

    await noDues.save();

    // Log action
    await logAction(req, {
      action: "NODUES_APPROVE",
      targetType: "nodues",
      targetId: noDues._id.toString(),
      details: { departmentId: faculty.departmentId, rejectionReason },
    });

    res.json({
      success: true,
      message: "Clearance rejected",
      data: noDues,
    });
  }
);
