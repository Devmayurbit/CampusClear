import mongoose, { Schema, Document } from "mongoose";

export interface StudentDoc extends Document {
  fullName: string;
  enrollmentNo: string;
  email: string;
  passwordHash: string;
  program?: string;
  batch?: string;
  role: "student";
  isActive: boolean;
  verified?: boolean;
  verificationToken?: string;
  createdAt: Date;
}

const StudentSchema = new Schema<StudentDoc>(
  {
    fullName: { type: String, required: true },
    enrollmentNo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    program: { type: String },
    batch: { type: String },
    role: { type: String, default: "student" },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  { timestamps: true }
);

export const Student = mongoose.model<StudentDoc>("Student", StudentSchema);
