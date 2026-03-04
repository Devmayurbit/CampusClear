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
  labClearance: any;
  tpClearance: any;
  sportsClearance: any;
  accountClearance: any;
  hostelClearance: any;
  departmentClearance: any;
  feeStatus: "UNPAID" | "PAID" | "WAIVED";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoDuesRequestSchema = new Schema<NoDuesRequestDoc>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Student", index: true },
    libraryClearance: { type: ClearanceSchema, default: {} },
    labClearance: { type: ClearanceSchema, default: {} },
    tpClearance: { type: ClearanceSchema, default: {} },
    sportsClearance: { type: ClearanceSchema, default: {} },
    accountClearance: { type: ClearanceSchema, default: {} },
    hostelClearance: { type: ClearanceSchema, default: {} },
    departmentClearance: { type: ClearanceSchema, default: {} },
    feeStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "WAIVED"],
      default: "UNPAID",
    },
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
