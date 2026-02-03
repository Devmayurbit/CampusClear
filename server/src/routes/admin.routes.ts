import { Router, Request, Response, NextFunction } from "express";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  getAdminDashboard,
  getAuditLogs,
  getSystemStats,
} from "../controllers/admin.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth";
import { Role } from "../utils/roles";

const router = Router();

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get admin dashboard with statistics
 * @access  Private - Admin only
 */
router.get(
  "/dashboard",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAdminDashboard(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/requests
 * @desc    Get all No-Dues requests with filtering and pagination
 * @access  Private - Admin only
 */
router.get(
  "/requests",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllRequests(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/admin/requests/:requestId/approve
 * @desc    Approve a No-Dues request
 * @access  Private - Admin only
 */
router.put(
  "/requests/:requestId/approve",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await approveRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/admin/requests/:requestId/reject
 * @desc    Reject a No-Dues request
 * @access  Private - Admin only
 */
router.put(
  "/requests/:requestId/reject",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await rejectRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get system audit logs with filtering
 * @access  Private - Admin only
 */
router.get(
  "/audit-logs",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAuditLogs(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get system statistics
 * @access  Private - Admin only
 */
router.get(
  "/stats",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getSystemStats(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
