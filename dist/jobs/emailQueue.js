"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueueJob = void 0;
const cron_1 = __importDefault(require("cron"));
const EmailLog_1 = require("../models/EmailLog");
const emailService_1 = require("../services/emailService");
const logger_1 = require("../utils/logger");
class EmailQueueJob {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.job = new cron_1.default.CronJob('0 * * * * *', this.processEmailQueue.bind(this), null, true, 'UTC');
        logger_1.logger.info('📧 Email queue job started - processing every minute');
    }
    async addToQueue(to, subject, template, variables, priority = 5) {
        const queuedEmail = {
            to,
            subject,
            template,
            variables,
            priority,
            attempts: 0,
            maxAttempts: 3,
        };
        const insertIndex = this.queue.findIndex(email => email.priority > priority);
        if (insertIndex === -1) {
            this.queue.push(queuedEmail);
        }
        else {
            this.queue.splice(insertIndex, 0, queuedEmail);
        }
        logger_1.logger.info(`📧 Email added to queue: ${to} - ${subject}`);
    }
    async processEmailQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        try {
            const batchSize = Math.min(10, this.queue.length);
            const batch = this.queue.splice(0, batchSize);
            logger_1.logger.info(`📧 Processing email batch: ${batch.length} emails`);
            for (const email of batch) {
                await this.processEmail(email);
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Email queue processing error:', error);
        }
        finally {
            this.processing = false;
        }
    }
    async processEmail(email) {
        try {
            email.attempts++;
            const emailLog = new EmailLog_1.EmailLog({
                to: email.to,
                subject: email.subject,
                template: email.template,
                status: 'pending',
            });
            await emailLog.save();
            const success = await emailService_1.emailService.sendEmail({
                to: email.to,
                subject: email.subject,
                template: email.template,
                variables: email.variables,
            });
            if (success) {
                emailLog.status = 'sent';
                emailLog.sentAt = new Date();
                logger_1.logger.info(`✅ Email sent successfully: ${email.to} - ${email.subject}`);
            }
            else {
                emailLog.status = 'failed';
                emailLog.error = 'SMTP send failed';
                logger_1.logger.error(`❌ Email send failed: ${email.to} - ${email.subject}`);
                if (email.attempts < email.maxAttempts) {
                    email.priority += 1;
                    this.queue.push(email);
                    logger_1.logger.info(`🔄 Email queued for retry (attempt ${email.attempts}/${email.maxAttempts})`);
                }
            }
            await emailLog.save();
        }
        catch (error) {
            logger_1.logger.error(`❌ Error processing email for ${email.to}:`, error);
            if (email.attempts < email.maxAttempts) {
                email.priority += 1;
                this.queue.push(email);
            }
        }
    }
    async sendWelcomeEmail(userEmail, firstName, lastName) {
        await this.addToQueue(userEmail, 'Welcome to BlueRock Asset Management', 'welcome', {
            user: { firstName, lastName, email: userEmail },
        }, 1);
    }
    async sendDepositReceivedEmail(userEmail, firstName, amount, currency, txid) {
        await this.addToQueue(userEmail, 'Deposit Received - Processing Confirmation', 'deposit_received', {
            user: { firstName, lastName: '', email: userEmail },
            amount,
            currency,
            txid,
            date: new Date().toLocaleDateString(),
        }, 2);
    }
    async sendPlanActivatedEmail(userEmail, firstName, investmentAmount, weeklyPayout, nextPayoutDate) {
        await this.addToQueue(userEmail, 'Investment Plan Activated - Weekly Payouts Starting', 'plan_activated', {
            user: { firstName, lastName: '', email: userEmail },
            investmentAmount,
            weeklyPayout,
            nextPayoutDate,
        }, 2);
    }
    async sendWeeklyPayoutEmail(userEmail, firstName, amount, currency, txid, nextPayoutDate) {
        await this.addToQueue(userEmail, 'Weekly Payout Sent - BlueRock Asset Management', 'weekly_payout', {
            user: { firstName, lastName: '', email: userEmail },
            amount,
            currency,
            txid,
            date: new Date().toLocaleDateString(),
            nextPayoutDate,
        }, 3);
    }
    async sendPinIssuedEmail(userEmail, firstName, pin, expiryMinutes = 30) {
        await this.addToQueue(userEmail, 'Withdrawal PIN - BlueRock Asset Management', 'pin_issued', {
            user: { firstName, lastName: '', email: userEmail },
            pin,
            pinExpiry: `${expiryMinutes} minutes`,
        }, 1);
    }
    async sendPasswordResetEmail(userEmail, firstName, resetToken) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await this.addToQueue(userEmail, 'Password Reset Request - BlueRock Asset Management', 'password_reset', {
            user: { firstName, lastName: '', email: userEmail },
            resetLink,
        }, 1);
    }
    async sendWithdrawalApprovedEmail(userEmail, firstName, amount, currency, txid) {
        await this.addToQueue(userEmail, 'Withdrawal Approved - BlueRock Asset Management', 'withdrawal_approved', {
            user: { firstName, lastName: '', email: userEmail },
            amount,
            currency,
            txid,
            date: new Date().toLocaleDateString(),
        }, 2);
    }
    async sendWithdrawalRejectedEmail(userEmail, firstName, amount, currency, reason) {
        await this.addToQueue(userEmail, 'Withdrawal Request Rejected - BlueRock Asset Management', 'withdrawal_rejected', {
            user: { firstName, lastName: '', email: userEmail },
            amount,
            currency,
            reason,
            date: new Date().toLocaleDateString(),
        }, 2);
    }
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            nextRunTime: this.job.nextDate()?.toJSDate() || null,
        };
    }
    clearQueue() {
        this.queue = [];
        logger_1.logger.info('📧 Email queue cleared');
    }
    stop() {
        this.job.stop();
        logger_1.logger.info('📧 Email queue job stopped');
    }
    start() {
        this.job.start();
        logger_1.logger.info('📧 Email queue job started');
    }
}
exports.emailQueueJob = new EmailQueueJob();
exports.default = exports.emailQueueJob;
//# sourceMappingURL=emailQueue.js.map