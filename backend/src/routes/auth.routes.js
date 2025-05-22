import express from 'express';
import { body } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' }
});

// Register
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .isIn(['author', 'reader', 'admin'])
      .withMessage('Role must be one of: author, reader, admin')
  ],
  validateRequest,
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validateRequest,
  authController.login
);

// Get current user
router.get('/me', authenticateJWT, authController.getCurrentUser);

// 2FA endpoints
router.post('/2fa/enable', authenticateJWT, authController.enable2FA);
router.post('/2fa/verify-setup', authenticateJWT, authController.verify2FASetup);
router.post('/2fa/verify', authController.verify2FA);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

export default router;