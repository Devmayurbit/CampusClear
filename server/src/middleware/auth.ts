import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { normalizeRole, UserRole } from "../utils/roles";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    const normalizedRole = normalizeRole(payload.role);
    if (!normalizedRole) {
      return res.status(403).json({ success: false, message: "Invalid token role" });
    }
    req.user = { ...payload, role: normalizedRole };
    return next();
  } catch {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}

export function authorizeRole(...roles: Array<UserRole>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const normalizedRole = normalizeRole(req.user.role);
    if (!normalizedRole || !roles.includes(normalizedRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return next();
  };
}
