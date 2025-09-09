import express from 'express';
import { Transaction } from '../models/Transaction';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user?._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

export default router;