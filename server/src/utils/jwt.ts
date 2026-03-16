import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "./roles";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
