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
exports.Withdrawal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../config/constants");
const withdrawalSchema = new mongoose_1.Schema({
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
        enum: Object.values(constants_1.WITHDRAWAL_STATUS),
        default: constants_1.WITHDRAWAL_STATUS.PENDING,
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
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ currency: 1 });
withdrawalSchema.index({ createdAt: -1 });
withdrawalSchema.index({ pinExpiresAt: 1 });
withdrawalSchema.virtual('formattedAmount').get(function () {
    return `${this.amount} ${this.currency}`;
});
withdrawalSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        const now = new Date();
        switch (this.status) {
            case constants_1.WITHDRAWAL_STATUS.APPROVED:
                if (!this.approvedAt)
                    this.approvedAt = now;
                break;
            case constants_1.WITHDRAWAL_STATUS.REJECTED:
                if (!this.rejectedAt)
                    this.rejectedAt = now;
                break;
            case constants_1.WITHDRAWAL_STATUS.COMPLETED:
                if (!this.completedAt)
                    this.completedAt = now;
                break;
        }
    }
    next();
});
withdrawalSchema.statics.findByUser = function (userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};
withdrawalSchema.statics.findPending = function () {
    return this.find({ status: constants_1.WITHDRAWAL_STATUS.PENDING }).sort({ createdAt: 1 });
};
withdrawalSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};
withdrawalSchema.statics.findExpiredPins = function () {
    return this.find({
        status: constants_1.WITHDRAWAL_STATUS.PIN_REQUIRED,
        pinExpiresAt: { $lt: new Date() },
        pin: { $exists: true, $ne: null },
    });
};
exports.Withdrawal = mongoose_1.default.model('Withdrawal', withdrawalSchema);
exports.default = exports.Withdrawal;
//# sourceMappingURL=Withdrawal.js.map