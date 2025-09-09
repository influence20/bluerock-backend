"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinExpiryJob = void 0;
const cron_1 = __importDefault(require("cron"));
const Withdrawal_1 = require("../models/Withdrawal");
const logger_1 = require("../utils/logger");
const constants_1 = require("../config/constants");
class PinExpiryJob {
    constructor() {
        this.job = new cron_1.default.CronJob('0 */5 * * * *', this.processExpiredPins.bind(this), null, true, 'UTC');
        logger_1.logger.info('🔐 PIN expiry job started - checking every 5 minutes');
    }
    async processExpiredPins() {
        try {
            const now = new Date();
            const expiredWithdrawals = await Withdrawal_1.Withdrawal.find({
                status: constants_1.WITHDRAWAL_STATUS.PIN_REQUIRED,
                pinExpiresAt: { $lt: now },
                pin: { $exists: true, $ne: null },
            });
            if (expiredWithdrawals.length === 0) {
                return;
            }
            logger_1.logger.info(`🔐 Found ${expiredWithdrawals.length} expired PINs to process`);
            let processedCount = 0;
            for (const withdrawal of expiredWithdrawals) {
                try {
                    withdrawal.pin = null;
                    withdrawal.pinExpiresAt = null;
                    withdrawal.status = constants_1.WITHDRAWAL_STATUS.PENDING;
                    await withdrawal.save();
                    processedCount++;
                    logger_1.logger.info(`🔐 Cleared expired PIN for withdrawal ${withdrawal._id}`);
                }
                catch (error) {
                    logger_1.logger.error(`❌ Failed to clear expired PIN for withdrawal ${withdrawal._id}:`, error);
                }
            }
            logger_1.logger.info(`✅ Processed ${processedCount} expired PINs`);
        }
        catch (error) {
            logger_1.logger.error('❌ PIN expiry job failed:', error);
        }
    }
    async clearExpiredPin(withdrawalId) {
        try {
            const withdrawal = await Withdrawal_1.Withdrawal.findById(withdrawalId);
            if (!withdrawal) {
                logger_1.logger.error(`Withdrawal ${withdrawalId} not found`);
                return false;
            }
            if (withdrawal.status !== constants_1.WITHDRAWAL_STATUS.PIN_REQUIRED) {
                logger_1.logger.error(`Withdrawal ${withdrawalId} is not in PIN_REQUIRED status`);
                return false;
            }
            const now = new Date();
            if (!withdrawal.pinExpiresAt || withdrawal.pinExpiresAt > now) {
                logger_1.logger.error(`PIN for withdrawal ${withdrawalId} has not expired yet`);
                return false;
            }
            withdrawal.pin = null;
            withdrawal.pinExpiresAt = null;
            withdrawal.status = constants_1.WITHDRAWAL_STATUS.PENDING;
            await withdrawal.save();
            logger_1.logger.info(`🔐 Manually cleared expired PIN for withdrawal ${withdrawalId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to manually clear expired PIN for withdrawal ${withdrawalId}:`, error);
            return false;
        }
    }
    async getExpiringPins(minutesFromNow = 5) {
        try {
            const expiryTime = new Date(Date.now() + minutesFromNow * 60 * 1000);
            const expiringWithdrawals = await Withdrawal_1.Withdrawal.find({
                status: constants_1.WITHDRAWAL_STATUS.PIN_REQUIRED,
                pinExpiresAt: { $lte: expiryTime, $gt: new Date() },
                pin: { $exists: true, $ne: null },
            }).populate('userId', 'firstName lastName email');
            return expiringWithdrawals;
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to get expiring PINs:', error);
            return [];
        }
    }
    async getExpiredPinsCount() {
        try {
            const now = new Date();
            const count = await Withdrawal_1.Withdrawal.countDocuments({
                status: constants_1.WITHDRAWAL_STATUS.PIN_REQUIRED,
                pinExpiresAt: { $lt: now },
                pin: { $exists: true, $ne: null },
            });
            return count;
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to get expired PINs count:', error);
            return 0;
        }
    }
    getNextRunTime() {
        return this.job.nextDate()?.toJSDate() || null;
    }
    stop() {
        this.job.stop();
        logger_1.logger.info('🔐 PIN expiry job stopped');
    }
    start() {
        this.job.start();
        logger_1.logger.info('🔐 PIN expiry job started');
    }
}
exports.pinExpiryJob = new PinExpiryJob();
exports.default = exports.pinExpiryJob;
//# sourceMappingURL=pinExpiry.js.map