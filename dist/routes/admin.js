"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const Deposit_1 = require("../models/Deposit");
const Withdrawal_1 = require("../models/Withdrawal");
const Investment_1 = require("../models/Investment");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/dashboard', auth_1.auth, async (req, res) => {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        const stats = {
            totalUsers: await User_1.User.countDocuments(),
            totalDeposits: await Deposit_1.Deposit.countDocuments(),
            totalWithdrawals: await Withdrawal_1.Withdrawal.countDocuments(),
            totalInvestments: await Investment_1.Investment.countDocuments(),
            pendingDeposits: await Deposit_1.Deposit.countDocuments({ status: 'pending' }),
            pendingWithdrawals: await Withdrawal_1.Withdrawal.countDocuments({ status: 'pending' }),
            activeInvestments: await Investment_1.Investment.countDocuments({ status: 'active' })
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching admin dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch admin dashboard'
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map