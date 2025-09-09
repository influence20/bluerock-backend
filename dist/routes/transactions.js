"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Transaction_1 = require("../models/Transaction");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const transactions = await Transaction_1.Transaction.find({ userId: req.user?._id })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: transactions
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions'
        });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map