import { Schema, model } from 'mongoose';
import { ITransaction } from '../types';

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'payout', 'investment'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BTC'
  },
  status: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  txid: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ referenceId: 1 });

export default model<ITransaction>('Transaction', transactionSchema);