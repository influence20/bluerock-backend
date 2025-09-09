import express from 'express';
import { Deposit } from '../models/Deposit';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all deposits for user
router.get('/', auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user?._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: deposits
    });
  } catch (error) {
    logger.error('Error fetching deposits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deposits'
    });
  }
});

// Create new deposit
router.post('/', auth, async (req, res) => {
  try {
    const { amount, currency, walletAddress, txid } = req.body;
    
    const deposit = new Deposit({
      userId: req.user?._id,
      amount,
      currency,
      walletAddress,
      txid
    });
    
    await deposit.save();
    
    res.status(201).json({
      success: true,
      data: deposit,
      message: 'Deposit submitted successfully'
    });
  } catch (error) {
    logger.error('Error creating deposit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create deposit'
    });
  }
});

export default router;