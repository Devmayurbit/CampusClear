import { Router, Request, Response, NextFunction } from "express";
import { 
  registerStudent, 
  login, 
  createStaff, 
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  googleSignIn
} from "../controllers/auth.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth";
import { Role } from "../utils/roles";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new student with email verification
 * @access  Public
 */
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerStudent(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login for Student, Faculty, or Admin
 * @access  Public
 */
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email with verification token
 * @access  Public
 */
router.post("/verify-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyEmail(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await requestPasswordReset(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await resetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/google
 * @desc    Google Sign-in (ID token)
 * @access  Public
 */
router.post("/google", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await googleSignIn(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/staff
 * @desc    Create Faculty or Admin account
 * @access  Private - Admin only
 */
router.post(
  "/staff",
  authenticateJWT,
  authorizeRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createStaff(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
