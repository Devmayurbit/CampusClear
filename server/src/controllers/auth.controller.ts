import { Request, Response } from "express";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { Student } from "../models/Student";
import { Faculty } from "../models/Faculty";
import { Admin } from "../models/Admin";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { passwordResetEmailTemplate, sendEmail } from "../utils/email";
import { ApiError } from "../middleware/errorHandler";
import { logAudit } from "../services/audit.service";
import { env } from "../config/env";
import { normalizeRole, Role } from "../utils/roles";

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

async function findUserByEmail(email: string) {
  return (
    (await Student.findOne({ email })) ||
    (await Faculty.findOne({ email })) ||
    (await Admin.findOne({ email }))
  );
}

function sanitizeUser(user: any) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: normalizeRole(user.role) || user.role,
    enrollmentNo: user.enrollmentNo,
    department: user.department,
  };
}

export async function registerStudent(req: Request, res: Response) {
  const { fullName, enrollmentNo, email, password, program, batch } = req.body;

  if (!fullName || !enrollmentNo || !email || !password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Missing required fields");
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await Student.findOne({ $or: [{ email: normalizedEmail }, { enrollmentNo }] });
  if (existing) {
    throw new ApiError(409, "DUPLICATE", "Student already exists");
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const student = await Student.create({
    fullName,
    enrollmentNo,
    email: normalizedEmail,
    passwordHash,
    program,
    batch,
    role: Role.STUDENT,
    authProvider: "LOCAL",
    isActive: true,
    verificationToken,
    verified: false,
  });

  // Send verification email
  const verificationLink = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
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
    actorRole: Role.STUDENT,
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

  const normalizedEmail = email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !("passwordHash" in user)) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  // Check if student email is verified
  if (normalizeRole((user as any).role) === Role.STUDENT && !(user as any).verified) {
    throw new ApiError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first");
  }

  if (!(user as any).passwordHash) {
    throw new ApiError(400, "GOOGLE_ACCOUNT", "Use Google Sign-in for this account");
  }

  const isMatch = await comparePassword(password, (user as any).passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const role = normalizeRole((user as any).role);
  if (!role) {
    throw new ApiError(500, "ROLE_INVALID", "Invalid role configuration");
  }
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
      user: sanitizeUser(user),
    },
  });
}

export async function createStaff(req: Request, res: Response) {
  const { fullName, email, role, department, password } = req.body;
  const adminId = (req as any).user.userId;

  if (!fullName || !email || !role || !password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Missing required fields");
  }

  const normalizedRole = normalizeRole(role);
  if (!normalizedRole || normalizedRole === Role.STUDENT) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid role");
  }

  if (normalizedRole === Role.FACULTY) {
    if (!department) throw new ApiError(400, "VALIDATION_ERROR", "Department required");
    const existing = await Faculty.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, "DUPLICATE", "Faculty already exists");

    const passwordHash = await hashPassword(password);
    const faculty = await Faculty.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      department,
      role: Role.FACULTY,
      authProvider: "LOCAL",
      isActive: true,
    });

    await logAudit({
      actorId: adminId,
      actorRole: Role.ADMIN,
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

  if (normalizedRole === Role.ADMIN) {
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, "DUPLICATE", "Admin already exists");

    const passwordHash = await hashPassword(password);
    const admin = await Admin.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: Role.ADMIN,
      authProvider: "LOCAL",
      isActive: true,
    });

    await logAudit({
      actorId: adminId,
      actorRole: Role.ADMIN,
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

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "VALIDATION_ERROR", "Email is required");
  }

  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    return res.json({
      success: true,
      message: "If the account exists, a reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  (user as any).passwordResetToken = resetTokenHash;
  (user as any).passwordResetExpires = new Date(
    Date.now() + env.passwordResetExpiresMinutes * 60 * 1000
  );
  await user.save();

  const resetLink = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - CDGI No-Dues Portal",
      html: passwordResetEmailTemplate(user.fullName || "User", resetLink),
    });
  } catch (error) {
    console.error("Password reset email failed:", error);
  }

  return res.json({
    success: true,
    message: "If the account exists, a reset link has been sent.",
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "VALIDATION_ERROR", "Token and new password required");
  }

  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user =
    (await Student.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() },
    })) ||
    (await Faculty.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() },
    })) ||
    (await Admin.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() },
    }));

  if (!user) {
    throw new ApiError(400, "INVALID_TOKEN", "Invalid or expired token");
  }

  (user as any).passwordHash = await hashPassword(newPassword);
  (user as any).passwordResetToken = undefined;
  (user as any).passwordResetExpires = undefined;
  (user as any).authProvider = "LOCAL";
  await user.save();

  const resetRole = normalizeRole((user as any).role);
  if (!resetRole) {
    throw new ApiError(500, "ROLE_INVALID", "Invalid role configuration");
  }

  await logAudit({
    actorId: user._id.toString(),
    actorRole: resetRole,
    action: "RESET_PASSWORD",
    targetType: user.constructor.name,
    targetId: user._id.toString(),
  });

  res.json({
    success: true,
    message: "Password reset successful",
  });
}

export async function googleSignIn(req: Request, res: Response) {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "VALIDATION_ERROR", "Google ID token is required");
  }

  if (!googleClient) {
    throw new ApiError(500, "CONFIG_ERROR", "Google Sign-in is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.sub) {
    throw new ApiError(400, "INVALID_GOOGLE_TOKEN", "Invalid Google token");
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const fullName = payload.name || "Student";

  let user = await findUserByEmail(email);

  if (!user) {
    const enrollmentNo = `G-${googleId.slice(0, 8)}-${crypto.randomBytes(3).toString("hex")}`;
    user = await Student.create({
      fullName,
      enrollmentNo,
      email,
      role: Role.STUDENT,
      authProvider: "GOOGLE",
      googleId,
      verified: true,
      isActive: true,
    });
  } else {
    (user as any).googleId = (user as any).googleId || googleId;
    (user as any).authProvider = "GOOGLE";
    if (normalizeRole((user as any).role) === Role.STUDENT) {
      (user as any).verified = true;
    }
    await user.save();
  }

  const role = normalizeRole((user as any).role);
  if (!role) {
    throw new ApiError(500, "ROLE_INVALID", "Invalid role configuration");
  }
  const token = signToken({ userId: user._id.toString(), role, email: user.email });

  await logAudit({
    actorId: user._id.toString(),
    actorRole: role,
    action: "GOOGLE_LOGIN",
    targetType: user.constructor.name,
    targetId: user._id.toString(),
  });

  res.json({
    success: true,
    message: "Google sign-in successful",
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
}
