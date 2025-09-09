import cron from 'cron';
import { EmailLog } from '../models/EmailLog';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';

interface QueuedEmail {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
  priority: number;
  attempts: number;
  maxAttempts: number;
}

class EmailQueueJob {
  private job: cron.CronJob;
  private queue: QueuedEmail[] = [];
  private processing = false;

  constructor() {
    // Process email queue every minute
    this.job = new cron.CronJob(
      '0 * * * * *',
      this.processEmailQueue.bind(this),
      null,
      true,
      'UTC'
    );

    logger.info('📧 Email queue job started - processing every minute');
  }

  public async addToQueue(
    to: string,
    subject: string,
    template: string,
    variables: Record<string, any>,
    priority: number = 5
  ): Promise<void> {
    const queuedEmail: QueuedEmail = {
      to,
      subject,
      template,
      variables,
      priority,
      attempts: 0,
      maxAttempts: 3,
    };

    // Insert based on priority (lower number = higher priority)
    const insertIndex = this.queue.findIndex(email => email.priority > priority);
    if (insertIndex === -1) {
      this.queue.push(queuedEmail);
    } else {
      this.queue.splice(insertIndex, 0, queuedEmail);
    }

    logger.info(`📧 Email added to queue: ${to} - ${subject}`);
  }

  private async processEmailQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Process up to 10 emails per batch to avoid overwhelming the SMTP server
      const batchSize = Math.min(10, this.queue.length);
      const batch = this.queue.splice(0, batchSize);

      logger.info(`📧 Processing email batch: ${batch.length} emails`);

      for (const email of batch) {
        await this.processEmail(email);
      }

    } catch (error) {
      logger.error('❌ Email queue processing error:', error);
    } finally {
      this.processing = false;
    }
  }

  private async processEmail(email: QueuedEmail): Promise<void> {
    try {
      email.attempts++;

      // Create email log entry
      const emailLog = new EmailLog({
        to: email.to,
        subject: email.subject,
        template: email.template,
        status: 'pending',
      });

      await emailLog.save();

      // Send email
      const success = await emailService.sendEmail({
        to: email.to,
        subject: email.subject,
        template: email.template,
        variables: email.variables,
      });

      // Update email log
      if (success) {
        emailLog.status = 'sent';
        emailLog.sentAt = new Date();
        logger.info(`✅ Email sent successfully: ${email.to} - ${email.subject}`);
      } else {
        emailLog.status = 'failed';
        emailLog.error = 'SMTP send failed';
        logger.error(`❌ Email send failed: ${email.to} - ${email.subject}`);
        
        // Retry if attempts remaining
        if (email.attempts < email.maxAttempts) {
          // Add back to queue with lower priority
          email.priority += 1;
          this.queue.push(email);
          logger.info(`🔄 Email queued for retry (attempt ${email.attempts}/${email.maxAttempts})`);
        }
      }

      await emailLog.save();

    } catch (error) {
      logger.error(`❌ Error processing email for ${email.to}:`, error);
      
      // Retry if attempts remaining
      if (email.attempts < email.maxAttempts) {
        email.priority += 1;
        this.queue.push(email);
      }
    }
  }

  public async sendWelcomeEmail(userEmail: string, firstName: string, lastName: string): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Welcome to BlueRock Asset Management',
      'welcome',
      {
        user: { firstName, lastName, email: userEmail },
      },
      1 // High priority
    );
  }

  public async sendDepositReceivedEmail(
    userEmail: string,
    firstName: string,
    amount: number,
    currency: string,
    txid: string
  ): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Deposit Received - Processing Confirmation',
      'deposit_received',
      {
        user: { firstName, lastName: '', email: userEmail },
        amount,
        currency,
        txid,
        date: new Date().toLocaleDateString(),
      },
      2 // High priority
    );
  }

  public async sendPlanActivatedEmail(
    userEmail: string,
    firstName: string,
    investmentAmount: number,
    weeklyPayout: number,
    nextPayoutDate: string
  ): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Investment Plan Activated - Weekly Payouts Starting',
      'plan_activated',
      {
        user: { firstName, lastName: '', email: userEmail },
        investmentAmount,
        weeklyPayout,
        nextPayoutDate,
      },
      2 // High priority
    );
  }

  public async sendWeeklyPayoutEmail(
    userEmail: string,
    firstName: string,
    amount: number,
    currency: string,
    txid: string,
    nextPayoutDate?: string
  ): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Weekly Payout Sent - BlueRock Asset Management',
      'weekly_payout',
      {
        user: { firstName, lastName: '', email: userEmail },
        amount,
        currency,
        txid,
        date: new Date().toLocaleDateString(),
        nextPayoutDate,
      },
      3 // Medium priority
    );
  }

  public async sendPinIssuedEmail(
    userEmail: string,
    firstName: string,
    pin: string,
    expiryMinutes: number = 30
  ): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Withdrawal PIN - BlueRock Asset Management',
      'pin_issued',
      {
        user: { firstName, lastName: '', email: userEmail },
        pin,
        pinExpiry: `${expiryMinutes} minutes`,
      },
      1 // High priority (security-related)
    );
  }

  public async sendPasswordResetEmail(
    userEmail: string,
    firstName: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await this.addToQueue(
      userEmail,
      'Password Reset Request - BlueRock Asset Management',
      'password_reset',
      {
        user: { firstName, lastName: '', email: userEmail },
        resetLink,
      },
      1 // High priority (security-related)
    );
  }

  public async sendWithdrawalApprovedEmail(
    userEmail: string,
    firstName: string,
    amount: number,
    currency: string,
    txid: string
  ): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Withdrawal Approved - BlueRock Asset Management',
      'withdrawal_approved',
      {
        user: { firstName, lastName: '', email: userEmail },
        amount,
        currency,
        txid,
        date: new Date().toLocaleDateString(),
      },
      2 // High priority
    );
  }

  public async sendWithdrawalRejectedEmail(
    userEmail: string,
    firstName: string,
    amount: number,
    currency: string,
    reason: string
  ): Promise<void> {
    await this.addToQueue(
      userEmail,
      'Withdrawal Request Rejected - BlueRock Asset Management',
      'withdrawal_rejected',
      {
        user: { firstName, lastName: '', email: userEmail },
        amount,
        currency,
        reason,
        date: new Date().toLocaleDateString(),
      },
      2 // High priority
    );
  }

  public getQueueStatus(): {
    queueLength: number;
    processing: boolean;
    nextRunTime: Date | null;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      nextRunTime: this.job.nextDate()?.toJSDate() || null,
    };
  }

  public clearQueue(): void {
    this.queue = [];
    logger.info('📧 Email queue cleared');
  }

  public stop(): void {
    this.job.stop();
    logger.info('📧 Email queue job stopped');
  }

  public start(): void {
    this.job.start();
    logger.info('📧 Email queue job started');
  }
}

// Create and export the job instance
export const emailQueueJob = new EmailQueueJob();
export default emailQueueJob;