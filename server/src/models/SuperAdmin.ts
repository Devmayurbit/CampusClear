import mongoose, { Schema, Document } from "mongoose";

export interface SuperAdminDoc extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  role: "SUPER_ADMIN";
  authProvider: "LOCAL" | "GOOGLE";
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokenHash?: string;
  isActive: boolean;
  createdAt: Date;
}

const SuperAdminSchema = new Schema<SuperAdminDoc>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    employeeId: { type: String, index: true, sparse: true },
    department: { type: String },
    designation: { type: String },
    role: { type: String, default: "SUPER_ADMIN" },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    googleId: { type: String, index: true, sparse: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshTokenHash: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SuperAdmin = mongoose.model<SuperAdminDoc>("SuperAdmin", SuperAdminSchema);
