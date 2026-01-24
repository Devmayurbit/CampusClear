import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import Student from "./models/Student";
import "dotenv/config";
import NoDues from "./models/NoDues";
import { sendVerificationMail } from "./mailer";
import crypto from "crypto";
import crypto from "crypto";
import NoDues from "./models/NoDues";
import { sendVerificationEmail } from "./mailer";


const JWT_SECRET = process.env.JWT_SECRET || "secret";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 },
});

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.student = decoded;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ================= REGISTER =================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const {
        fullName,
        enrollmentNo,
        email,
        password,
        program,
        batch,
      } = req.body;

      if (!fullName || !enrollmentNo || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
      }

      const exists = await Student.findOne({
        $or: [{ enrollmentNo }, { email }],
      });

      if (exists) {
        return res.status(400).json({ message: "Student already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const student = await Student.create({
        fullName,
        enrollmentNo,
        email,
        password: hashedPassword,
        program,
        batch,
      });

      const token = jwt.sign({ id: student._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const data = student.toObject();
      delete data.password;

      res.status(201).json({
        message: "Student registered successfully",
        student: data,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Register failed" });
    }
  });

  // ================= LOGIN =================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { enrollmentNo, password } = req.body;

      if (!enrollmentNo || !password) {
        return res.status(400).json({ message: "All fields required" });
      }

      const student = await Student.findOne({ enrollmentNo });
      if (!student) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, student.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: student._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const data = student.toObject();
      delete data.password;

      res.json({
        message: "Login successful",
        student: data,
        token,
      });
    } catch {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ================= NO DUES FORM =================

app.post("/api/nodues", authenticateToken, async (req: any, res) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");

    const record = await NoDues.create({
      ...req.body,
      studentId: req.student.id,
      verificationToken: token,
    });

    const verifyLink = `http://localhost:5000/api/nodues/verify/${token}`;

    await sendVerificationMail(record.email, verifyLink);

    res.json({
      message: "No-Dues submitted. Verification email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit No-Dues form" });
  }
});

// Verify Email
app.get("/api/nodues/verify/:token", async (req, res) => {
  try {
    const record = await NoDues.findOne({
      verificationToken: req.params.token,
    });

    if (!record) {
      return res.send("<h2>Invalid or expired link</h2>");
    }

    record.verified = true;
    record.verificationToken = "";
    await record.save();

    res.send("<h2>✅ Your No-Dues request has been verified!</h2>");
  } catch {
    res.send("<h2>Verification failed</h2>");
  }
});
// ================= VERIFY =================

app.get("/api/nodues/verify/:token", async (req, res) => {
  try {
    const record = await NoDues.findOne({
      verificationToken: req.params.token,
    });

    if (!record) {
      return res.status(400).send("Invalid or expired token");
    }

    record.isVerified = true;
    record.status = "VERIFIED";
    record.verificationToken = "";
    await record.save();

    res.send(`
      <h2>✅ Verification Successful</h2>
      <p>Your No-Dues application is verified successfully.</p>
    `);
  } catch (err) {
    res.status(500).send("Verification failed");
  }
});
// ================= NO DUES CREATE =================

app.post("/api/nodues", authenticateToken, async (req: any, res) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");

    const form = await NoDues.create({
      ...req.body,
      studentId: req.student.id,
      verificationToken: token,
    });

    const verifyLink = `http://localhost:5000/api/nodues/verify/${token}`;

    await sendVerificationEmail(form.email, verifyLink);

    res.status(201).json({
      message: "Application submitted. Verification email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

  // ================= PROFILE =================
  app.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const student = await Student.findById(req.student.id).select("-password");
      if (!student) return res.status(404).json({ message: "Student not found" });
      res.json(student);
    } catch {
      res.status(500).json({ message: "Profile fetch failed" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const updated = await Student.findByIdAndUpdate(
        req.student.id,
        req.body,
        { new: true }
      ).select("-password");

      res.json({
        message: "Profile updated successfully",
        student: updated,
      });
    } catch {
      res.status(500).json({ message: "Profile update failed" });
    }
  });

  // ================= PHOTO UPLOAD =================
  app.post(
    "/api/profile/photo",
    authenticateToken,
    upload.single("photo"),
    async (req: any, res) => {
      try {
        const photoPath = `/uploads/${req.file.filename}`;

        await Student.findByIdAndUpdate(req.student.id, {
          profilePhoto: photoPath,
        });

        res.json({ message: "Photo uploaded", photoPath });
      } catch {
        res.status(500).json({ message: "Upload failed" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
