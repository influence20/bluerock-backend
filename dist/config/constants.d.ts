export declare const NODE_ENV: string;
export declare const PORT: number;
export declare const FRONTEND_URL: string;
export declare const JWT_SECRET: string;
export declare const JWT_EXPIRES_IN = "24h";
export declare const JWT_REFRESH_EXPIRES_IN = "7d";
export declare const MONGODB_URI: string;
export declare const EMAIL_CONFIG: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
};
export declare const CRYPTO_WALLETS: {
    BTC: string;
    ETH: string;
    BNB: string;
    USDT_ERC20: string;
    USDT_BEP20: string;
    USDT_TRC20: string;
};
export declare const INVESTMENT_CONFIG: {
    MIN_INVESTMENT: number;
    PAYOUT_DAY: number;
    PAYOUT_WEEKS: number;
    FORMULA_DIVISOR: number;
    FORMULA_MULTIPLIER: number;
};
export declare const SECURITY_CONFIG: {
    BCRYPT_ROUNDS: number;
    SESSION_SECRET: string;
    RATE_LIMIT_WINDOW: number;
    RATE_LIMIT_MAX: number;
    PIN_EXPIRY_MINUTES: number;
    PASSWORD_RESET_EXPIRY_HOURS: number;
    EMAIL_VERIFICATION_EXPIRY_HOURS: number;
};
export declare const UPLOAD_CONFIG: {
    MAX_FILE_SIZE: number;
    ALLOWED_MIME_TYPES: string[];
    UPLOAD_PATH: string;
};
export declare const PAGINATION: {
    DEFAULT_LIMIT: number;
    MAX_LIMIT: number;
    DEFAULT_PAGE: number;
};
export declare const USER_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly SUSPENDED: "suspended";
};
export declare const DEPOSIT_STATUS: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly REJECTED: "rejected";
};
export declare const WITHDRAWAL_STATUS: {
    readonly PENDING: "pending";
    readonly PIN_REQUIRED: "pin_required";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly COMPLETED: "completed";
};
export declare const INVESTMENT_STATUS: {
    readonly PENDING: "pending";
    readonly ACTIVE: "active";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export declare const PAYOUT_STATUS: {
    readonly PENDING: "pending";
    readonly PAID: "paid";
    readonly FAILED: "failed";
};
export declare const TRANSACTION_TYPES: {
    readonly DEPOSIT: "deposit";
    readonly WITHDRAWAL: "withdrawal";
    readonly PAYOUT: "payout";
    readonly INVESTMENT: "investment";
};
export declare const EMAIL_TYPES: {
    readonly WELCOME: "welcome";
    readonly DEPOSIT_RECEIVED: "deposit_received";
    readonly PLAN_ACTIVATED: "plan_activated";
    readonly WEEKLY_PAYOUT: "weekly_payout";
    readonly PIN_ISSUED: "pin_issued";
    readonly WITHDRAWAL_APPROVED: "withdrawal_approved";
    readonly WITHDRAWAL_REJECTED: "withdrawal_rejected";
    readonly PASSWORD_RESET: "password_reset";
    readonly EMAIL_VERIFICATION: "email_verification";
    readonly SECURITY_ALERT: "security_alert";
    readonly NEWSLETTER: "newsletter";
};
export declare const AUDIT_ACTIONS: {
    readonly USER_CREATED: "user_created";
    readonly USER_UPDATED: "user_updated";
    readonly USER_DELETED: "user_deleted";
    readonly USER_LOGIN: "user_login";
    readonly USER_LOGOUT: "user_logout";
    readonly DEPOSIT_CREATED: "deposit_created";
    readonly DEPOSIT_CONFIRMED: "deposit_confirmed";
    readonly DEPOSIT_REJECTED: "deposit_rejected";
    readonly WITHDRAWAL_CREATED: "withdrawal_created";
    readonly WITHDRAWAL_APPROVED: "withdrawal_approved";
    readonly WITHDRAWAL_REJECTED: "withdrawal_rejected";
    readonly INVESTMENT_CREATED: "investment_created";
    readonly PAYOUT_PROCESSED: "payout_processed";
    readonly PIN_GENERATED: "pin_generated";
    readonly PIN_USED: "pin_used";
    readonly SETTINGS_UPDATED: "settings_updated";
    readonly EMAIL_SENT: "email_sent";
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly USER_NOT_FOUND: "User not found";
    readonly USER_ALREADY_EXISTS: "User already exists";
    readonly INVALID_TOKEN: "Invalid or expired token";
    readonly INSUFFICIENT_BALANCE: "Insufficient balance";
    readonly INVALID_AMOUNT: "Invalid amount";
    readonly INVALID_CURRENCY: "Invalid currency";
    readonly INVALID_WALLET_ADDRESS: "Invalid wallet address";
    readonly INVALID_TXID: "Invalid transaction ID";
    readonly DEPOSIT_NOT_FOUND: "Deposit not found";
    readonly WITHDRAWAL_NOT_FOUND: "Withdrawal not found";
    readonly INVESTMENT_NOT_FOUND: "Investment not found";
    readonly PAYOUT_NOT_FOUND: "Payout not found";
    readonly PIN_EXPIRED: "PIN has expired";
    readonly PIN_INVALID: "Invalid PIN";
    readonly PIN_ALREADY_USED: "PIN has already been used";
    readonly UNAUTHORIZED: "Unauthorized access";
    readonly FORBIDDEN: "Access forbidden";
    readonly VALIDATION_ERROR: "Validation error";
    readonly INTERNAL_ERROR: "Internal server error";
    readonly RATE_LIMIT_EXCEEDED: "Too many requests";
    readonly FILE_TOO_LARGE: "File size too large";
    readonly INVALID_FILE_TYPE: "Invalid file type";
};
export declare const SUCCESS_MESSAGES: {
    readonly USER_CREATED: "User created successfully";
    readonly USER_UPDATED: "User updated successfully";
    readonly LOGIN_SUCCESS: "Login successful";
    readonly LOGOUT_SUCCESS: "Logout successful";
    readonly DEPOSIT_CREATED: "Deposit submitted successfully";
    readonly DEPOSIT_CONFIRMED: "Deposit confirmed successfully";
    readonly WITHDRAWAL_CREATED: "Withdrawal request submitted";
    readonly WITHDRAWAL_APPROVED: "Withdrawal approved successfully";
    readonly INVESTMENT_CREATED: "Investment plan created successfully";
    readonly PAYOUT_PROCESSED: "Payout processed successfully";
    readonly PIN_GENERATED: "PIN generated successfully";
    readonly EMAIL_SENT: "Email sent successfully";
    readonly PASSWORD_RESET: "Password reset successfully";
    readonly SETTINGS_UPDATED: "Settings updated successfully";
};
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PASSWORD: RegExp;
    readonly BTC_ADDRESS: RegExp;
    readonly ETH_ADDRESS: RegExp;
    readonly TRC20_ADDRESS: RegExp;
    readonly TXID: RegExp;
    readonly PIN: RegExp;
    readonly PHONE: RegExp;
};
export declare const CACHE_CONFIG: {
    readonly DEFAULT_TTL: 300;
    readonly USER_TTL: 900;
    readonly SETTINGS_TTL: 3600;
    readonly STATS_TTL: 300;
};
export declare const LOG_LEVELS: {
    readonly ERROR: "error";
    readonly WARN: "warn";
    readonly INFO: "info";
    readonly DEBUG: "debug";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type DepositStatus = typeof DEPOSIT_STATUS[keyof typeof DEPOSIT_STATUS];
export type WithdrawalStatus = typeof WITHDRAWAL_STATUS[keyof typeof WITHDRAWAL_STATUS];
export type InvestmentStatus = typeof INVESTMENT_STATUS[keyof typeof INVESTMENT_STATUS];
export type PayoutStatus = typeof PAYOUT_STATUS[keyof typeof PAYOUT_STATUS];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type EmailType = typeof EMAIL_TYPES[keyof typeof EMAIL_TYPES];
export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
//# sourceMappingURL=constants.d.ts.map