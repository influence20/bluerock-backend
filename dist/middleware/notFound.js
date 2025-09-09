"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const constants_1 = require("../config/constants");
const notFound = (req, res) => {
    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
};
exports.notFound = notFound;
exports.default = exports.notFound;
//# sourceMappingURL=notFound.js.map