import mongoose, { Schema, Document } from "mongoose";

export type DepartmentType = "LIBRARY" | "ACCOUNTS" | "HOSTEL" | "LAB" | "TP" | "SPORTS";

export interface FacultyDoc extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  department: DepartmentType;
  role: "FACULTY";
  authProvider: "LOCAL" | "GOOGLE";
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  createdAt: Date;
}

const FacultySchema = new Schema<FacultyDoc>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    department: {
      type: String,
      enum: ["LIBRARY", "ACCOUNTS", "HOSTEL", "LAB", "TP", "SPORTS"],
      required: true,
    },
    role: { type: String, default: "FACULTY" },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    googleId: { type: String, index: true, sparse: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Faculty = mongoose.model<FacultyDoc>("Faculty", FacultySchema);
