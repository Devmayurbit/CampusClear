import type { Response } from "express";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import User from "../models/User";
import NoDues from "../models/NoDues";
import Certificate from "../models/Certificate";
import Department from "../models/Department";
import AuditLog from "../models/AuditLog";
import {
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/auth";
import { logAction } from "../middleware/audit";
import { ApiError, asyncHandler } from "../middleware/errorHandler";

/**
 * Admin: Get all No-Dues applications
 */
export const getAllNoDues = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { status, studentName, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (studentName) {
      query.studentName = { $regex: studentName, $options: "i" };
    }

    const skip = ((Number(page) - 1) * Number(limit));

    const [data, total] = await Promise.all([
      NoDues.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      NoDues.countDocuments(query),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

/**
 * Admin: Approve No-Dues application
 */
export const approveNoDuesAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { noDuesId } = req.params;
    const { remarks } = req.body;

    const noDues = await NoDues.findById(noDuesId);
    if (!noDues) {
      throw new ApiError(404, "NOT_FOUND", "No-Dues application not found");
    }

    // Update status
    noDues.status = "APPROVED";
    noDues.approvedByAdmin = req.user?.userId;
    noDues.adminApprovalDate = new Date();
    noDues.adminRemarks = remarks;
    await noDues.save();

    // Log action
    await logAction(req, {
      action: "NODUES_APPROVE",
      targetType: "nodues",
      targetId: noDues._id.toString(),
      details: { adminRemarks: remarks },
    });

    res.json({
      success: true,
      message: "No-Dues approved",
      data: noDues,
    });
  }
);

/**
 * Admin: Reject No-Dues application
 */
export const rejectNoDuesAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { noDuesId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      throw new ApiError(400, "MISSING_FIELD", "Rejection reason is required");
    }

    const noDues = await NoDues.findById(noDuesId);
    if (!noDues) {
      throw new ApiError(404, "NOT_FOUND", "No-Dues application not found");
    }

    // Update status
    noDues.status = "REJECTED";
    noDues.isRejected = true;
    noDues.rejectionDate = new Date();
    noDues.rejectionReason = rejectionReason;
    await noDues.save();

    // Log action
    await logAction(req, {
      action: "NODUES_APPROVE",
      targetType: "nodues",
      targetId: noDues._id.toString(),
      details: { rejectionReason },
    });

    res.json({
      success: true,
      message: "No-Dues rejected",
      data: noDues,
    });
  }
);

/**
 * Generate No-Dues Certificate (PDF + QR Code)
 */
async function generatePDFCertificate(
  certificateId: string,
  studentName: string,
  enrollmentNo: string,
  program: string,
  batch: string,
  qrCodeDataUrl: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header with institution name
    doc.fontSize(24).font("Helvetica-Bold").text("CDGI", { align: "center" });
    doc.fontSize(12).font("Helvetica").text("Chameli Devi Group of Institutions", {
      align: "center",
    });
    doc.fontSize(10).text("New Delhi, India", { align: "center" });

    doc.moveTo(50, 120).lineTo(550, 120).stroke();

    doc.fontSize(18)
      .font("Helvetica-Bold")
      .text("Certificate of No-Dues Clearance", { align: "center", margin: 40 });

    doc.fontSize(11).font("Helvetica").text("", 50, 200);
    doc.text("This is to certify that", { align: "center" });

    doc.fontSize(14)
      .font("Helvetica-Bold")
      .text(studentName, { align: "center", margin: 20 });

    doc.fontSize(11).font("Helvetica");
    doc.text(`Enrollment Number: ${enrollmentNo}`, { align: "center" });
    doc.text(`Program: ${program}`, { align: "center" });
    doc.text(`Batch: ${batch}`, { align: "center" });

    doc.text("", 50, 320);
    doc.text(
      "has completed all clearance requirements from all departments of the institution",
      { align: "center", width: 500 }
    );

    doc.text("", 50, 380);
    doc.fontSize(10).text(`Certificate ID: ${certificateId}`, { align: "center" });
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });

    // QR Code
    if (qrCodeDataUrl) {
      const qrBuffer = Buffer.from(
        qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
        "base64"
      );
      doc.image(qrBuffer, 450, 480, { width: 80, height: 80 });
    }

    // Footer
    doc.fontSize(8)
      .text("", 50, 600)
      .text("This certificate is valid and has not been revoked as of the date of issue.", {
        align: "center",
        color: "#666666",
      });

    doc.end();
  });
}

/**
 * Admin: Generate certificate for approved No-Dues
 */
