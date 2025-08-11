import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, student: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.student = student;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if student already exists
      const existingStudent = await storage.getStudentByEnrollment(validatedData.enrollmentNo);
      if (existingStudent) {
        return res.status(400).json({ message: "Student with this enrollment number already exists" });
      }

      const existingEmail = await storage.getStudentByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Student with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create student
      const student = await storage.createStudent({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: student.id, enrollmentNo: student.enrollmentNo },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      const { password: _, ...studentWithoutPassword } = student;

      res.status(201).json({
        message: "Student registered successfully",
        student: studentWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find student
      const student = await storage.getStudentByEnrollment(validatedData.enrollmentNo);
      if (!student) {
        return res.status(401).json({ message: "Invalid enrollment number or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid enrollment number or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: student.id, enrollmentNo: student.enrollmentNo },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      const { password: _, ...studentWithoutPassword } = student;

      res.json({
        message: "Login successful",
        student: studentWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected routes
  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const student = await storage.getStudent(req.student.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { password: _, ...studentWithoutPassword } = student;
      res.json(studentWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const updateData = req.body;
      delete updateData.id;
      delete updateData.enrollmentNo;
      delete updateData.password;
      delete updateData.createdAt;

      const updatedStudent = await storage.updateStudent(req.student.id, updateData);
      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { password: _, ...studentWithoutPassword } = updatedStudent;
      res.json({
        message: "Profile updated successfully",
        student: studentWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/profile/photo", authenticateToken, upload.single("photo"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const photoPath = `/uploads/${req.file.filename}`;
      const updatedStudent = await storage.updateStudent(req.student.id, {
        profilePhoto: photoPath,
      });

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({
        message: "Photo uploaded successfully",
        photoPath,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Clearance routes
  app.get("/api/clearances", authenticateToken, async (req: any, res) => {
    try {
      const clearances = await storage.getClearancesByStudent(req.student.id);
      const departments = await storage.getAllDepartments();

      const clearancesWithDepartments = clearances.map((clearance) => {
        const department = departments.find((dept) => dept.id === clearance.departmentId);
        return {
          ...clearance,
          department,
        };
      });

      res.json(clearancesWithDepartments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
