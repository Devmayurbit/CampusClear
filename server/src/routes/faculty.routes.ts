import { Router, Request, Response, NextFunction } from "express";
import {
  getFacultyRequests,
  getFacultyRequestById,
  updateRequestStatus,
  searchStudentRequest,
  getFacultyDashboard,
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

export default router;
