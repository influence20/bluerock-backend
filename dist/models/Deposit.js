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
exports.Deposit = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../config/constants");
const depositSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: Object.values(constants_1.DEPOSIT_STATUS),
        default: constants_1.DEPOSIT_STATUS.PENDING,
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
depositSchema.index({ userId: 1, status: 1 });
depositSchema.index({ currency: 1 });
depositSchema.index({ createdAt: -1 });
depositSchema.index({ txid: 1 }, { unique: true });
depositSchema.virtual('formattedAmount').get(function () {
    return `${this.amount} ${this.currency}`;
});
depositSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === constants_1.DEPOSIT_STATUS.CONFIRMED && !this.confirmedAt) {
            this.confirmedAt = new Date();
        }
        else if (this.status === constants_1.DEPOSIT_STATUS.REJECTED && !this.rejectedAt) {
            this.rejectedAt = new Date();
        }
    }
    next();
});
depositSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};
depositSchema.statics.findPending = function () {
    return this.find({ status: constants_1.DEPOSIT_STATUS.PENDING }).sort({ createdAt: 1 });
};
depositSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};
depositSchema.statics.findByCurrency = function (currency) {
    return this.find({ currency }).sort({ createdAt: -1 });
};
depositSchema.statics.getTotalByUser = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId), status: constants_1.DEPOSIT_STATUS.CONFIRMED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
};
depositSchema.statics.getStatsByPeriod = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: constants_1.DEPOSIT_STATUS.CONFIRMED
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
exports.Deposit = mongoose_1.default.model('Deposit', depositSchema);
exports.default = exports.Deposit;
//# sourceMappingURL=Deposit.js.map