import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || process.env.MONGO_URL || "",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  passwordResetExpiresMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 60),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailSecure: process.env.EMAIL_SECURE === "true",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  emailFrom: process.env.EMAIL_FROM || "CDGI No-Dues <no-reply@cdgi.edu>",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
};

if (!env.mongoUri) {
  console.warn("⚠️  MONGO_URI not set. Database connection will fail.");
}

if (!env.jwtSecret || env.jwtSecret === "change_this_secret") {
  console.warn("⚠️  JWT_SECRET not properly configured. Change this in production!");
}
