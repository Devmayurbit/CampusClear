import { Router, Request, Response, NextFunction } from "express";
import {
  getFacultyRequests,
  getFacultyRequestById,
  updateRequestStatus,
  searchStudentRequest,
  getFacultyDashboard,
  bulkUpdateRequests,
  getStudentDetails,
  exportRequests,
  getFilteredRequests,
  addRequestRemarks,
} from "../controllers/faculty.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth";
import { Role } from "../utils/roles";

const router = Router();

/**
 * @route   GET /api/v1/faculty/dashboard
 * @desc    Get faculty dashboard with stats
 * @access  Private - Faculty only
 */
router.get(
  "/dashboard",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getFacultyDashboard(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/faculty/requests
 * @desc    Get all No-Dues requests for faculty's department
 * @access  Private - Faculty only
 */
router.get(
  "/requests",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getFacultyRequests(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/faculty/requests/:requestId
 * @desc    Get specific No-Dues request details
 * @access  Private - Faculty only
 */
router.get(
  "/requests/:requestId",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getFacultyRequestById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/faculty/requests/:requestId/update
 * @desc    Update No-Dues request status for faculty's department
 * @access  Private - Faculty only
 */
router.put(
  "/requests/:requestId/update",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateRequestStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/faculty/search
 * @desc    Search student request by enrollment number
 * @access  Private - Faculty only
 */
router.get(
  "/search",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await searchStudentRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/faculty/requests/bulk-update
 * @desc    Bulk approve/reject multiple requests
 * @access  Private - Faculty only
 */
router.post(
  "/requests/bulk-update",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await bulkUpdateRequests(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/faculty/students/:studentId
 * @desc    Get detailed student information
 * @access  Private - Faculty only
 */
router.get(
  "/students/:studentId",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getStudentDetails(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/faculty/requests/export
 * @desc    Export requests to CSV
 * @access  Private - Faculty only
 */
router.get(
  "/export",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await exportRequests(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/faculty/requests/filtered
 * @desc    Get filtered requests with advanced options
 * @access  Private - Faculty only
 */
router.get(
  "/requests/filtered",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getFilteredRequests(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/faculty/requests/:requestId/remarks
 * @desc    Add detailed remarks to a request
 * @access  Private - Faculty only
 */
router.put(
  "/requests/:requestId/remarks",
  authenticateJWT,
  authorizeRole(Role.FACULTY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await addRequestRemarks(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
