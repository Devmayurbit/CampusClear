import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    // Actor
    actorId: mongoose.Schema.Types.ObjectId, // User who performed action
    actorRole: {
      type: String,
      enum: ["student", "faculty", "admin"],
    },
    actorName: String,
    actorEmail: String,
    
    // Action
    action: {
      type: String,
      enum: [
        "LOGIN",
        "LOGOUT",
        "REGISTER",
        "PROFILE_UPDATE",
        "PASSWORD_CHANGE",
        "PHOTO_UPLOAD",
        "NODUES_SUBMIT",
        "NODUES_VERIFY",
        "NODUES_APPROVE",
        "NODUES_REJECT",
        "CERTIFICATE_GENERATE",
        "CERTIFICATE_DOWNLOAD",
        "CERTIFICATE_REVOKE",
        "USER_CREATE",
        "USER_UPDATE",
        "USER_DELETE",
        "DEPARTMENT_CREATE",
        "DEPARTMENT_UPDATE",
        "ADMIN_LOGIN",
        "SETTINGS_UPDATE",
      ],
      index: true,
    },
    
    // Target
    targetType: {
      type: String,
      enum: ["student", "faculty", "admin", "nodues", "certificate", "department"],
    },
    targetId: mongoose.Schema.Types.ObjectId,
    targetName: String,
    
    // Details
    details: mongoose.Schema.Types.Mixed, // Flexible for storing specific action details
    changes: mongoose.Schema.Types.Mixed, // Before/after for UPDATE actions
    
    // Metadata
    ipAddress: String,
    userAgent: String,
    httpMethod: String,
    endpoint: String,
    statusCode: Number,
    errorMessage: String,
    
    // Timestamp
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { 
    timestamps: false,
    indexes: [
      { actorId: 1, timestamp: -1 },
      { action: 1, timestamp: -1 },
      { targetType: 1, targetId: 1 },
    ]
  }
);

export default mongoose.model("AuditLog", AuditLogSchema);
