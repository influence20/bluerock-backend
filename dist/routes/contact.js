"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        logger_1.logger.info(`Contact form submitted: ${name} (${email}) - ${subject}`);
        res.json({
            success: true,
            message: 'Your message has been sent successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map