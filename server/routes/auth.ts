import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Department from "../models/Department";
import { 
  generateToken, 
  generateRefreshToken, 
  verifyToken, 
  authenticateToken,
  requireRole,
  type AuthenticatedRequest,
} from "../middleware/auth";
import { logAction } from "../middleware/audit";
import { ApiError, asyncHandler } from "../middleware/errorHandler";
import { sendVerificationEmail, sendPasswordResetEmail } from "../mailer";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Register new user (Student, Faculty, or Admin)
 * Public endpoint for students, requires admin for faculty/admin creation
 */
export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role,
      // Student fields
      enrollmentNo,
      program,
      batch,
      // Faculty fields
      departmentId,
      facultyId,
      designation,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      throw new ApiError(400, "MISSING_FIELDS", "Please fill all required fields");
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, "PASSWORD_MISMATCH", "Passwords do not match");
    }

    if (password.length < 8) {
      throw new ApiError(
        400,
        "WEAK_PASSWORD",
        "Password must be at least 8 characters"
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "INVALID_EMAIL", "Invalid email format");
    }

    // Role validation
    let userRole: "student" | "faculty" | "admin" = role || "student";
    
    // Only admins can create faculty/admin accounts
    if (userRole !== "student" && (!req.user || req.user.role !== "admin")) {
      // Allow creating the very first admin if none exists yet
      if (userRole === "admin") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount === 0) {
          // Bootstrap first admin
        } else {
          throw new ApiError(
            403,
            "FORBIDDEN",
            "Only admins can create faculty/admin accounts"
          );
        }
      } else {
        throw new ApiError(
          403,
          "FORBIDDEN",
          "Only admins can create faculty/admin accounts"
        );
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, "EMAIL_EXISTS", "Email already registered");
    }

    // Check enrollment number for students
    if (userRole === "student" && !enrollmentNo) {
      throw new ApiError(400, "MISSING_FIELDS", "Enrollment number required for students");
    }

    if (enrollmentNo) {
      const existingStudent = await User.findOne({ enrollmentNo });
      if (existingStudent) {
        throw new ApiError(409, "ENROLLMENT_EXISTS", "Enrollment number already registered");
      }
    }

    // Validate department for faculty
    if (userRole === "faculty" && departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) {
        throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Invalid department");
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      enrollmentNo: userRole === "student" ? enrollmentNo : undefined,
      program: userRole === "student" ? program : undefined,
      batch: userRole === "student" ? batch : undefined,
      departmentId: userRole === "faculty" ? departmentId : undefined,
      facultyId: userRole === "faculty" ? facultyId : undefined,
      designation: userRole === "faculty" ? designation : undefined,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Send verification email
    const verifyLink = `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/auth/verify/${verificationToken}`;
    try {
      await sendVerificationEmail(email, verifyLink, `${firstName} ${lastName}`);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail registration if email fails
    }

    // Log action
    await logAction(req, {
      action: "REGISTER",
      targetType: "user",
      targetId: newUser._id.toString(),
      targetName: `${firstName} ${lastName}`,
      details: { role: userRole, email },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  }
);

/**
 * Verify email address
 */
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      throw new ApiError(400, "MISSING_TOKEN", "Verification token required");
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(
        400,
        "INVALID_TOKEN",
        "Invalid or expired verification token"
      );
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  }
);

/**
 * Login - works for all 3 roles
 */
export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "MISSING_CREDENTIALS", "Email and password required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    // Check if verified
    if (!user.isVerified && user.role === "student") {
      throw new ApiError(
        403,
        "EMAIL_NOT_VERIFIED",
        "Please verify your email first"
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ApiError(403, "ACCOUNT_DISABLED", "Your account has been disabled");
    }

    // Generate tokens
    const accessToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user._id.toString());

    // Update last login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.ipAddressLastLogin = req.ip;
    await user.save();

    // Prepare response data
    const responseData: any = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    if (user.role === "student") {
      responseData.enrollmentNo = user.enrollmentNo;
      responseData.program = user.program;
      responseData.batch = user.batch;
    } else if (user.role === "faculty") {
      responseData.departmentId = user.departmentId;
      responseData.designation = user.designation;
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: responseData,
        accessToken,
        refreshToken,
      },
    });
  }
);

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new ApiError(400, "MISSING_TOKEN", "Refresh token required");
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const user = await User.findById(payload.userId);
      if (!user) {
        throw new ApiError(404, "USER_NOT_FOUND", "User not found");
      }

      const newAccessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        data: { accessToken: newAccessToken },
      });
    } catch (error) {
      throw new ApiError(401, "INVALID_TOKEN", "Invalid refresh token");
    }
  }
);

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?.userId).select("-passwordHash");

    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    res.json({
      success: true,
      data: user,
    });
  }
);

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      gender,
      // Student fields
      semester,
      cgpa,
      credits,
      expectedGraduation,
      // Emergency contact
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      emergencyContactEmail,
    } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    // Store original for audit
    const originalData = user.toObject();

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;

    // Student-specific
    if (user.role === "student") {
      if (semester !== undefined) user.semester = semester;
      if (cgpa !== undefined) user.cgpa = cgpa;
      if (credits !== undefined) user.credits = credits;
      if (expectedGraduation) user.expectedGraduation = new Date(expectedGraduation);
      if (emergencyContactName) user.emergencyContactName = emergencyContactName;
      if (emergencyContactRelation) user.emergencyContactRelation = emergencyContactRelation;
      if (emergencyContactPhone) user.emergencyContactPhone = emergencyContactPhone;
      if (emergencyContactEmail) user.emergencyContactEmail = emergencyContactEmail;
    }

    await user.save();

    // Log action
    await logAction(req, {
      action: "PROFILE_UPDATE",
      targetType: "user",
      targetId: user._id.toString(),
      changes: { original: originalData, updated: user.toObject() },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  }
);

/**
 * Request password reset
 */
export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "MISSING_EMAIL", "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.json({
        success: true,
        message: "If email exists, password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    try {
      await sendPasswordResetEmail(user.email, resetLink, user.firstName);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }

    res.json({
      success: true,
      message: "If email exists, password reset link has been sent",
    });
  }
);

/**
 * Reset password with token
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      throw new ApiError(400, "MISSING_FIELDS", "Password fields required");
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, "PASSWORD_MISMATCH", "Passwords do not match");
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, "INVALID_TOKEN", "Invalid or expired reset token");
    }

    // Update password
    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  }
);

/**
 * Change password (authenticated users)
 */
export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ApiError(400, "MISSING_FIELDS", "All password fields required");
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ApiError(400, "INVALID_PASSWORD", "Current password is incorrect");
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "PASSWORD_MISMATCH", "New passwords do not match");
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.lastPasswordChange = new Date();
    await user.save();

    // Log action
    await logAction(req, {
      action: "PASSWORD_CHANGE",
      targetType: "user",
      targetId: user._id.toString(),
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

/**
 * Logout (mainly for audit logging)
 */
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Log action
    await logAction(req, {
      action: "LOGOUT",
      targetType: "user",
      targetId: req.user?.userId,
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
);
