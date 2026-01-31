import mongoose, { Schema, Document } from "mongoose";

export interface AdminDoc extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: "admin";
  isActive: boolean;
  createdAt: Date;
}

const AdminSchema = new Schema<AdminDoc>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<AdminDoc>("Admin", AdminSchema);
