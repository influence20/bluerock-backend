import cron from 'cron';
import { Investment } from '../models/Investment';
import { Payout } from '../models/Payout';
import { User } from '../models/User';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import { INVESTMENT_STATUS, PAYOUT_STATUS } from '../config/constants';

class WeeklyPayoutJob {
  private job: cron.CronJob;

  constructor() {
    // Run every Friday at 9:00 AM UTC
    this.job = new cron.CronJob(
      '0 9 * * 5',
      this.processWeeklyPayouts.bind(this),
      null,
      true,
      'UTC'
    );

    logger.info('📅 Weekly payout job scheduled for Fridays at 9:00 AM UTC');
  }

  public async processWeeklyPayouts(): Promise<void> {
    try {
      logger.info('🚀 Starting weekly payout processing...');

      // Find all investments due for payout
      const dueInvestments = await Investment.findDueForPayout();
      
      if (dueInvestments.length === 0) {
        logger.info('✅ No investments due for payout today');
        return;
      }

      logger.info(`📊 Found ${dueInvestments.length} investments due for payout`);

      let successCount = 0;
      let failureCount = 0;

      for (const investment of dueInvestments) {
        try {
          await this.processInvestmentPayout(investment);
          successCount++;
        } catch (error) {
          logger.error(`❌ Failed to process payout for investment ${investment._id}:`, error);
          failureCount++;
        }
      }

      logger.info(`✅ Weekly payout processing completed: ${successCount} successful, ${failureCount} failed`);
    } catch (error) {
      logger.error('❌ Weekly payout job failed:', error);
    }
  }

  private async processInvestmentPayout(investment: any): Promise<void> {
    try {
      // Get user details
      const user = await User.findById(investment.userId);
      if (!user) {
        throw new Error(`User not found for investment ${investment._id}`);
      }

      // Calculate current week number
      const currentWeek = investment.totalPayouts + 1;

      // Create payout record
      const payout = new Payout({
        userId: investment.userId,
        investmentId: investment._id,
        amount: investment.weeklyPayout,
        week: currentWeek,
        status: PAYOUT_STATUS.PAID, // In real implementation, this would be PENDING until blockchain confirmation
        currency: 'USDT', // Default currency for payouts
        scheduledDate: new Date(),
        paidAt: new Date(),
        // In real implementation, you would integrate with crypto payment gateway here
        txid: this.generateMockTxid(), // Mock transaction ID
      });

      await payout.save();

      // Update investment
      investment.processPayout();
      await investment.save();

      // Send email notification
      const nextPayoutDate = investment.remainingPayouts > 0 
        ? investment.nextPayoutDate?.toLocaleDateString()
        : undefined;

      await emailService.sendWeeklyPayoutEmail(
        user.email,
        user.firstName,
        investment.weeklyPayout,
        'USDT',
        payout.txid!,
        nextPayoutDate
      );

      logger.info(`✅ Processed payout for investment ${investment._id}, week ${currentWeek}`);

      // If investment is completed, send completion notification
      if (investment.status === INVESTMENT_STATUS.COMPLETED) {
        logger.info(`🎉 Investment ${investment._id} completed after ${currentWeek} weeks`);
      }

    } catch (error) {
      logger.error(`❌ Error processing payout for investment ${investment._id}:`, error);
      throw error;
    }
  }

  private generateMockTxid(): string {
    // Generate a mock transaction ID for demonstration
    // In real implementation, this would come from the crypto payment gateway
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  public async processManualPayout(investmentId: string): Promise<boolean> {
    try {
      const investment = await Investment.findById(investmentId);
      if (!investment) {
        throw new Error('Investment not found');
      }

      if (investment.status !== INVESTMENT_STATUS.ACTIVE) {
        throw new Error('Investment is not active');
      }

      if (investment.remainingPayouts <= 0) {
        throw new Error('No remaining payouts for this investment');
      }

      await this.processInvestmentPayout(investment);
      return true;
    } catch (error) {
      logger.error('Manual payout processing failed:', error);
      return false;
    }
  }

  public getNextRunTime(): Date | null {
    return this.job.nextDate()?.toJSDate() || null;
  }

  public stop(): void {
    this.job.stop();
    logger.info('📅 Weekly payout job stopped');
  }

  public start(): void {
    this.job.start();
    logger.info('📅 Weekly payout job started');
  }
}

// Create and export the job instance
export const weeklyPayoutJob = new WeeklyPayoutJob();
export default weeklyPayoutJob;