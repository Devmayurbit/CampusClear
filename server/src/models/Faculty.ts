import mongoose, { Schema, Document } from "mongoose";

export type DepartmentType = "LIBRARY" | "ACCOUNTS" | "HOSTEL" | "LAB" | "TP" | "SPORTS";

export interface FacultyDoc extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  department: DepartmentType;
  role: "faculty";
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
    role: { type: String, default: "faculty" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Faculty = mongoose.model<FacultyDoc>("Faculty", FacultySchema);
