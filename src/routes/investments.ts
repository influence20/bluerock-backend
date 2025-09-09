import express from 'express';
import { Investment } from '../models/Investment';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all investments for user
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user?._id })
      .populate('depositId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    logger.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investments'
    });
  }
});

// Create new investment
router.post('/', auth, async (req, res) => {
  try {
    const { depositId, amount } = req.body;
    
    const investment = new Investment({
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
  } catch (error) {
    logger.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create investment'
    });
  }
});

export default router;