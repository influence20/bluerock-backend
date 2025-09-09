"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});
router.get('/config', (req, res) => {
    res.json({
        success: true,
        data: {
            minInvestment: 300,
            supportedCurrencies: ['BTC', 'ETH', 'BNB', 'USDT_ERC20', 'USDT_BEP20', 'USDT_TRC20']
        }
    });
});
exports.default = router;
//# sourceMappingURL=public.js.map