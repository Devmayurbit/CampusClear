import { Router, Request, Response, NextFunction } from "express";
import {
  submitNoDuesRequest,
  verifyNoDuesRequest,
  getStudentRequest,
  getRequestHistory,
  updateDepartmentStatus,
} from "../controllers/nodues.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth";

const router = Router();

/**
 * @route   POST /api/v1/nodues/submit
 * @desc    Submit a new No-Dues request
 * @access  Private - Student only
 */
router.post(
  "/submit",
  authenticateJWT,
  authorizeRole("student"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await submitNoDuesRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/nodues/verify
 * @desc    Verify No-Dues request with email token
 * @access  Public
 */
router.post("/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyNoDuesRequest(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/nodues/my-request
 * @desc    Get current student's active No-Dues request
 * @access  Private - Student only
 */
router.get(
  "/my-request",
  authenticateJWT,
  authorizeRole("student"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getStudentRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/nodues/history
 * @desc    Get student's No-Dues request history
 * @access  Private - Student only
 */
router.get(
  "/history",
  authenticateJWT,
  authorizeRole("student"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getRequestHistory(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/nodues/:requestId/department
 * @desc    Update No-Dues request department clearance status
 * @access  Private - Faculty only
 */
router.put(
  "/:requestId/department",
  authenticateJWT,
  authorizeRole("faculty"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateDepartmentStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
