import mongoose from "mongoose";

const NoDuesSchema = new mongoose.Schema(
  {
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "User",
      index: true 
    },
    
    // Student Info (Denormalized for faster queries)
    studentEmail: String,
    studentName: String,
    enrollmentNo: String,
    program: String,
    batch: String,
    semester: Number,
    
    // Department-wise Clearance Status
    departments: {
      type: Map,
      of: {
        departmentId: mongoose.Schema.Types.ObjectId,
        departmentName: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        remarks: String,
        completedRequirements: [String],
        rejectionReason: String,
        approvedBy: mongoose.Schema.Types.ObjectId, // Faculty ID
        approvedAt: Date,
        updatedAt: { type: Date, default: Date.now },
      },
      default: new Map(),
    },
    
    // Verification Flow
    verificationToken: String,
    verificationTokenExpiry: Date,
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date,
    
    // Overall Status
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "IN_PROGRESS", "APPROVED", "REJECTED", "CERTIFICATE_GENERATED"],
      default: "PENDING_VERIFICATION",
      index: true,
    },
    
    // Certificate
    certificateId: mongoose.Schema.Types.ObjectId,
    certificateGeneratedAt: Date,
    
    // Reason for Application
    reason: String,
    
    // Admin Actions
    approvedByAdmin: mongoose.Schema.Types.ObjectId,
    adminApprovalDate: Date,
    adminRemarks: String,
    
    // Rejection (if any)
    isRejected: { type: Boolean, default: false },
    rejectionDate: Date,
    rejectionReason: String,
    
    // Timestamps
    submittedAt: { type: Date, default: Date.now },
  },
  { 
    timestamps: true,
    indexes: [
      { studentId: 1, createdAt: -1 },
      { status: 1 },
      { verificationToken: 1 },
    ]
  }
);

export default mongoose.model("NoDues", NoDuesSchema);
