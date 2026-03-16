import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true }, // LIB, ACCT, HST, LAB
    description: String,
    color: { type: String, default: "#6B7280" },
    
    // Department Head
    headFacultyId: mongoose.Schema.Types.ObjectId,
    
    // Clearance Requirements
    requirements: [String], // e.g., ["Return books", "Pay pending fees"]
    
    // Status
    isActive: { type: Boolean, default: true },
    
    // Contact
    email: String,
    phone: String,
    officeLocation: String,
  },
  { timestamps: true }
);

export default mongoose.model("Department", DepartmentSchema);
