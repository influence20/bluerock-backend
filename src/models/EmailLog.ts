import mongoose, { Schema } from 'mongoose';
import { IEmailLog } from '../types';

const emailLogSchema = new Schema<IEmailLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true,
  },
  to: {
    type: String,
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
    index: true,
  },
  error: {
    type: String,
  },
  sentAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ template: 1, createdAt: -1 });

// Static methods
emailLogSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

emailLogSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

emailLogSchema.statics.findByTemplate = function(template: string) {
  return this.find({ template }).sort({ createdAt: -1 });
};

emailLogSchema.statics.getStatsByPeriod = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          template: '$template'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.template': 1, '_id.status': 1 } }
  ]);
};

export const EmailLog = mongoose.model<IEmailLog>('EmailLog', emailLogSchema);
export default EmailLog;