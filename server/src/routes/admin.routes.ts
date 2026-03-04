import { Router, Request, Response, NextFunction } from "express";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  getAdminDashboard,
  getAuditLogs,
  getSystemStats,
  getAdminNoDues,
  approveNoDuesById,
  rejectNoDuesById,
  getStudents,
  getDepartments,
  createDepartment,
  getAllUsers,
  createUser,
  toggleUserStatus,
  updateFeeStatus,
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
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
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
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllRequests(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/nodues
 * @desc    Get no-dues list (frontend compatibility endpoint)
 * @access  Private - Admin only
 */
router.get(
  "/nodues",
  authenticateJWT,
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAdminNoDues(req, res);
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
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await approveRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/admin/nodues/:id/approve
 * @desc    Approve a no-dues request (frontend compatibility endpoint)
 * @access  Private - Admin only
 */
router.put(
  "/nodues/:id/approve",
  authenticateJWT,
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await approveNoDuesById(req, res);
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
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await rejectRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/admin/nodues/:id/reject
 * @desc    Reject a no-dues request (frontend compatibility endpoint)
 * @access  Private - Admin only
 */
router.put(
  "/nodues/:id/reject",
  authenticateJWT,
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await rejectNoDuesById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/v1/admin/requests/:requestId/fee-status
 * @desc    Update fee status for a No-Dues request
 * @access  Private - Super Admin only
 */
router.patch(
  "/requests/:requestId/fee-status",
  authenticateJWT,
  authorizeRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateFeeStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/students
 * @desc    Get student directory
 * @access  Private - Admin only
 */
router.get(
  "/students",
  authenticateJWT,
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getStudents(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/departments
 * @desc    Get departments
 * @access  Private - Admin only
 */
router.get(
  "/departments",
  authenticateJWT,
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getDepartments(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/admin/departments
 * @desc    Create department
 * @access  Private - Admin only
 */
router.post(
  "/departments",
  authenticateJWT,
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createDepartment(req, res);
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
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
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
  authorizeRole(Role.ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getSystemStats(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users across roles
 * @access  Private - Super Admin only
 */
router.get(
  "/users",
  authenticateJWT,
  authorizeRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllUsers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/admin/users
 * @desc    Create admin/faculty/super admin user
 * @access  Private - Super Admin only
 */
router.post(
  "/users",
  authenticateJWT,
  authorizeRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/v1/admin/users/:role/:userId/status
 * @desc    Activate/deactivate user
 * @access  Private - Super Admin only
 */
router.patch(
  "/users/:role/:userId/status",
  authenticateJWT,
  authorizeRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await toggleUserStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
