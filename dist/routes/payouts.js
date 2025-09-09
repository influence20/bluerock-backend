"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Payout_1 = require("../models/Payout");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const payouts = await Payout_1.Payout.find({ userId: req.user?._id })
            .populate('investmentId')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: payouts
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching payouts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payouts'
        });
    }
});
exports.default = router;
//# sourceMappingURL=payouts.js.map