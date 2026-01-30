import mongoose from "mongoose";

const NoDuesSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },

    fullName: String,
    enrollmentNo: String,
    email: String,
    phone: String,

    program: String,
    department: String,
    batch: String,
    semester: String,

    reason: String,
    libraryClearance: Boolean,
    hostelClearance: Boolean,
    accountsClearance: Boolean,
    labClearance: Boolean,

    verificationToken: String,
    isVerified: { type: Boolean, default: false },

    status: {
      type: String,
      default: "PENDING", // PENDING | VERIFIED | APPROVED
    },
  },
  { timestamps: true }
);

export default mongoose.model("NoDues", NoDuesSchema);
