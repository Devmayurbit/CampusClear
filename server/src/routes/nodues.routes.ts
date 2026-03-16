import { Router, Request, Response, NextFunction } from "express";
import {
  createNoDuesRequest,
  getMyNoDues,
  getAllNoDues,
  approveNoDues,
  rejectNoDues,
} from "../controllers/nodues.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth";
import { Role } from "../utils/roles";

const router = Router();

/**
 * @route   POST /api/v1/nodues/create
 * @desc    Create a new No-Dues request
 * @access  Private - Student only
 */
router.post(
  "/create",
  authenticateJWT,
  authorizeRole(Role.STUDENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createNoDuesRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/nodues/me
 * @desc    Get current student's No-Dues request
 * @access  Private - Student only
 */
router.get(
  "/me",
  authenticateJWT,
  authorizeRole(Role.STUDENT),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getMyNoDues(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/nodues/all
 * @desc    Get all No-Dues requests
 * @access  Private - Admin only
 */
router.get(
  "/all",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllNoDues(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/nodues/approve/:id
 * @desc    Approve a No-Dues clearance (faculty/admin)
 * @access  Private - Faculty/Admin
 */
router.put(
  "/approve/:id",
  authenticateJWT,
  authorizeRole(Role.FACULTY, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await approveNoDues(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/nodues/reject/:id
 * @desc    Reject a No-Dues clearance (faculty/admin)
 * @access  Private - Faculty/Admin
 */
router.put(
  "/reject/:id",
  authenticateJWT,
  authorizeRole(Role.FACULTY, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await rejectNoDues(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
