import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // Identity
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    enrollmentNo: { 
      type: String, 
      sparse: true, 
      unique: true // Only for students
    },
    rollNumber: { 
      type: String, 
      sparse: true // Deprecated field - kept for backward compatibility
    },
    
    // Authentication
    passwordHash: { type: String, required: true },
    passwordResetToken: String,
    passwordResetExpiry: Date,
    
    // Role & Authorization
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
      default: "student",
    },
    
    // Student-specific
    program: String, // B.Tech, M.Tech, etc.
    batch: String, // 2020-2024
    semester: Number,
    cgpa: Number,
    credits: Number,
    expectedGraduation: Date,
    
    // Faculty-specific
    departmentId: mongoose.Schema.Types.ObjectId, // Reference to Department
    facultyId: String, // Employee ID
    designation: String, // Asst. Prof, Assoc. Prof, etc.
    
    // Profile
    phone: String,
    address: String,
    profilePhoto: String,
    gender: { type: String, enum: ["M", "F", "Other"] },
    dateOfBirth: Date,
    
    // Emergency Contact (Students)
    emergencyContactName: String,
    emergencyContactRelation: String,
    emergencyContactPhone: String,
    emergencyContactEmail: String,
    
    // Account Status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: String,
    verificationTokenExpiry: Date,
    
    // Audit
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    lastPasswordChange: Date,
    ipAddressLastLogin: String,
  },
  { 
    timestamps: true,
    indexes: [
      { email: 1 },
      { enrollmentNo: 1, sparse: true },
      { role: 1 },
      { departmentId: 1 },
    ]
  }
);

// Index for quick lookups
UserSchema.index({ email: 1, role: 1 });

export default mongoose.model("User", UserSchema);
