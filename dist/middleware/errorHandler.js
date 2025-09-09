"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const constants_1 = require("../config/constants");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error('Error Handler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            ...error,
            message,
            statusCode: constants_1.HTTP_STATUS.NOT_FOUND,
            isOperational: true,
        };
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = {
            ...error,
            message,
            statusCode: constants_1.HTTP_STATUS.CONFLICT,
            isOperational: true,
        };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = {
            ...error,
            message,
            statusCode: constants_1.HTTP_STATUS.BAD_REQUEST,
            isOperational: true,
        };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = constants_1.ERROR_MESSAGES.INVALID_TOKEN;
        error = {
            ...error,
            message,
            statusCode: constants_1.HTTP_STATUS.UNAUTHORIZED,
            isOperational: true,
        };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            ...error,
            message,
            statusCode: constants_1.HTTP_STATUS.UNAUTHORIZED,
            isOperational: true,
        };
    }
    const statusCode = error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || constants_1.ERROR_MESSAGES.INTERNAL_ERROR;
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(constants_1.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map