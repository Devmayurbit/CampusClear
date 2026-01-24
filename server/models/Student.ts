import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    enrollmentNo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    program: String,
    batch: String,
    phone: String,
    address: String,
    profilePhoto: String,
  },
  { timestamps: true }
);

export default mongoose.model("Student", StudentSchema);
