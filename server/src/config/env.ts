import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || process.env.MONGO_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  passwordResetExpiresMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 60),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailSecure: process.env.EMAIL_SECURE === "true",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  emailFrom: process.env.EMAIL_FROM || "CDGI No-Dues <no-reply@cdgi.edu>",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
  superAdminMasterKey: process.env.SUPER_ADMIN_MASTER_KEY || "",
  facultyInviteCode: process.env.FACULTY_INVITE_CODE || "",
  adminAccessCode: process.env.ADMIN_ACCESS_CODE || "",

  // Rate limiting
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),

  // Account lockout
  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS || 5),
  lockoutDurationMinutes: Number(process.env.LOCKOUT_DURATION_MINUTES || 30),
};

// Startup validations
if (!env.mongoUri) {
  console.error("FATAL: MONGO_URI / MONGO_URL not set. Database connection will fail.");
}

if (!env.jwtSecret || env.jwtSecret.length < 16) {
  if (env.nodeEnv === "production") {
    throw new Error("FATAL: JWT_SECRET must be set and at least 16 characters in production.");
  }
  // In development, use a default but warn
  (env as any).jwtSecret = "dev-only-secret-change-in-production";
  console.warn("WARNING: JWT_SECRET not properly configured. Using dev default. Set JWT_SECRET in .env for production!");
}

if (!env.superAdminMasterKey && env.nodeEnv === "production") {
  console.warn("WARNING: SUPER_ADMIN_MASTER_KEY not set. Staff registration will be disabled.");
}
