import mongoose, { Schema } from 'mongoose';
import { IDeposit } from '../types';
import { DEPOSIT_STATUS } from '../config/constants';

const depositSchema = new Schema<IDeposit>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    enum: ['BTC', 'ETH', 'BNB', 'USDT_ERC20', 'USDT_BEP20', 'USDT_TRC20'],
  },
  walletAddress: {
    type: String,
    required: true,
  },
  txid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(DEPOSIT_STATUS),
    default: DEPOSIT_STATUS.PENDING,
    index: true,
  },
  confirmations: {
    type: Number,
    default: 0,
  },
  requiredConfirmations: {
    type: Number,
    default: 3,
  },
  adminNotes: {
    type: String,
  },
  confirmedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
depositSchema.index({ userId: 1, status: 1 });
depositSchema.index({ currency: 1 });
depositSchema.index({ createdAt: -1 });
depositSchema.index({ txid: 1 }, { unique: true });

// Virtual for formatted amount
depositSchema.virtual('formattedAmount').get(function() {
  return `${this.amount} ${this.currency}`;
});

// Pre-save middleware
depositSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === DEPOSIT_STATUS.CONFIRMED && !this.confirmedAt) {
      this.confirmedAt = new Date();
    } else if (this.status === DEPOSIT_STATUS.REJECTED && !this.rejectedAt) {
      this.rejectedAt = new Date();
    }
  }
  next();
});

// Static methods
depositSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

depositSchema.statics.findPending = function() {
  return this.find({ status: DEPOSIT_STATUS.PENDING }).sort({ createdAt: 1 });
};

depositSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

depositSchema.statics.findByCurrency = function(currency: string) {
  return this.find({ currency }).sort({ createdAt: -1 });
};

depositSchema.statics.getTotalByUser = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: DEPOSIT_STATUS.CONFIRMED } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
};

depositSchema.statics.getStatsByPeriod = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: DEPOSIT_STATUS.CONFIRMED
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

export const Deposit = mongoose.model<IDeposit>('Deposit', depositSchema);
export default Deposit;