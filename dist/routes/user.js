"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/profile', auth_1.auth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?._id).select('-password');
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user profile'
        });
    }
});
router.put('/profile', auth_1.auth, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user?._id, { firstName, lastName }, { new: true }).select('-password');
        res.json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user profile'
        });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map