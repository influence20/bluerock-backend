"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateTokens = exports.optionalAuth = exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: constants_1.ERROR_MESSAGES.UNAUTHORIZED,
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }
        if (user.isLocked()) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: 'Account is temporarily locked due to multiple failed login attempts',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: constants_1.ERROR_MESSAGES.INVALID_TOKEN,
            });
            return;
        }
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.UNAUTHORIZED,
        });
        return;
    }
    if (!req.user.isAdmin) {
        res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: constants_1.ERROR_MESSAGES.FORBIDDEN,
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
            const user = await User_1.User.findById(decoded.userId);
            if (user && user.isActive && !user.isLocked()) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const generateTokens = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, constants_1.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jsonwebtoken_1.default.sign(payload, constants_1.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
exports.default = {
    authenticateToken: exports.authenticateToken,
    requireAdmin: exports.requireAdmin,
    optionalAuth: exports.optionalAuth,
    generateTokens: exports.generateTokens,
    verifyRefreshToken: exports.verifyRefreshToken,
};
//# sourceMappingURL=auth.js.map