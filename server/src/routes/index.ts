import { Router } from "express";
import authRoutes from "./auth.routes";
import noDuesRoutes from "./nodues.routes";
import facultyRoutes from "./faculty.routes";
import adminRoutes from "./admin.routes";
import certificateRoutes from "./certificate.routes";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// No-Dues workflow routes
router.use("/nodues", noDuesRoutes);

// Faculty routes
router.use("/faculty", facultyRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// Certificate routes
router.use("/certificate", certificateRoutes);

export default router;
