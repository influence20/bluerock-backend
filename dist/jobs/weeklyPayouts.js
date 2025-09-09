"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyPayoutJob = void 0;
const cron_1 = __importDefault(require("cron"));
const Investment_1 = require("../models/Investment");
const Payout_1 = require("../models/Payout");
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
const logger_1 = require("../utils/logger");
const constants_1 = require("../config/constants");
class WeeklyPayoutJob {
    constructor() {
        this.job = new cron_1.default.CronJob('0 9 * * 5', this.processWeeklyPayouts.bind(this), null, true, 'UTC');
        logger_1.logger.info('📅 Weekly payout job scheduled for Fridays at 9:00 AM UTC');
    }
    async processWeeklyPayouts() {
        try {
            logger_1.logger.info('🚀 Starting weekly payout processing...');
            const dueInvestments = await Investment_1.Investment.findDueForPayout();
            if (dueInvestments.length === 0) {
                logger_1.logger.info('✅ No investments due for payout today');
                return;
            }
            logger_1.logger.info(`📊 Found ${dueInvestments.length} investments due for payout`);
            let successCount = 0;
            let failureCount = 0;
            for (const investment of dueInvestments) {
                try {
                    await this.processInvestmentPayout(investment);
                    successCount++;
                }
                catch (error) {
                    logger_1.logger.error(`❌ Failed to process payout for investment ${investment._id}:`, error);
                    failureCount++;
                }
            }
            logger_1.logger.info(`✅ Weekly payout processing completed: ${successCount} successful, ${failureCount} failed`);
        }
        catch (error) {
            logger_1.logger.error('❌ Weekly payout job failed:', error);
        }
    }
    async processInvestmentPayout(investment) {
        try {
            const user = await User_1.User.findById(investment.userId);
            if (!user) {
                throw new Error(`User not found for investment ${investment._id}`);
            }
            const currentWeek = investment.totalPayouts + 1;
            const payout = new Payout_1.Payout({
                userId: investment.userId,
                investmentId: investment._id,
                amount: investment.weeklyPayout,
                week: currentWeek,
                status: constants_1.PAYOUT_STATUS.PAID,
                currency: 'USDT',
                scheduledDate: new Date(),
                paidAt: new Date(),
                txid: this.generateMockTxid(),
            });
            await payout.save();
            investment.processPayout();
            await investment.save();
            const nextPayoutDate = investment.remainingPayouts > 0
                ? investment.nextPayoutDate?.toLocaleDateString()
                : undefined;
            await emailService_1.emailService.sendWeeklyPayoutEmail(user.email, user.firstName, investment.weeklyPayout, 'USDT', payout.txid, nextPayoutDate);
            logger_1.logger.info(`✅ Processed payout for investment ${investment._id}, week ${currentWeek}`);
            if (investment.status === constants_1.INVESTMENT_STATUS.COMPLETED) {
                logger_1.logger.info(`🎉 Investment ${investment._id} completed after ${currentWeek} weeks`);
            }
        }
        catch (error) {
            logger_1.logger.error(`❌ Error processing payout for investment ${investment._id}:`, error);
            throw error;
        }
    }
    generateMockTxid() {
        return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    async processManualPayout(investmentId) {
        try {
            const investment = await Investment_1.Investment.findById(investmentId);
            if (!investment) {
                throw new Error('Investment not found');
            }
            if (investment.status !== constants_1.INVESTMENT_STATUS.ACTIVE) {
                throw new Error('Investment is not active');
            }
            if (investment.remainingPayouts <= 0) {
                throw new Error('No remaining payouts for this investment');
            }
            await this.processInvestmentPayout(investment);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Manual payout processing failed:', error);
            return false;
        }
    }
    getNextRunTime() {
        return this.job.nextDate()?.toJSDate() || null;
    }
    stop() {
        this.job.stop();
        logger_1.logger.info('📅 Weekly payout job stopped');
    }
    start() {
        this.job.start();
        logger_1.logger.info('📅 Weekly payout job started');
    }
}
exports.weeklyPayoutJob = new WeeklyPayoutJob();
exports.default = exports.weeklyPayoutJob;
//# sourceMappingURL=weeklyPayouts.js.map