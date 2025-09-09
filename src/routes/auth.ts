import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { emailQueueJob } from '../jobs/emailQueue';
import { authenticateToken, generateTokens, verifyRefreshToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, REGEX_PATTERNS } from '../config/constants';
import { RequestWithUser } from '../types';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(REGEX_PATTERNS.PASSWORD)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(REGEX_PATTERNS.PASSWORD)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, validateRequest, asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: ERROR_MESSAGES.USER_ALREADY_EXISTS,
    });
  }

  // Create user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Send welcome email
  await emailQueueJob.sendWelcomeEmail(user.email, user.firstName, user.lastName);

  logger.info(`New user registered: ${user.email}`);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.USER_CREATED,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
      },
      token: accessToken,
      refreshToken,
    },
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, validateRequest, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Check if account is locked
  if (user.isLocked()) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Account is temporarily locked due to multiple failed login attempts',
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Account is deactivated. Please contact support.',
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
      },
      token: accessToken,
      refreshToken,
    },
  });
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Refresh token is required',
    });
  }

  const decoded = verifyRefreshToken(refreshToken);
  
  if (!decoded) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  // Get user
  const user = await User.findById(decoded.userId);
  
  if (!user || !user.isActive) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  res.json({
    success: true,
    data: {
      token: accessToken,
      refreshToken: newRefreshToken,
    },
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req: RequestWithUser, res: Response) => {
  // In a more sophisticated implementation, you would blacklist the token
  logger.info(`User logged out: ${req.user?.email}`);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, validateRequest, asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Send reset email
  await emailQueueJob.sendPasswordResetEmail(user.email, user.firstName, resetToken);

  logger.info(`Password reset requested for: ${user.email}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPasswordValidation, validateRequest, asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Invalid or expired reset token',
    });
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  logger.info(`Password reset completed for: ${user.email}`);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.PASSWORD_RESET,
  });
}));

// @route   POST /api/auth/change-password
// @desc    Change password (authenticated)
// @access  Private
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(REGEX_PATTERNS.PASSWORD)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, and number'),
], validateRequest, asyncHandler(async (req: RequestWithUser, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  // Get user with password
  const userWithPassword = await User.findById(user._id).select('+password');
  
  if (!userWithPassword) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Current password is incorrect',
    });
  }

  // Set new password
  userWithPassword.password = newPassword;
  await userWithPassword.save();

  logger.info(`Password changed for: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

export default router;
