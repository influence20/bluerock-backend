// Environment Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '3001', 10);
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
export const JWT_EXPIRES_IN = '24h';
export const JWT_REFRESH_EXPIRES_IN = '7d';

// Database Configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluerock';

// Email Configuration
export const EMAIL_CONFIG = {
  host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.ZOHO_SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.ZOHO_EMAIL || 'bluerockasset@zohomail.com',
    pass: process.env.ZOHO_APP_PASSWORD || '96pEY77Rh8rK',
  },
};

// Crypto Wallets
export const CRYPTO_WALLETS = {
  BTC: process.env.BTC_WALLET || 'bc1q9jatk24hcxvcqwxa9t66tkqef7mj2gkqdvqzjd',
  ETH: process.env.ETH_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
  BNB: process.env.BNB_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
  USDT_ERC20: process.env.USDT_ERC20_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
  USDT_BEP20: process.env.USDT_BEP20_WALLET || '0xB9Df7837E13B2BD16ddE11a03C0e48Df8fC78ba3',
  USDT_TRC20: process.env.USDT_TRC20_WALLET || 'TYEMJvWSj5E2d8zRnaoW9FdcRWYWbpfosG',
};

// Investment Configuration
export const INVESTMENT_CONFIG = {
  MIN_INVESTMENT: parseInt(process.env.MIN_INVESTMENT || '300', 10),
  PAYOUT_DAY: parseInt(process.env.PAYOUT_DAY || '5', 10), // Friday
  PAYOUT_WEEKS: parseInt(process.env.PAYOUT_WEEKS || '8', 10),
  FORMULA_DIVISOR: parseInt(process.env.PAYOUT_FORMULA_DIVISOR || '500', 10),
  FORMULA_MULTIPLIER: parseInt(process.env.PAYOUT_FORMULA_MULTIPLIER || '300', 10),
};

// Security Configuration
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  SESSION_SECRET: process.env.SESSION_SECRET || 'bluerock_session_secret_2025',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  PIN_EXPIRY_MINUTES: 30,
  PASSWORD_RESET_EXPIRY_HOURS: 24,
  EMAIL_VERIFICATION_EXPIRY_HOURS: 48,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: 'uploads/',
};

// Pagination Configuration
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

// Status Constants
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const DEPOSIT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PIN_REQUIRED: 'pin_required',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const INVESTMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const;

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PAYOUT: 'payout',
  INVESTMENT: 'investment',
} as const;

export const EMAIL_TYPES = {
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
} as const;

// Audit Actions
export const AUDIT_ACTIONS = {
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
} as const;

// Error Messages
export const ERROR_MESSAGES = {
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
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
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
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  BTC_ADDRESS: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRC20_ADDRESS: /^T[A-Za-z1-9]{33}$/,
  TXID: /^[a-fA-F0-9]{64}$/,
  PIN: /^\d{6}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  USER_TTL: 900, // 15 minutes
  SETTINGS_TTL: 3600, // 1 hour
  STATS_TTL: 300, // 5 minutes
} as const;

// Logging Configuration
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

// API Response Codes
export const HTTP_STATUS = {
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
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type DepositStatus = typeof DEPOSIT_STATUS[keyof typeof DEPOSIT_STATUS];
export type WithdrawalStatus = typeof WITHDRAWAL_STATUS[keyof typeof WITHDRAWAL_STATUS];
export type InvestmentStatus = typeof INVESTMENT_STATUS[keyof typeof INVESTMENT_STATUS];
export type PayoutStatus = typeof PAYOUT_STATUS[keyof typeof PAYOUT_STATUS];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type EmailType = typeof EMAIL_TYPES[keyof typeof EMAIL_TYPES];
export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];