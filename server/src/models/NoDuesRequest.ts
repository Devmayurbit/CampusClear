import mongoose, { Schema, Document } from "mongoose";

const ClearanceSchema = new Schema(
  {
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    remarks: { type: String, default: "" },
    updatedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { _id: false }
);

export interface NoDuesRequestDoc extends Document {
  studentId: mongoose.Types.ObjectId;
  overallStatus: "PENDING" | "APPROVED" | "REJECTED";
  libraryClearance: any;
  accountClearance: any;
  hostelClearance: any;
  departmentClearance: any;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoDuesRequestSchema = new Schema<NoDuesRequestDoc>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Student", index: true },
    libraryClearance: { type: ClearanceSchema, default: {} },
    accountClearance: { type: ClearanceSchema, default: {} },
    hostelClearance: { type: ClearanceSchema, default: {} },
    departmentClearance: { type: ClearanceSchema, default: {} },
    remarks: { type: String, default: "" },
    overallStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export const NoDuesRequest = mongoose.model<NoDuesRequestDoc>("NoDuesRequest", NoDuesRequestSchema);
