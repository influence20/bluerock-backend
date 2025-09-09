"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.LOG_LEVELS = exports.CACHE_CONFIG = exports.REGEX_PATTERNS = exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.AUDIT_ACTIONS = exports.EMAIL_TYPES = exports.TRANSACTION_TYPES = exports.PAYOUT_STATUS = exports.INVESTMENT_STATUS = exports.WITHDRAWAL_STATUS = exports.DEPOSIT_STATUS = exports.USER_STATUS = exports.PAGINATION = exports.UPLOAD_CONFIG = exports.SECURITY_CONFIG = exports.INVESTMENT_CONFIG = exports.CRYPTO_WALLETS = exports.EMAIL_CONFIG = exports.MONGODB_URI = exports.JWT_REFRESH_EXPIRES_IN = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.FRONTEND_URL = exports.PORT = exports.NODE_ENV = void 0;
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = parseInt(process.env.PORT || '3001', 10);
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
exports.JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
exports.JWT_EXPIRES_IN = '24h';
exports.JWT_REFRESH_EXPIRES_IN = '7d';
exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluerock';
exports.EMAIL_CONFIG = {
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.ZOHO_SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.ZOHO_EMAIL || 'bluerockasset@zohomail.com',
        pass: process.env.ZOHO_APP_PASSWORD || '96pEY77Rh8rK',
    },
};
exports.CRYPTO_WALLETS = {
    BTC: process.env.BTC_WALLET || 'bc1q9jatk24hcxvcqwxa9t66tkqef7mj2gkqdvqzjd',
    ETH: process.env.ETH_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
    BNB: process.env.BNB_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
    USDT_ERC20: process.env.USDT_ERC20_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
    USDT_BEP20: process.env.USDT_BEP20_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
    USDT_TRC20: process.env.USDT_TRC20_WALLET || 'TYEMJvWSj5E2d8zRnaoW9FdcRWYWbpfosG',
};
exports.INVESTMENT_CONFIG = {
    MIN_INVESTMENT: parseInt(process.env.MIN_INVESTMENT || '300', 10),
    PAYOUT_DAY: parseInt(process.env.PAYOUT_DAY || '5', 10),
    PAYOUT_WEEKS: parseInt(process.env.PAYOUT_WEEKS || '8', 10),
    FORMULA_DIVISOR: parseInt(process.env.PAYOUT_FORMULA_DIVISOR || '500', 10),
    FORMULA_MULTIPLIER: parseInt(process.env.PAYOUT_FORMULA_MULTIPLIER || '300', 10),
};
exports.SECURITY_CONFIG = {
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    SESSION_SECRET: process.env.SESSION_SECRET || 'bluerock_session_secret_2025',
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    PIN_EXPIRY_MINUTES: 30,
    PASSWORD_RESET_EXPIRY_HOURS: 24,
    EMAIL_VERIFICATION_EXPIRY_HOURS: 48,
};
exports.UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    UPLOAD_PATH: 'uploads/',
};
exports.PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
};
exports.USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
};
exports.DEPOSIT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
};
exports.WITHDRAWAL_STATUS = {
    PENDING: 'pending',
    PIN_REQUIRED: 'pin_required',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
};
exports.INVESTMENT_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
exports.PAYOUT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
};
exports.TRANSACTION_TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    PAYOUT: 'payout',
    INVESTMENT: 'investment',
};
exports.EMAIL_TYPES = {
    WELCOME: 'welcome',
    DEPOSIT_RECEIVED: 'deposit_received',
    PLAN_ACTIVATED: 'plan_activated',
    WEEKLY_PAYOUT: 'weekly_payout',
    PIN_ISSUED: 'pin_issued',
    WITHDRAWAL_APPROVED: 'withdrawal_approved',
    WITHDRAWAL_REJECTED: 'withdrawal_rejected',
    PASSWORD_RESET: 'password_reset',
    EMAIL_VERIFICATION: 'email_verification',
    SECURITY_ALERT: 'security_alert',
    NEWSLETTER: 'newsletter',
};
exports.AUDIT_ACTIONS = {
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    DEPOSIT_CREATED: 'deposit_created',
    DEPOSIT_CONFIRMED: 'deposit_confirmed',
    DEPOSIT_REJECTED: 'deposit_rejected',
    WITHDRAWAL_CREATED: 'withdrawal_created',
    WITHDRAWAL_APPROVED: 'withdrawal_approved',
    WITHDRAWAL_REJECTED: 'withdrawal_rejected',
    INVESTMENT_CREATED: 'investment_created',
    PAYOUT_PROCESSED: 'payout_processed',
    PIN_GENERATED: 'pin_generated',
    PIN_USED: 'pin_used',
    SETTINGS_UPDATED: 'settings_updated',
    EMAIL_SENT: 'email_sent',
};
exports.ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    INVALID_TOKEN: 'Invalid or expired token',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INVALID_AMOUNT: 'Invalid amount',
    INVALID_CURRENCY: 'Invalid currency',
    INVALID_WALLET_ADDRESS: 'Invalid wallet address',
    INVALID_TXID: 'Invalid transaction ID',
    DEPOSIT_NOT_FOUND: 'Deposit not found',
    WITHDRAWAL_NOT_FOUND: 'Withdrawal not found',
    INVESTMENT_NOT_FOUND: 'Investment not found',
    PAYOUT_NOT_FOUND: 'Payout not found',
    PIN_EXPIRED: 'PIN has expired',
    PIN_INVALID: 'Invalid PIN',
    PIN_ALREADY_USED: 'PIN has already been used',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    RATE_LIMIT_EXCEEDED: 'Too many requests',
    FILE_TOO_LARGE: 'File size too large',
    INVALID_FILE_TYPE: 'Invalid file type',
};
exports.SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    DEPOSIT_CREATED: 'Deposit submitted successfully',
    DEPOSIT_CONFIRMED: 'Deposit confirmed successfully',
    WITHDRAWAL_CREATED: 'Withdrawal request submitted',
    WITHDRAWAL_APPROVED: 'Withdrawal approved successfully',
    INVESTMENT_CREATED: 'Investment plan created successfully',
    PAYOUT_PROCESSED: 'Payout processed successfully',
    PIN_GENERATED: 'PIN generated successfully',
    EMAIL_SENT: 'Email sent successfully',
    PASSWORD_RESET: 'Password reset successfully',
    SETTINGS_UPDATED: 'Settings updated successfully',
};
exports.REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    BTC_ADDRESS: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/,
    ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
    TRC20_ADDRESS: /^T[A-Za-z1-9]{33}$/,
    TXID: /^[a-fA-F0-9]{64}$/,
    PIN: /^\d{6}$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
};
exports.CACHE_CONFIG = {
    DEFAULT_TTL: 300,
    USER_TTL: 900,
    SETTINGS_TTL: 3600,
    STATS_TTL: 300,
};
exports.LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
//# sourceMappingURL=constants.js.map