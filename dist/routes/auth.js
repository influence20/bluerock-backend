"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const emailQueue_1 = require("../jobs/emailQueue");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const constants_1 = require("../config/constants");
const router = express_1.default.Router();
const registerValidation = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(constants_1.REGEX_PATTERNS.PASSWORD)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(constants_1.REGEX_PATTERNS.PASSWORD)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
];
router.post('/register', registerValidation, validation_1.validateRequest, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        return res.status(constants_1.HTTP_STATUS.CONFLICT).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.USER_ALREADY_EXISTS,
        });
    }
    const user = new User_1.User({
        firstName,
        lastName,
        email,
        password,
    });
    await user.save();
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
    await emailQueue_1.emailQueueJob.sendWelcomeEmail(user.email, user.firstName, user.lastName);
    logger_1.logger.info(`New user registered: ${user.email}`);
    res.status(constants_1.HTTP_STATUS.CREATED).json({
        success: true,
        message: constants_1.SUCCESS_MESSAGES.USER_CREATED,
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
router.post('/login', loginValidation, validation_1.validateRequest, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS,
        });
    }
    if (user.isLocked()) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: 'Account is temporarily locked due to multiple failed login attempts',
        });
    }
    if (!user.isActive) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: 'Account is deactivated. Please contact support.',
        });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        await user.incLoginAttempts();
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS,
        });
    }
    if (user.loginAttempts > 0) {
        await user.updateOne({
            $unset: { loginAttempts: 1, lockUntil: 1 }
        });
    }
    user.lastLogin = new Date();
    await user.save();
    const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
    logger_1.logger.info(`User logged in: ${user.email}`);
    res.json({
        success: true,
        message: constants_1.SUCCESS_MESSAGES.LOGIN_SUCCESS,
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
router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: 'Refresh token is required',
        });
    }
    const decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
    if (!decoded) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.INVALID_TOKEN,
        });
    }
    const user = await User_1.User.findById(decoded.userId);
    if (!user || !user.isActive) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
        });
    }
    const { accessToken, refreshToken: newRefreshToken } = (0, auth_1.generateTokens)(user);
    res.json({
        success: true,
        data: {
            token: accessToken,
            refreshToken: newRefreshToken,
        },
    });
}));
router.post('/logout', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    logger_1.logger.info(`User logged out: ${req.user?.email}`);
    res.json({
        success: true,
        message: constants_1.SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    });
}));
router.post('/forgot-password', forgotPasswordValidation, validation_1.validateRequest, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user) {
        return res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    await emailQueue_1.emailQueueJob.sendPasswordResetEmail(user.email, user.firstName, resetToken);
    logger_1.logger.info(`Password reset requested for: ${user.email}`);
    res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
    });
}));
router.post('/reset-password', resetPasswordValidation, validation_1.validateRequest, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body;
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = await User_1.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Invalid or expired reset token',
        });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    logger_1.logger.info(`Password reset completed for: ${user.email}`);
    res.json({
        success: true,
        message: constants_1.SUCCESS_MESSAGES.PASSWORD_RESET,
    });
}));
router.post('/change-password', auth_1.authenticateToken, [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .matches(constants_1.REGEX_PATTERNS.PASSWORD)
        .withMessage('New password must be at least 8 characters with uppercase, lowercase, and number'),
], validation_1.validateRequest, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    const userWithPassword = await User_1.User.findById(user._id).select('+password');
    if (!userWithPassword) {
        return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
        });
    }
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: 'Current password is incorrect',
        });
    }
    userWithPassword.password = newPassword;
    await userWithPassword.save();
    logger_1.logger.info(`Password changed for: ${user.email}`);
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map