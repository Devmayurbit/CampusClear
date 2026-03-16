import mongoose, { Schema, Document } from "mongoose";

export interface StudentDoc extends Document {
  fullName: string;
  enrollmentNo?: string;
  email: string;
  passwordHash?: string;
  program?: string;
  batch?: string;
  role: "STUDENT";
  authProvider: "LOCAL" | "GOOGLE";
  googleId?: string;
  isActive: boolean;
  verified?: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
}

const StudentSchema = new Schema<StudentDoc>(
  {
    fullName: { type: String, required: true },
    enrollmentNo: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    program: { type: String },
    batch: { type: String },
    role: { type: String, default: "STUDENT" },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    googleId: { type: String, index: true, sparse: true },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

export const Student = mongoose.model<StudentDoc>("Student", StudentSchema);
