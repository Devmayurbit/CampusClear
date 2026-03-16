import { Router, Request, Response, NextFunction } from "express";
import {
  generateCertificate,
  verifyCertificate,
  getStudentCertificates,
  listCertificates,
  downloadCertificate,
} from "../controllers/certificate.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth";
import { Role } from "../utils/roles";

const router = Router();

/**
 * @route   POST /api/v1/certificate/:requestId/generate
 * @desc    Generate certificate for approved request
 * @access  Private - Admin only
 */
router.post(
  "/:requestId/generate",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await generateCertificate(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/certificate/verify/:certificateId
 * @desc    Verify certificate (public endpoint)
 * @access  Public
 */
router.get("/verify/:certificateId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyCertificate(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/certificate/my-certificates
 * @desc    Get student's certificates
 * @access  Private - Student only
 */
router.get(
  "/my-certificates",
  authenticateJWT,
  authorizeRole(Role.STUDENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getStudentCertificates(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/certificate/list
 * @desc    List all certificates with pagination
 * @access  Private - Admin only
 */
router.get(
  "/list",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await listCertificates(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/certificate/:certificateId/download
 * @desc    Download certificate
 * @access  Private - Student, Admin
 */
router.get(
  "/:certificateId/download",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await downloadCertificate(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
