import express from 'express';
import { User } from '../models/User';
import { Deposit } from '../models/Deposit';
import { Withdrawal } from '../models/Withdrawal';
import { Investment } from '../models/Investment';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const stats = {
      totalUsers: await User.countDocuments(),
      totalDeposits: await Deposit.countDocuments(),
      totalWithdrawals: await Withdrawal.countDocuments(),
      totalInvestments: await Investment.countDocuments(),
      pendingDeposits: await Deposit.countDocuments({ status: 'pending' }),
      pendingWithdrawals: await Withdrawal.countDocuments({ status: 'pending' }),
      activeInvestments: await Investment.countDocuments({ status: 'active' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard'
    });
  }
});

export default router;