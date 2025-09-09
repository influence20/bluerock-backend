import mongoose, { Schema } from 'mongoose';
import { IPayout } from '../types';
import { PAYOUT_STATUS } from '../config/constants';

const payoutSchema = new Schema<IPayout>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  investmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Investment',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  status: {
    type: String,
    enum: Object.values(PAYOUT_STATUS),
    default: PAYOUT_STATUS.PENDING,
    index: true,
  },
  txid: {
    type: String,
    sparse: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'USDT',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  paidAt: {
    type: Date,
  },
  failedAt: {
    type: Date,
  },
  adminNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
payoutSchema.index({ userId: 1, investmentId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ scheduledDate: 1 });
payoutSchema.index({ createdAt: -1 });

// Compound index for unique week per investment
payoutSchema.index({ investmentId: 1, week: 1 }, { unique: true });

// Virtual for formatted amount
payoutSchema.virtual('formattedAmount').get(function() {
  return `${this.amount} ${this.currency}`;
});

// Pre-save middleware
payoutSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case PAYOUT_STATUS.PAID:
        if (!this.paidAt) this.paidAt = now;
        break;
      case PAYOUT_STATUS.FAILED:
        if (!this.failedAt) this.failedAt = now;
        break;
    }
  }
  next();
});

// Static methods
payoutSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

payoutSchema.statics.findByInvestment = function(investmentId: string) {
  return this.find({ investmentId }).sort({ week: 1 });
};

payoutSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ scheduledDate: 1 });
};

payoutSchema.statics.findPending = function() {
  return this.find({ status: PAYOUT_STATUS.PENDING }).sort({ scheduledDate: 1 });
};

payoutSchema.statics.findDuePayouts = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    status: PAYOUT_STATUS.PENDING,
    scheduledDate: { $lte: today },
  });
};

payoutSchema.statics.getTotalByUser = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: PAYOUT_STATUS.PAID } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

payoutSchema.statics.getStatsByPeriod = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        paidAt: { $gte: startDate, $lte: endDate },
        status: PAYOUT_STATUS.PAID
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

export const Payout = mongoose.model<IPayout>('Payout', payoutSchema);
export default Payout;