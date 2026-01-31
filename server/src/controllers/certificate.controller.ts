import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Certificate } from "../models/Certificate";
import { Student } from "../models/Student";
import { sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";

function generateCertificateId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ND-${timestamp}-${random}`;
}

export async function generateCertificate(req: Request, res: Response) {
  const adminId = (req as any).user.userId;
  const { requestId } = req.params;

  const request = await NoDuesRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "Request not found");
  }

  if (request.overallStatus !== "APPROVED") {
    throw new ApiError(400, "NOT_APPROVED", "Request must be approved first");
  }

  // Check if certificate already exists
  const existing = await Certificate.findOne({ noDuesRequestId: requestId });
  if (existing) {
    return res.json({
      success: true,
      message: "Certificate already generated",
      data: existing,
    });
  }

  const certificateId = generateCertificateId();

  const certificate = await Certificate.create({
    certificateId,
    studentId: request.studentId,
    noDuesRequestId: requestId,
    issuedAt: new Date(),
    issuedBy: adminId,
    pdfPath: "/certificates/" + certificateId + ".pdf", // Placeholder
  });

  // Send certificate email
  const student = await Student.findById(request.studentId);
  if (student) {
    try {
      await sendEmail({
        to: student.email,
        subject: "Your No-Dues Certificate - CDGI Portal",
        html: `
          <h1>No-Dues Certificate Generated</h1>
          <p>Hi ${student.fullName},</p>
          <p>Your No-Dues certificate has been generated.</p>
          <p><strong>Certificate ID:</strong> ${certificateId}</p>
          <p><strong>Enrollment No:</strong> ${student.enrollmentNo}</p>
          <p>You can download your certificate from the portal or use the ID above to verify it.</p>
        `,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }

  await logAudit({
    actorId: adminId,
    actorRole: "admin",
    action: "GENERATE_CERTIFICATE",
    targetType: "Certificate",
    targetId: certificate._id.toString(),
  });

  res.status(201).json({
    success: true,
    message: "Certificate generated",
    data: certificate,
  });
}

export async function verifyCertificate(req: Request, res: Response) {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({ certificateId })
    .populate("studentId", "fullName enrollmentNo email program batch")
    .populate("issuedBy", "fullName email")
    .lean();

  if (!certificate) {
    throw new ApiError(404, "NOT_FOUND", "Certificate not found");
  }

  res.json({
    success: true,
    data: {
      ...certificate,
      verified: true,
      isValid: true,
    },
  });
}

export async function getStudentCertificates(req: Request, res: Response) {
  const studentId = (req as any).user.userId;

  const certificates = await Certificate.find({ studentId }).lean();

  res.json({
    success: true,
    data: certificates,
    total: certificates.length,
  });
}

export async function listCertificates(req: Request, res: Response) {
  const { page = 1, limit = 20 } = req.query;

  const certificates = await Certificate.find()
    .populate("studentId", "fullName enrollmentNo email")
    .sort({ issuedAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Certificate.countDocuments();

  res.json({
    success: true,
    data: certificates,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
}

export async function downloadCertificate(req: Request, res: Response) {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({ certificateId });
  if (!certificate) {
    throw new ApiError(404, "NOT_FOUND", "Certificate not found");
  }

  // In production, generate PDF here
  // For now, return certificate data
  res.json({
    success: true,
    message: "Certificate ready for download",
    data: certificate,
  });
}
