import { Request, Response } from "express";
import crypto from "crypto";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { Admin } from "../models/Admin";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";

export async function registerStudent(req: Request, res: Response) {
  const { fullName, enrollmentNo, email, password, program, batch } = req.body;

  if (!fullName || !enrollmentNo || !email || !password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Missing required fields");
  }

  const existing = await Student.findOne({ $or: [{ email }, { enrollmentNo }] });
  if (existing) {
    throw new ApiError(409, "DUPLICATE", "Student already exists");
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const student = await Student.create({
    fullName,
    enrollmentNo,
    email: email.toLowerCase(),
    passwordHash,
    program,
    batch,
    role: "student",
    isActive: true,
    verificationToken,
    verified: false,
  });

  // Send verification email
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  try {
    await sendEmail({
      to: email,
      subject: "Verify Your Email - CDGI No-Dues Portal",
      html: `
        <h1>Welcome to CDGI No-Dues Portal</h1>
        <p>Hi ${fullName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }

  res.status(201).json({
    success: true,
    message: "Student registered. Please check your email to verify.",
    data: { id: student._id },
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "VALIDATION_ERROR", "Verification token required");
  }

  const student = await Student.findOne({ verificationToken: token });
  if (!student) {
    throw new ApiError(400, "INVALID_TOKEN", "Invalid or expired token");
  }

  student.verified = true;
  student.verificationToken = undefined;
  await student.save();

  await logAudit({
    actorId: student._id.toString(),
    actorRole: "student",
    action: "EMAIL_VERIFIED",
    targetType: "Student",
    targetId: student._id.toString(),
  });

  res.json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Email and password required");
  }

  const user =
    (await Student.findOne({ email: email.toLowerCase() })) ||
    (await Faculty.findOne({ email: email.toLowerCase() })) ||
    (await Admin.findOne({ email: email.toLowerCase() }));

  if (!user || !("passwordHash" in user)) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  // Check if student email is verified
  if ((user as any).role === "student" && !(user as any).verified) {
    throw new ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first");
  }

  const isMatch = await comparePassword(password, (user as any).passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const role = (user as any).role;
  const token = signToken({ userId: user._id.toString(), role, email: user.email });

  await logAudit({
    actorId: user._id.toString(),
    actorRole: role,
    action: "LOGIN",
    targetType: user.constructor.name,
    targetId: user._id.toString(),
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        fullName: (user as any).fullName,
        email: user.email,
        role,
        enrollmentNo: (user as any).enrollmentNo,
        department: (user as any).department,
      },
    },
  });
}

export async function createStaff(req: Request, res: Response) {
  const { fullName, email, role, department, password } = req.body;
  const adminId = (req as any).user.userId;

  if (!fullName || !email || !role || !password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Missing required fields");
  }

  if (role === "faculty") {
    if (!department) throw new ApiError(400, "VALIDATION_ERROR", "Department required");
    const existing = await Faculty.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, "DUPLICATE", "Faculty already exists");

    const passwordHash = await hashPassword(password);
    const faculty = await Faculty.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      department,
      role: "faculty",
      isActive: true,
    });

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "CREATE_FACULTY",
      targetType: "Faculty",
      targetId: faculty._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: "Faculty created",
      data: { id: faculty._id },
    });
  }

  if (role === "admin") {
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, "DUPLICATE", "Admin already exists");

    const passwordHash = await hashPassword(password);
    const admin = await Admin.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: "admin",
      isActive: true,
    });

    await logAudit({
      actorId: adminId,
      actorRole: "admin",
      action: "CREATE_ADMIN",
      targetType: "Admin",
      targetId: admin._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: "Admin created",
      data: { id: admin._id },
    });
  }

  throw new ApiError(400, "VALIDATION_ERROR", "Invalid role");
}
