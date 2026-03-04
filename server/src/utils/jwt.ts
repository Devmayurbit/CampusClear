import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "./roles";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface RefreshJwtPayload {
  userId: string;
  role: UserRole;
  email: string;
  type: "refresh";
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export function signRefreshToken(payload: Omit<RefreshJwtPayload, "type">) {
  return jwt.sign({ ...payload, type: "refresh" }, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiresIn,
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.refreshTokenSecret) as RefreshJwtPayload;
}
