"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payout = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../config/constants");
const payoutSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    investmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: Object.values(constants_1.PAYOUT_STATUS),
        default: constants_1.PAYOUT_STATUS.PENDING,
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
payoutSchema.index({ userId: 1, investmentId: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ scheduledDate: 1 });
payoutSchema.index({ createdAt: -1 });
payoutSchema.index({ investmentId: 1, week: 1 }, { unique: true });
payoutSchema.virtual('formattedAmount').get(function () {
    return `${this.amount} ${this.currency}`;
});
payoutSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        const now = new Date();
        switch (this.status) {
            case constants_1.PAYOUT_STATUS.PAID:
                if (!this.paidAt)
                    this.paidAt = now;
                break;
            case constants_1.PAYOUT_STATUS.FAILED:
                if (!this.failedAt)
                    this.failedAt = now;
                break;
        }
    }
    next();
});
payoutSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};
payoutSchema.statics.findByInvestment = function (investmentId) {
    return this.find({ investmentId }).sort({ week: 1 });
};
payoutSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ scheduledDate: 1 });
};
payoutSchema.statics.findPending = function () {
    return this.find({ status: constants_1.PAYOUT_STATUS.PENDING }).sort({ scheduledDate: 1 });
};
payoutSchema.statics.findDuePayouts = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.find({
        status: constants_1.PAYOUT_STATUS.PENDING,
        scheduledDate: { $lte: today },
    });
};
payoutSchema.statics.getTotalByUser = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId), status: constants_1.PAYOUT_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
};
payoutSchema.statics.getStatsByPeriod = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                paidAt: { $gte: startDate, $lte: endDate },
                status: constants_1.PAYOUT_STATUS.PAID
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
exports.Payout = mongoose_1.default.model('Payout', payoutSchema);
exports.default = exports.Payout;
//# sourceMappingURL=Payout.js.map