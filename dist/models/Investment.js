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
exports.Investment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../config/constants");
const date_fns_1 = require("date-fns");
const investmentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    depositId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Deposit',
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
        min: constants_1.INVESTMENT_CONFIG.MIN_INVESTMENT,
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
        default: constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS,
    },
    status: {
        type: String,
        enum: Object.values(constants_1.INVESTMENT_STATUS),
        default: constants_1.INVESTMENT_STATUS.PENDING,
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
investmentSchema.index({ userId: 1, status: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ nextPayoutDate: 1 });
investmentSchema.index({ createdAt: -1 });
investmentSchema.virtual('progressPercentage').get(function () {
    const completedPayouts = constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS - this.remainingPayouts;
    return Math.round((completedPayouts / constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS) * 100);
});
investmentSchema.virtual('totalExpectedReturn').get(function () {
    return this.weeklyPayout * constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS;
});
investmentSchema.virtual('profit').get(function () {
    return this.totalExpectedReturn - this.amount;
});
investmentSchema.virtual('roi').get(function () {
    return ((this.profit / this.amount) * 100);
});
investmentSchema.pre('save', function (next) {
    if (!this.weeklyPayout && this.amount) {
        this.weeklyPayout = (this.amount / constants_1.INVESTMENT_CONFIG.FORMULA_DIVISOR) * constants_1.INVESTMENT_CONFIG.FORMULA_MULTIPLIER;
    }
    if (this.isModified('status') && this.status === constants_1.INVESTMENT_STATUS.ACTIVE) {
        if (!this.startDate) {
            this.startDate = new Date();
            this.endDate = (0, date_fns_1.addWeeks)(this.startDate, constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS);
            const nextFriday = this.getNextFriday(this.startDate);
            this.nextPayoutDate = nextFriday;
        }
    }
    if (this.remainingPayouts <= 0 && this.status === constants_1.INVESTMENT_STATUS.ACTIVE) {
        this.status = constants_1.INVESTMENT_STATUS.COMPLETED;
        this.nextPayoutDate = null;
    }
    next();
});
investmentSchema.methods.getNextFriday = function (fromDate) {
    const date = new Date(fromDate);
    const daysUntilFriday = (5 - date.getDay() + 7) % 7;
    return (0, date_fns_1.addDays)(date, daysUntilFriday || 7);
};
investmentSchema.methods.processPayout = function () {
    if (this.remainingPayouts > 0) {
        this.totalPayouts += 1;
        this.remainingPayouts -= 1;
        if (this.remainingPayouts > 0) {
            this.nextPayoutDate = (0, date_fns_1.addWeeks)(this.nextPayoutDate, 1);
        }
        else {
            this.status = constants_1.INVESTMENT_STATUS.COMPLETED;
            this.nextPayoutDate = null;
        }
    }
};
investmentSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};
investmentSchema.statics.findActive = function () {
    return this.find({ status: constants_1.INVESTMENT_STATUS.ACTIVE }).sort({ nextPayoutDate: 1 });
};
investmentSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};
investmentSchema.statics.findDueForPayout = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.find({
        status: constants_1.INVESTMENT_STATUS.ACTIVE,
        nextPayoutDate: { $lte: today },
        remainingPayouts: { $gt: 0 }
    });
};
investmentSchema.statics.getTotalByUser = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalInvested: { $sum: '$amount' },
                totalPayouts: { $sum: { $multiply: ['$totalPayouts', '$weeklyPayout'] } },
                activeInvestments: {
                    $sum: { $cond: [{ $eq: ['$status', constants_1.INVESTMENT_STATUS.ACTIVE] }, 1, 0] }
                }
            }
        }
    ]);
};
investmentSchema.statics.getStatsByPeriod = function (startDate, endDate) {
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
investmentSchema.statics.calculateWeeklyPayout = function (amount) {
    return (amount / constants_1.INVESTMENT_CONFIG.FORMULA_DIVISOR) * constants_1.INVESTMENT_CONFIG.FORMULA_MULTIPLIER;
};
exports.Investment = mongoose_1.default.model('Investment', investmentSchema);
exports.default = exports.Investment;
//# sourceMappingURL=Investment.js.map