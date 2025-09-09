import express, { Request, Response } from 'express';
import { Payout } from '../models/Payout';
import auth from '../middleware/auth';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

const router = express.Router();

// Get all payouts for user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const payouts = await Payout.find({ userId: req.user?._id })
      .populate('investmentId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: payouts
    });
  } catch (error) {
    logger.error('Error fetching payouts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payouts'
    });
  }
});

export default router;
