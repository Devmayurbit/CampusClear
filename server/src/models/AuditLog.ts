import mongoose, { Schema, Document } from "mongoose";

export interface AuditLogDoc extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole: "STUDENT" | "FACULTY" | "ADMIN";
  action: string;
  targetType: string;
  targetId?: string;
  timestamp: Date;
  ipAddress?: string;
}

const AuditLogSchema = new Schema<AuditLogDoc>(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
  },
  { timestamps: false }
);

export const AuditLog = mongoose.model<AuditLogDoc>("AuditLog", AuditLogSchema);
