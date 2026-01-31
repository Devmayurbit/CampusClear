import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthPayload {
  userId: string;
  email: string;
  role: "student" | "faculty" | "admin";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "24h";
const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<AuthPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // "Bearer ".length = 7
}

/**
 * Middleware: Verify JWT token
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
      code: "NO_TOKEN",
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }

  req.user = payload;
  next();
}

/**
 * Middleware: Optional JWT token
 * Attaches req.user if token is present and valid, otherwise continues.
 */
export function optionalAuthenticateToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (payload) {
    req.user = payload;
  }

  next();
}

/**
 * Middleware: Check specific role(s)
 */
export function requireRole(...roles: ("student" | "faculty" | "admin")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NOT_AUTHENTICATED",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
        code: "INSUFFICIENT_PERMISSION",
      });
    }

    next();
  };
}

/**
 * Middleware: Admin only
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
      code: "ADMIN_ONLY",
    });
  }
  next();
}

/**
 * Middleware: Faculty or Admin
 */
export function requireFacultyOrAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !["faculty", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Faculty or Admin access required",
      code: "FACULTY_OR_ADMIN_ONLY",
    });
  }
  next();
}
