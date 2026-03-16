import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: { 
      type: String, 
      required: true, 
      unique: true,
      sparse: true 
    }, // Public ID: CDGI-2024-001
    
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "User",
      index: true 
    },
    
    noDuesId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "NoDues",
      unique: true,
    },
    
    // Student Info
    studentName: String,
    enrollmentNo: String,
    program: String,
    batch: String,
    
    // Generation
    generatedAt: { type: Date, default: Date.now },
    generatedBy: mongoose.Schema.Types.ObjectId, // Admin ID
    
    // Files
    pdfPath: String, // Path to generated PDF
    qrCodeData: String, // QR code content (link to verify endpoint)
    
    // Status
    isValid: { type: Boolean, default: true },
    expiryDate: Date,
    revokedAt: Date,
    revocationReason: String,
    
    // Download tracking
    downloadCount: { type: Number, default: 0 },
    lastDownloadedAt: Date,
    
    // Security
    signatureHash: String, // Hash for tampering detection
    
  },
  { 
    timestamps: true,
    indexes: [
      { studentId: 1, generatedAt: -1 },
      { certificateId: 1 },
      { noDuesId: 1 },
    ]
  }
);

export default mongoose.model("Certificate", CertificateSchema);
