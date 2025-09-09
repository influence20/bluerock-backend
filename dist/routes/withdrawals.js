"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Withdrawal_1 = require("../models/Withdrawal");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const withdrawals = await Withdrawal_1.Withdrawal.find({ userId: req.user?._id })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: withdrawals
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching withdrawals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch withdrawals'
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { amount, currency, walletAddress } = req.body;
        const withdrawal = new Withdrawal_1.Withdrawal({
            userId: req.user?._id,
            amount,
            currency,
            walletAddress
        });
        await withdrawal.save();
        res.status(201).json({
            success: true,
            data: withdrawal,
            message: 'Withdrawal request submitted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating withdrawal:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create withdrawal'
        });
    }
});
exports.default = router;
//# sourceMappingURL=withdrawals.js.map