import { Request, Response } from "express";
import { NoDuesRequest } from "../models/NoDuesRequest";
import { Certificate } from "../models/Certificate";
import { Student } from "../models/Student";
import { sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { Role } from "../utils/roles";
import { generateCertificatePDF, validateCertificateData } from "../services/pdf.service";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CDGI-${year}-${timestamp}-${random}`;
}

export async function generateCertificate(req: Request, res: Response) {
  const adminId = (req as any).user.userId;
  const { requestId } = req.params;

  console.log("📜 Generating certificate for request:", requestId);

  const request = await NoDuesRequest.findById(requestId).populate("studentId");
  if (!request) {
    throw new ApiError(404, "NOT_FOUND", "No-Dues request not found");
  }

  if (request.overallStatus !== "APPROVED") {
    throw new ApiError(400, "NOT_APPROVED", "Request must be fully approved before certificate generation");
  }

  // Check if certificate already exists
  const existing = await Certificate.findOne({ noDuesRequestId: requestId });
  if (existing) {
    console.log("ℹ️ Certificate already exists:", existing.certificateId);
    return res.json({
      success: true,
      message: "Certificate already generated",
      data: existing,
    });
  }

  const student = request.studentId as any;
  if (!student) {
    throw new ApiError(404, "NOT_FOUND", "Student data not found");
  }

  // Generate certificate ID
  const certificateId = generateCertificateId();
  console.log("✅ Generated certificate ID:", certificateId);

  // Prepare certificate data
  const certificateData = {
    certificateId,
    studentName: student.fullName || "Unknown",
    enrollmentNo: student.enrollmentNo || "N/A",
    program: student.program || "N/A",
    batch: student.batch || "N/A",
    issuedDate: new Date(),
  };

  // Validate data
  if (!validateCertificateData(certificateData)) {
    throw new ApiError(400, "INVALID_DATA", "Incomplete certificate data");
  }

  // Generate PDF
  console.log("📄 Generating PDF...");
  const pdfBuffer = await generateCertificatePDF(certificateData);
  console.log("✅ PDF generated, size:", pdfBuffer.length, "bytes");

  // Save PDF to disk
  const uploadDir = path.join(process.cwd(), env.uploadDir, "certificates");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const pdfFilename = `${certificateId}.pdf`;
  const pdfPath = path.join(uploadDir, pdfFilename);
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log("✅ PDF saved to:", pdfPath);

  // Create certificate record
  const certificate = await Certificate.create({
    certificateId,
    studentId: request.studentId,
    noDuesRequestId: requestId,
    issuedAt: new Date(),
    issuedBy: adminId,
    pdfPath: `/uploads/certificates/${pdfFilename}`,
  });

  console.log("✅ Certificate record created:", certificate._id);

  // Send email notification
  try {
    await sendEmail({
      to: student.email,
      subject: "Your No-Dues Certificate - CDGI Portal",
      html: `
        <h1>No-Dues Certificate Generated</h1>
        <p>Dear ${student.fullName},</p>
        <p>Congratulations! Your No-Dues certificate has been generated successfully.</p>
        <p><strong>Certificate ID:</strong> ${certificateId}</p>
        <p><strong>Enrollment No:</strong> ${student.enrollmentNo}</p>
        <p>You can download your certificate from the student portal.</p>
        <p>Thank you,<br>CDGI Administration</p>
      `,
    });
    console.log("✅ Email sent to:", student.email);
  } catch (error) {
    console.error("⚠️ Email sending failed:", error);
  }

  // Log audit trail
  await logAudit({
    actorId: adminId,
    actorRole: Role.ADMIN,
    action: "GENERATE_CERTIFICATE",
    targetType: "Certificate",
    targetId: certificate._id.toString(),
  });

  res.status(201).json({
    success: true,
    message: "Certificate generated successfully",
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

  console.log("📥 Certificate download requested:", certificateId);

  const certificate = await Certificate.findOne({ certificateId });
  if (!certificate) {
    throw new ApiError(404, "NOT_FOUND", "Certificate not found");
  }

  // Get PDF path
  const pdfPath = path.join(
    process.cwd(),
    env.uploadDir,
    "certificates",
    `${certificateId}.pdf`
  );

  if (!fs.existsSync(pdfPath)) {
    console.error("❌ PDF file not found:", pdfPath);
    throw new ApiError(404, "FILE_NOT_FOUND", "Certificate PDF not found");
  }

  console.log("✅ Sending PDF file:", pdfPath);

  // Set headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${certificateId}.pdf"`);

  // Stream the file
  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);
}
