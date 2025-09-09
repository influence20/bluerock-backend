declare class EmailQueueJob {
    private job;
    private queue;
    private processing;
    constructor();
    addToQueue(to: string, subject: string, template: string, variables: Record<string, any>, priority?: number): Promise<void>;
    private processEmailQueue;
    private processEmail;
    sendWelcomeEmail(userEmail: string, firstName: string, lastName: string): Promise<void>;
    sendDepositReceivedEmail(userEmail: string, firstName: string, amount: number, currency: string, txid: string): Promise<void>;
    sendPlanActivatedEmail(userEmail: string, firstName: string, investmentAmount: number, weeklyPayout: number, nextPayoutDate: string): Promise<void>;
    sendWeeklyPayoutEmail(userEmail: string, firstName: string, amount: number, currency: string, txid: string, nextPayoutDate?: string): Promise<void>;
    sendPinIssuedEmail(userEmail: string, firstName: string, pin: string, expiryMinutes?: number): Promise<void>;
    sendPasswordResetEmail(userEmail: string, firstName: string, resetToken: string): Promise<void>;
    sendWithdrawalApprovedEmail(userEmail: string, firstName: string, amount: number, currency: string, txid: string): Promise<void>;
    sendWithdrawalRejectedEmail(userEmail: string, firstName: string, amount: number, currency: string, reason: string): Promise<void>;
    getQueueStatus(): {
        queueLength: number;
        processing: boolean;
        nextRunTime: Date | null;
    };
    clearQueue(): void;
    stop(): void;
    start(): void;
}
export declare const emailQueueJob: EmailQueueJob;
export default emailQueueJob;
//# sourceMappingURL=emailQueue.d.ts.map