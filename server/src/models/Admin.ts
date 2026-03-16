import mongoose, { Schema, Document } from "mongoose";

export interface AdminDoc extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: "ADMIN";
  authProvider: "LOCAL" | "GOOGLE";
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  createdAt: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "ADMIN" },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    googleId: { type: String, index: true, sparse: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<AdminDoc>("Admin", AdminSchema);
