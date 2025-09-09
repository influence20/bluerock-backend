"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const constants_1 = require("../config/constants");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined,
        }));
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'Validation failed',
            details: errorMessages,
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
exports.default = exports.validateRequest;
//# sourceMappingURL=validation.js.map