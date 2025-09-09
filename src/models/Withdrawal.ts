import mongoose, { Schema } from 'mongoose';
import { IWithdrawal } from '../types';
import { WITHDRAWAL_STATUS } from '../config/constants';

const withdrawalSchema = new Schema<IWithdrawal>({
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
  pin: {
    type: String,
    sparse: true,
  },
  pinExpiresAt: {
    type: Date,
  },
  pinUsed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: Object.values(WITHDRAWAL_STATUS),
    default: WITHDRAWAL_STATUS.PENDING,
    index: true,
  },
  txid: {
    type: String,
    sparse: true,
  },
  adminNotes: {
    type: String,
  },
  approvedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ currency: 1 });
withdrawalSchema.index({ createdAt: -1 });
withdrawalSchema.index({ pinExpiresAt: 1 });

// Virtual for formatted amount
withdrawalSchema.virtual('formattedAmount').get(function() {
  return `${this.amount} ${this.currency}`;
});

// Pre-save middleware
withdrawalSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case WITHDRAWAL_STATUS.APPROVED:
        if (!this.approvedAt) this.approvedAt = now;
        break;
      case WITHDRAWAL_STATUS.REJECTED:
        if (!this.rejectedAt) this.rejectedAt = now;
        break;
      case WITHDRAWAL_STATUS.COMPLETED:
        if (!this.completedAt) this.completedAt = now;
        break;
    }
  }
  next();
});

// Static methods
withdrawalSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

withdrawalSchema.statics.findPending = function() {
  return this.find({ status: WITHDRAWAL_STATUS.PENDING }).sort({ createdAt: 1 });
};

withdrawalSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

withdrawalSchema.statics.findExpiredPins = function() {
  return this.find({
    status: WITHDRAWAL_STATUS.PIN_REQUIRED,
    pinExpiresAt: { $lt: new Date() },
    pin: { $exists: true, $ne: null },
  });
};

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);
export default Withdrawal;