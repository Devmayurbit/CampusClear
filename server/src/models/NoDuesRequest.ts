import mongoose, { Schema, Document } from "mongoose";

const DepartmentStatusSchema = new Schema(
  {
    status: { type: String, enum: ["PENDING", "CLEARED", "HOLD"], default: "PENDING" },
    remarks: { type: String, default: "" },
    updatedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  },
  { _id: false }
);

export interface NoDuesRequestDoc extends Document {
  studentId: mongoose.Types.ObjectId;
  reason?: string;
  departments: {
    library: any;
    accounts: any;
    hostel: any;
    lab: any;
    tp: any;
    sports: any;
  };
  verificationToken?: string;
  verified: boolean;
  overallStatus: "PENDING" | "APPROVED" | "REJECTED" | "HOLD";
  createdAt: Date;
  updatedAt: Date;
}

const NoDuesRequestSchema = new Schema<NoDuesRequestDoc>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Student", index: true },
    reason: { type: String },
    departments: {
      library: { type: DepartmentStatusSchema, default: {} },
      accounts: { type: DepartmentStatusSchema, default: {} },
      hostel: { type: DepartmentStatusSchema, default: {} },
      lab: { type: DepartmentStatusSchema, default: {} },
      tp: { type: DepartmentStatusSchema, default: {} },
      sports: { type: DepartmentStatusSchema, default: {} },
    },
    verificationToken: { type: String, sparse: true },
    verified: { type: Boolean, default: false, index: true },
    overallStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "HOLD"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export const NoDuesRequest = mongoose.model<NoDuesRequestDoc>("NoDuesRequest", NoDuesRequestSchema);
