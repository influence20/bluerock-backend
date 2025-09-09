import express, { Request, Response } from 'express';
import { Withdrawal } from '../models/Withdrawal';
import auth from '../middleware/auth';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

const router = express.Router();

// Get all withdrawals for user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user?._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    logger.error('Error fetching withdrawals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch withdrawals'
    });
  }
});

// Create new withdrawal
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, walletAddress } = req.body;
    
    const withdrawal = new Withdrawal({
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
  } catch (error) {
    logger.error('Error creating withdrawal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create withdrawal'
    });
  }
});

export default router;
