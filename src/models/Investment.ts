import mongoose, { Schema } from 'mongoose';
import { IInvestment } from '../types';
import { INVESTMENT_STATUS, INVESTMENT_CONFIG } from '../config/constants';
import { addWeeks, addDays } from 'date-fns';

const investmentSchema = new Schema<IInvestment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  depositId: {
    type: Schema.Types.ObjectId,
    ref: 'Deposit',
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: INVESTMENT_CONFIG.MIN_INVESTMENT,
  },
  weeklyPayout: {
    type: Number,
    required: true,
  },
  totalPayouts: {
    type: Number,
    default: 0,
  },
  remainingPayouts: {
    type: Number,
    default: INVESTMENT_CONFIG.PAYOUT_WEEKS,
  },
  status: {
    type: String,
    enum: Object.values(INVESTMENT_STATUS),
    default: INVESTMENT_STATUS.PENDING,
    index: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  nextPayoutDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
investmentSchema.index({ userId: 1, status: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ nextPayoutDate: 1 });
investmentSchema.index({ createdAt: -1 });

// Virtual for progress percentage
investmentSchema.virtual('progressPercentage').get(function() {
  const completedPayouts = INVESTMENT_CONFIG.PAYOUT_WEEKS - this.remainingPayouts;
  return Math.round((completedPayouts / INVESTMENT_CONFIG.PAYOUT_WEEKS) * 100);
});

// Virtual for total expected return
investmentSchema.virtual('totalExpectedReturn').get(function() {
  return this.weeklyPayout * INVESTMENT_CONFIG.PAYOUT_WEEKS;
});

// Virtual for profit
investmentSchema.virtual('profit').get(function() {
  return this.totalExpectedReturn - this.amount;
});

// Virtual for ROI
investmentSchema.virtual('roi').get(function() {
  return ((this.profit / this.amount) * 100);
});

// Pre-save middleware
investmentSchema.pre('save', function(next) {
  // Calculate weekly payout if not set
  if (!this.weeklyPayout && this.amount) {
    this.weeklyPayout = (this.amount / INVESTMENT_CONFIG.FORMULA_DIVISOR) * INVESTMENT_CONFIG.FORMULA_MULTIPLIER;
  }

  // Set dates when status changes to active
  if (this.isModified('status') && this.status === INVESTMENT_STATUS.ACTIVE) {
    if (!this.startDate) {
      this.startDate = new Date();
      this.endDate = addWeeks(this.startDate, INVESTMENT_CONFIG.PAYOUT_WEEKS);
      
      // Find next Friday for first payout
      const nextFriday = this.getNextFriday(this.startDate);
      this.nextPayoutDate = nextFriday;
    }
  }

  // Mark as completed if no remaining payouts
  if (this.remainingPayouts <= 0 && this.status === INVESTMENT_STATUS.ACTIVE) {
    this.status = INVESTMENT_STATUS.COMPLETED;
    this.nextPayoutDate = null;
  }

  next();
});

// Method to get next Friday
investmentSchema.methods.getNextFriday = function(fromDate: Date): Date {
  const date = new Date(fromDate);
  const daysUntilFriday = (5 - date.getDay() + 7) % 7;
  return addDays(date, daysUntilFriday || 7);
};

// Method to process payout
investmentSchema.methods.processPayout = function(): void {
  if (this.remainingPayouts > 0) {
    this.totalPayouts += 1;
    this.remainingPayouts -= 1;
    
    if (this.remainingPayouts > 0) {
      // Set next payout date (next Friday)
      this.nextPayoutDate = addWeeks(this.nextPayoutDate!, 1);
    } else {
      // Investment completed
      this.status = INVESTMENT_STATUS.COMPLETED;
      this.nextPayoutDate = null;
    }
  }
};

// Static methods
investmentSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

investmentSchema.statics.findActive = function() {
  return this.find({ status: INVESTMENT_STATUS.ACTIVE }).sort({ nextPayoutDate: 1 });
};

investmentSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

investmentSchema.statics.findDueForPayout = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    status: INVESTMENT_STATUS.ACTIVE,
    nextPayoutDate: { $lte: today },
    remainingPayouts: { $gt: 0 }
  });
};

investmentSchema.statics.getTotalByUser = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalInvested: { $sum: '$amount' },
        totalPayouts: { $sum: { $multiply: ['$totalPayouts', '$weeklyPayout'] } },
        activeInvestments: {
          $sum: { $cond: [{ $eq: ['$status', INVESTMENT_STATUS.ACTIVE] }, 1, 0] }
        }
      }
    }
  ]);
};

investmentSchema.statics.getStatsByPeriod = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

investmentSchema.statics.calculateWeeklyPayout = function(amount: number): number {
  return (amount / INVESTMENT_CONFIG.FORMULA_DIVISOR) * INVESTMENT_CONFIG.FORMULA_MULTIPLIER;
};

export const Investment = mongoose.model<IInvestment>('Investment', investmentSchema);
export default Investment;