"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mjml_1 = __importDefault(require("mjml"));
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransporter({
            host: constants_1.EMAIL_CONFIG.host,
            port: constants_1.EMAIL_CONFIG.port,
            secure: constants_1.EMAIL_CONFIG.secure,
            auth: constants_1.EMAIL_CONFIG.auth,
            tls: {
                rejectUnauthorized: false,
            },
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger_1.logger.info('✅ Email service connected successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Email service connection failed:', error);
        }
    }
    getWelcomeTemplate(variables) {
        return `
      <mjml>
        <mj-head>
          <mj-title>Welcome to BlueRock Asset Management</mj-title>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#0052CC" padding="20px 0">
            <mj-column>
              <mj-text align="center" color="white" font-size="28px" font-weight="bold">
                BlueRock Asset Management
              </mj-text>
              <mj-text align="center" color="white" font-size="16px">
                Professional Investment Solutions
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="white" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="600" color="#333333">
                Welcome, ${variables.user?.firstName}!
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Thank you for joining BlueRock Asset Management. Your account has been successfully created and you're now ready to start your investment journey with us.
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Here's what you can do next:
              </mj-text>
              
              <mj-text font-size="14px" line-height="20px" color="#666666">
                • Make your first deposit using cryptocurrency<br/>
                • Explore our investment plans and calculate returns<br/>
                • Set up your withdrawal preferences<br/>
                • Contact our 24/7 support team if you need help
              </mj-text>
              
              <mj-button background-color="#0052CC" color="white" font-size="16px" font-weight="600" href="${process.env.FRONTEND_URL}/dashboard" padding="15px 30px">
                Access Your Dashboard
              </mj-button>
              
              <mj-text font-size="14px" color="#888888">
                If you have any questions, our support team is available 24/7 via live chat or email at ${constants_1.EMAIL_CONFIG.auth.user}.
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="#f8f9fa" padding="20px">
            <mj-column>
              <mj-text align="center" font-size="12px" color="#888888">
                © 2025 BlueRock Asset Management. All rights reserved.<br/>
                This email was sent to ${variables.user?.email}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    }
    getDepositReceivedTemplate(variables) {
        return `
      <mjml>
        <mj-head>
          <mj-title>Deposit Received - BlueRock Asset Management</mj-title>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#0052CC" padding="20px 0">
            <mj-column>
              <mj-text align="center" color="white" font-size="28px" font-weight="bold">
                BlueRock Asset Management
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="white" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="600" color="#333333">
                Deposit Received
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Hello ${variables.user?.firstName},
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                We have received your deposit and it's currently being processed. Here are the details:
              </mj-text>
              
              <mj-table>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Amount:</td>
                  <td style="padding: 10px 0;">${variables.amount} ${variables.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 10px 0; font-family: monospace;">${variables.txid}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Date:</td>
                  <td style="padding: 10px 0;">${variables.date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Status:</td>
                  <td style="padding: 10px 0; color: #FFC107;">Pending Confirmation</td>
                </tr>
              </mj-table>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Your deposit will be confirmed once it receives the required number of blockchain confirmations. You'll receive another email once your investment plan is activated.
              </mj-text>
              
              <mj-button background-color="#0052CC" color="white" font-size="16px" font-weight="600" href="${process.env.FRONTEND_URL}/dashboard/deposits" padding="15px 30px">
                View Deposit Status
              </mj-button>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="#f8f9fa" padding="20px">
            <mj-column>
              <mj-text align="center" font-size="12px" color="#888888">
                © 2025 BlueRock Asset Management. All rights reserved.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    }
    getPlanActivatedTemplate(variables) {
        return `
      <mjml>
        <mj-head>
          <mj-title>Investment Plan Activated - BlueRock Asset Management</mj-title>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#28A745" padding="20px 0">
            <mj-column>
              <mj-text align="center" color="white" font-size="28px" font-weight="bold">
                🎉 Investment Plan Activated!
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="white" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="600" color="#333333">
                Congratulations, ${variables.user?.firstName}!
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Your investment plan has been successfully activated. You'll start receiving weekly payouts every Friday for the next 8 weeks.
              </mj-text>
              
              <mj-table>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Investment Amount:</td>
                  <td style="padding: 10px 0;">${variables.investmentAmount} USD</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Weekly Payout:</td>
                  <td style="padding: 10px 0; color: #28A745; font-weight: 600;">${variables.weeklyPayout} USD</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Total Return:</td>
                  <td style="padding: 10px 0;">${(variables.weeklyPayout || 0) * 8} USD</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Next Payout:</td>
                  <td style="padding: 10px 0;">${variables.nextPayoutDate}</td>
                </tr>
              </mj-table>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Your payouts will be sent directly to your preferred cryptocurrency wallet. You can track all payments in your dashboard.
              </mj-text>
              
              <mj-button background-color="#28A745" color="white" font-size="16px" font-weight="600" href="${process.env.FRONTEND_URL}/dashboard/investments" padding="15px 30px">
                View Investment Details
              </mj-button>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="#f8f9fa" padding="20px">
            <mj-column>
              <mj-text align="center" font-size="12px" color="#888888">
                © 2025 BlueRock Asset Management. All rights reserved.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    }
    getWeeklyPayoutTemplate(variables) {
        return `
      <mjml>
        <mj-head>
          <mj-title>Weekly Payout Sent - BlueRock Asset Management</mj-title>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#0052CC" padding="20px 0">
            <mj-column>
              <mj-text align="center" color="white" font-size="28px" font-weight="bold">
                💰 Weekly Payout Sent
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="white" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="600" color="#333333">
                Your Weekly Payout is Here!
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Hello ${variables.user?.firstName},
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Your weekly payout has been successfully sent to your wallet. Here are the transaction details:
              </mj-text>
              
              <mj-table>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Payout Amount:</td>
                  <td style="padding: 10px 0; color: #28A745; font-weight: 600;">${variables.amount} ${variables.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Transaction ID:</td>
                  <td style="padding: 10px 0; font-family: monospace;">${variables.txid}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: 600;">Date:</td>
                  <td style="padding: 10px 0;">${variables.date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Next Payout:</td>
                  <td style="padding: 10px 0;">${variables.nextPayoutDate || 'Investment Complete'}</td>
                </tr>
              </mj-table>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                The funds should appear in your wallet within a few minutes. You can verify the transaction on the blockchain using the transaction ID above.
              </mj-text>
              
              <mj-button background-color="#0052CC" color="white" font-size="16px" font-weight="600" href="${process.env.FRONTEND_URL}/dashboard/payouts" padding="15px 30px">
                View All Payouts
              </mj-button>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="#f8f9fa" padding="20px">
            <mj-column>
              <mj-text align="center" font-size="12px" color="#888888">
                © 2025 BlueRock Asset Management. All rights reserved.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    }
    getPinIssuedTemplate(variables) {
        return `
      <mjml>
        <mj-head>
          <mj-title>Withdrawal PIN - BlueRock Asset Management</mj-title>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#FFC107" padding="20px 0">
            <mj-column>
              <mj-text align="center" color="white" font-size="28px" font-weight="bold">
                🔐 Withdrawal PIN
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="white" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="600" color="#333333">
                Your Withdrawal PIN
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Hello ${variables.user?.firstName},
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Here is your one-time PIN for withdrawal confirmation:
              </mj-text>
              
              <mj-section background-color="#f8f9fa" padding="20px">
                <mj-column>
                  <mj-text align="center" font-size="32px" font-weight="bold" color="#0052CC" font-family="monospace">
                    ${variables.pin}
                  </mj-text>
                </mj-column>
              </mj-section>
              
              <mj-text font-size="16px" line-height="24px" color="#DC3545" font-weight="600">
                ⚠️ Important Security Information:
              </mj-text>
              
              <mj-text font-size="14px" line-height="20px" color="#666666">
                • This PIN expires in ${variables.pinExpiry}<br/>
                • Use this PIN only once for your withdrawal request<br/>
                • Never share this PIN with anyone<br/>
                • Our support team will never ask for your PIN<br/>
                • If you didn't request this PIN, contact us immediately
              </mj-text>
              
              <mj-button background-color="#FFC107" color="white" font-size="16px" font-weight="600" href="${process.env.FRONTEND_URL}/dashboard/withdrawals" padding="15px 30px">
                Complete Withdrawal
              </mj-button>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="#f8f9fa" padding="20px">
            <mj-column>
              <mj-text align="center" font-size="12px" color="#888888">
                © 2025 BlueRock Asset Management. All rights reserved.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    }
    getPasswordResetTemplate(variables) {
        return `
      <mjml>
        <mj-head>
          <mj-title>Password Reset - BlueRock Asset Management</mj-title>
          <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
          <mj-attributes>
            <mj-all font-family="Inter, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f5f5f5">
          <mj-section background-color="#0052CC" padding="20px 0">
            <mj-column>
              <mj-text align="center" color="white" font-size="28px" font-weight="bold">
                BlueRock Asset Management
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="white" padding="40px 20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="600" color="#333333">
                Password Reset Request
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                Hello ${variables.user?.firstName},
              </mj-text>
              
              <mj-text font-size="16px" line-height="24px" color="#666666">
                We received a request to reset your password. Click the button below to create a new password:
              </mj-text>
              
              <mj-button background-color="#0052CC" color="white" font-size="16px" font-weight="600" href="${variables.resetLink}" padding="15px 30px">
                Reset Password
              </mj-button>
              
              <mj-text font-size="14px" line-height="20px" color="#666666">
                This link will expire in 24 hours for security reasons. If you didn't request this password reset, please ignore this email or contact our support team.
              </mj-text>
              
              <mj-text font-size="12px" line-height="16px" color="#888888">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                ${variables.resetLink}
              </mj-text>
            </mj-column>
          </mj-section>
          
          <mj-section background-color="#f8f9fa" padding="20px">
            <mj-column>
              <mj-text align="center" font-size="12px" color="#888888">
                © 2025 BlueRock Asset Management. All rights reserved.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    }
    renderTemplate(template) {
        try {
            const { html } = (0, mjml_1.default)(template);
            const text = html
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            return { html, text };
        }
        catch (error) {
            logger_1.logger.error('Error rendering email template:', error);
            throw new Error('Failed to render email template');
        }
    }
    async sendEmail(emailData) {
        try {
            let template;
            switch (emailData.template) {
                case 'welcome':
                    template = this.getWelcomeTemplate(emailData.variables);
                    break;
                case 'deposit_received':
                    template = this.getDepositReceivedTemplate(emailData.variables);
                    break;
                case 'plan_activated':
                    template = this.getPlanActivatedTemplate(emailData.variables);
                    break;
                case 'weekly_payout':
                    template = this.getWeeklyPayoutTemplate(emailData.variables);
                    break;
                case 'pin_issued':
                    template = this.getPinIssuedTemplate(emailData.variables);
                    break;
                case 'password_reset':
                    template = this.getPasswordResetTemplate(emailData.variables);
                    break;
                default:
                    throw new Error(`Unknown email template: ${emailData.template}`);
            }
            const { html, text } = this.renderTemplate(template);
            const mailOptions = {
                from: `"BlueRock Asset Management" <${constants_1.EMAIL_CONFIG.auth.user}>`,
                to: emailData.to,
                subject: emailData.subject,
                html,
                text,
            };
            const result = await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email sent successfully to ${emailData.to}`, {
                messageId: result.messageId,
                template: emailData.template,
            });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(userEmail, firstName, lastName) {
        return this.sendEmail({
            to: userEmail,
            subject: 'Welcome to BlueRock Asset Management',
            template: 'welcome',
            variables: {
                user: { firstName, lastName, email: userEmail },
            },
        });
    }
    async sendDepositReceivedEmail(userEmail, firstName, amount, currency, txid) {
        return this.sendEmail({
            to: userEmail,
            subject: 'Deposit Received - Processing Confirmation',
            template: 'deposit_received',
            variables: {
                user: { firstName, lastName: '', email: userEmail },
                amount,
                currency,
                txid,
                date: new Date().toLocaleDateString(),
            },
        });
    }
    async sendPlanActivatedEmail(userEmail, firstName, investmentAmount, weeklyPayout, nextPayoutDate) {
        return this.sendEmail({
            to: userEmail,
            subject: 'Investment Plan Activated - Weekly Payouts Starting',
            template: 'plan_activated',
            variables: {
                user: { firstName, lastName: '', email: userEmail },
                investmentAmount,
                weeklyPayout,
                nextPayoutDate,
            },
        });
    }
    async sendWeeklyPayoutEmail(userEmail, firstName, amount, currency, txid, nextPayoutDate) {
        return this.sendEmail({
            to: userEmail,
            subject: 'Weekly Payout Sent - BlueRock Asset Management',
            template: 'weekly_payout',
            variables: {
                user: { firstName, lastName: '', email: userEmail },
                amount,
                currency,
                txid,
                date: new Date().toLocaleDateString(),
                nextPayoutDate,
            },
        });
    }
    async sendPinIssuedEmail(userEmail, firstName, pin, expiryMinutes = 30) {
        return this.sendEmail({
            to: userEmail,
            subject: 'Withdrawal PIN - BlueRock Asset Management',
            template: 'pin_issued',
            variables: {
                user: { firstName, lastName: '', email: userEmail },
                pin,
                pinExpiry: `${expiryMinutes} minutes`,
            },
        });
    }
    async sendPasswordResetEmail(userEmail, firstName, resetToken) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        return this.sendEmail({
            to: userEmail,
            subject: 'Password Reset Request - BlueRock Asset Management',
            template: 'password_reset',
            variables: {
                user: { firstName, lastName: '', email: userEmail },
                resetLink,
            },
        });
    }
}
exports.emailService = new EmailService();
exports.default = exports.emailService;
//# sourceMappingURL=emailService.js.map