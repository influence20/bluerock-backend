"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Investment_1 = require("../models/Investment");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const investments = await Investment_1.Investment.find({ userId: req.user?._id })
            .populate('depositId')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: investments
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching investments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch investments'
        });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { depositId, amount } = req.body;
        const investment = new Investment_1.Investment({
            userId: req.user?._id,
            depositId,
            amount
        });
        await investment.save();
        res.status(201).json({
            success: true,
            data: investment,
            message: 'Investment created successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating investment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create investment'
        });
    }
});
exports.default = router;
//# sourceMappingURL=investments.js.map