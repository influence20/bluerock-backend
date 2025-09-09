import cron from 'cron';
import { Withdrawal } from '../models/Withdrawal';
import { logger } from '../utils/logger';
import { WITHDRAWAL_STATUS } from '../config/constants';

class PinExpiryJob {
  private job: cron.CronJob;

  constructor() {
    // Run every 5 minutes to check for expired PINs
    this.job = new cron.CronJob(
      '0 */5 * * * *',
      this.processExpiredPins.bind(this),
      null,
      true,
      'UTC'
    );

    logger.info('🔐 PIN expiry job started - checking every 5 minutes');
  }

  public async processExpiredPins(): Promise<void> {
    try {
      const now = new Date();
      
      // Find withdrawals with expired PINs
      const expiredWithdrawals = await Withdrawal.find({
        status: WITHDRAWAL_STATUS.PIN_REQUIRED,
        pinExpiresAt: { $lt: now },
        pin: { $exists: true, $ne: null },
      });

      if (expiredWithdrawals.length === 0) {
        return; // No expired PINs to process
      }

      logger.info(`🔐 Found ${expiredWithdrawals.length} expired PINs to process`);

      let processedCount = 0;

      for (const withdrawal of expiredWithdrawals) {
        try {
          // Clear the expired PIN
          withdrawal.pin = null;
          withdrawal.pinExpiresAt = null;
          withdrawal.status = WITHDRAWAL_STATUS.PENDING;

          await withdrawal.save();
          processedCount++;

          logger.info(`🔐 Cleared expired PIN for withdrawal ${withdrawal._id}`);
        } catch (error) {
          logger.error(`❌ Failed to clear expired PIN for withdrawal ${withdrawal._id}:`, error);
        }
      }

      logger.info(`✅ Processed ${processedCount} expired PINs`);
    } catch (error) {
      logger.error('❌ PIN expiry job failed:', error);
    }
  }

  public async clearExpiredPin(withdrawalId: string): Promise<boolean> {
    try {
      const withdrawal = await Withdrawal.findById(withdrawalId);
      
      if (!withdrawal) {
        logger.error(`Withdrawal ${withdrawalId} not found`);
        return false;
      }

      if (withdrawal.status !== WITHDRAWAL_STATUS.PIN_REQUIRED) {
        logger.error(`Withdrawal ${withdrawalId} is not in PIN_REQUIRED status`);
        return false;
      }

      const now = new Date();
      if (!withdrawal.pinExpiresAt || withdrawal.pinExpiresAt > now) {
        logger.error(`PIN for withdrawal ${withdrawalId} has not expired yet`);
        return false;
      }

      // Clear the expired PIN
      withdrawal.pin = null;
      withdrawal.pinExpiresAt = null;
      withdrawal.status = WITHDRAWAL_STATUS.PENDING;

      await withdrawal.save();

      logger.info(`🔐 Manually cleared expired PIN for withdrawal ${withdrawalId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to manually clear expired PIN for withdrawal ${withdrawalId}:`, error);
      return false;
    }
  }

  public async getExpiringPins(minutesFromNow: number = 5): Promise<any[]> {
    try {
      const expiryTime = new Date(Date.now() + minutesFromNow * 60 * 1000);
      
      const expiringWithdrawals = await Withdrawal.find({
        status: WITHDRAWAL_STATUS.PIN_REQUIRED,
        pinExpiresAt: { $lte: expiryTime, $gt: new Date() },
        pin: { $exists: true, $ne: null },
      }).populate('userId', 'firstName lastName email');

      return expiringWithdrawals;
    } catch (error) {
      logger.error('❌ Failed to get expiring PINs:', error);
      return [];
    }
  }

  public async getExpiredPinsCount(): Promise<number> {
    try {
      const now = new Date();
      
      const count = await Withdrawal.countDocuments({
        status: WITHDRAWAL_STATUS.PIN_REQUIRED,
        pinExpiresAt: { $lt: now },
        pin: { $exists: true, $ne: null },
      });

      return count;
    } catch (error) {
      logger.error('❌ Failed to get expired PINs count:', error);
      return 0;
    }
  }

  public getNextRunTime(): Date | null {
    return this.job.nextDate()?.toJSDate() || null;
  }

  public stop(): void {
    this.job.stop();
    logger.info('🔐 PIN expiry job stopped');
  }

  public start(): void {
    this.job.start();
    logger.info('🔐 PIN expiry job started');
  }
}

// Create and export the job instance
export const pinExpiryJob = new PinExpiryJob();
export default pinExpiryJob;