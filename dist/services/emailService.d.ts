import { EmailData } from '../types';
declare class EmailService {
    private transporter;
    constructor();
    private verifyConnection;
    private getWelcomeTemplate;
    private getDepositReceivedTemplate;
    private getPlanActivatedTemplate;
    private getWeeklyPayoutTemplate;
    private getPinIssuedTemplate;
    private getPasswordResetTemplate;
    private renderTemplate;
    sendEmail(emailData: EmailData): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, firstName: string, lastName: string): Promise<boolean>;
    sendDepositReceivedEmail(userEmail: string, firstName: string, amount: number, currency: string, txid: string): Promise<boolean>;
    sendPlanActivatedEmail(userEmail: string, firstName: string, investmentAmount: number, weeklyPayout: number, nextPayoutDate: string): Promise<boolean>;
    sendWeeklyPayoutEmail(userEmail: string, firstName: string, amount: number, currency: string, txid: string, nextPayoutDate?: string): Promise<boolean>;
    sendPinIssuedEmail(userEmail: string, firstName: string, pin: string, expiryMinutes?: number): Promise<boolean>;
    sendPasswordResetEmail(userEmail: string, firstName: string, resetToken: string): Promise<boolean>;
}
export declare const emailService: EmailService;
export default emailService;
//# sourceMappingURL=emailService.d.ts.map