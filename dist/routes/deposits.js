"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Deposit_1 = require("../models/Deposit");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const deposits = await Deposit_1.Deposit.find({ userId: req.user?._id })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: deposits
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching deposits:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch deposits'
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { amount, currency, walletAddress, txid } = req.body;
        const deposit = new Deposit_1.Deposit({
            userId: req.user?._id,
            amount,
            currency,
            walletAddress,
            txid
        });
        await deposit.save();
        res.status(201).json({
            success: true,
            data: deposit,
            message: 'Deposit submitted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating deposit:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create deposit'
        });
    }
});
exports.default = router;
//# sourceMappingURL=deposits.js.map