export const generateCertificate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { noDuesId } = req.params;

    const noDues = await NoDues.findById(noDuesId);
    if (!noDues) {
      throw new ApiError(404, "NOT_FOUND", "No-Dues application not found");
    }

    if (noDues.status !== "APPROVED") {
      throw new ApiError(
        400,
        "INVALID_STATUS",
        "Only approved applications can have certificates"
      );
    }

    // Check if certificate already exists
    if (noDues.certificateId) {
      const cert = await Certificate.findById(noDues.certificateId);
      if (cert && cert.isValid) {
        return res.json({
          success: true,
          message: "Certificate already exists",
          data: cert,
        });
      }
    }

    // Generate unique certificate ID
    const year = new Date().getFullYear();
    const sequentialId = await Certificate.countDocuments() + 1;
    const certificateId = `CDGI-${year}-${String(sequentialId).padStart(6, "0")}`;

    // Generate QR code
    const qrData = `${process.env.FRONTEND_URL || "http://localhost:5173"}/certificate/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    // Generate PDF
    const pdfBuffer = await generatePDFCertificate(
      certificateId,
      noDues.studentName,
      noDues.enrollmentNo || "",
      noDues.program || "",
      noDues.batch || "",
      qrCodeDataUrl
    );

    // Save PDF to uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads", "certificates");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfPath = path.join(uploadsDir, `${certificateId}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Create certificate record
    const certificate = await Certificate.create({
      certificateId,
      studentId: noDues.studentId,
      noDuesId: noDues._id,
      studentName: noDues.studentName,
      enrollmentNo: noDues.enrollmentNo,
      program: noDues.program,
      batch: noDues.batch,
      generatedAt: new Date(),
      generatedBy: req.user?.userId,
      pdfPath: `/uploads/certificates/${certificateId}.pdf`,
      qrCodeData: qrData,
    });

    // Update No-Dues
    noDues.certificateId = certificate._id;
    noDues.certificateGeneratedAt = new Date();
    noDues.status = "CERTIFICATE_GENERATED";
    await noDues.save();

    // Log action
    await logAction(req, {
      action: "CERTIFICATE_GENERATE",
      targetType: "certificate",
      targetId: certificate._id.toString(),
      details: { noDuesId, certificateId },
    });

    res.json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate,
    });
  }
);

/**
 * Public: Verify certificate
 */
export const verifyCertificate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId }).lean();

    if (!certificate) {
      throw new ApiError(404, "NOT_FOUND", "Certificate not found");
    }

    if (!certificate.isValid) {
      return res.json({
        success: false,
        message: "Certificate has been revoked",
        data: { isValid: false, revokedAt: certificate.revokedAt },
      });
    }

    // Increment download count
    await Certificate.updateOne(
      { _id: certificate._id },
      {
        $inc: { downloadCount: 1 },
        lastDownloadedAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Certificate is valid",
      data: {
        ...certificate,
        isValid: true,
      },
    });
  }
);

/**
 * Admin: Get all students
 */
export const getAllStudents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, search } = req.query;

    const query: any = { role: "student" };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { enrollmentNo: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

/**
 * Admin: Get audit logs
 */
export const getAuditLogs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { action, page = 1, limit = 50 } = req.query;

    const query: any = {};
    if (action) query.action = action;

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

/**
 * Admin: Get dashboard stats
 */
export const getDashboardStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const [
      totalStudents,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      certificatesGenerated,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      NoDues.countDocuments(),
      NoDues.countDocuments({ status: "VERIFIED" }),
      NoDues.countDocuments({ status: "APPROVED" }),
      NoDues.countDocuments({ status: "REJECTED" }),
      Certificate.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        certificatesGenerated,
      },
    });
  }
);

/**
 * Admin: Manage departments - Create
 */
export const createDepartment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, code, description, requirements } = req.body;

    if (!name || !code) {
      throw new ApiError(400, "MISSING_FIELDS", "Name and code are required");
    }

    // Check if already exists
    const existing = await Department.findOne({
      $or: [{ name }, { code }],
    });

    if (existing) {
      throw new ApiError(409, "DUPLICATE", "Department name or code already exists");
    }

    const department = await Department.create({
      name,
      code,
      description,
      requirements: requirements || [],
    });

    // Log action
    await logAction(req, {
      action: "DEPARTMENT_CREATE",
      targetType: "department",
      targetId: department._id.toString(),
      details: { name, code },
    });

    res.status(201).json({
      success: true,
      message: "Department created",
      data: department,
    });
  }
);

/**
 * Admin: Get all departments
 */
export const getAllDepartments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const departments = await Department.find().sort({ name: 1 }).lean();

    res.json({
      success: true,
      data: departments,
    });
  }
);
