import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Public health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Public configuration
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      minInvestment: 300,
      supportedCurrencies: ['BTC', 'ETH', 'BNB', 'USDT_ERC20', 'USDT_BEP20', 'USDT_TRC20']
    }
  });
});

export default router;