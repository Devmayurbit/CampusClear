import mongoose, { Schema, Document } from "mongoose";

export interface CertificateDoc extends Document {
  certificateId: string;
  studentId: mongoose.Types.ObjectId;
  noDuesRequestId: mongoose.Types.ObjectId;
  issuedAt: Date;
  pdfPath?: string;
  issuedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<CertificateDoc>(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Student", index: true },
    noDuesRequestId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "NoDuesRequest", unique: true },
    issuedAt: { type: Date, default: Date.now },
    pdfPath: { type: String },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Admin" },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model<CertificateDoc>("Certificate", CertificateSchema);
