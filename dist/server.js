"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const logger_1 = require("./utils/logger");
const constants_1 = require("./config/constants");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const deposits_1 = __importDefault(require("./routes/deposits"));
const withdrawals_1 = __importDefault(require("./routes/withdrawals"));
const investments_1 = __importDefault(require("./routes/investments"));
const payouts_1 = __importDefault(require("./routes/payouts"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const admin_1 = __importDefault(require("./routes/admin"));
const public_1 = __importDefault(require("./routes/public"));
const contact_1 = __importDefault(require("./routes/contact"));
require("./jobs/weeklyPayouts");
require("./jobs/emailQueue");
require("./jobs/pinExpiry");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: [constants_1.FRONTEND_URL, 'http://localhost:3000', 'https://bluerock-asset.web.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.SECURITY_CONFIG.RATE_LIMIT_WINDOW,
    max: constants_1.SECURITY_CONFIG.RATE_LIMIT_MAX,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
if (constants_1.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => {
                logger_1.logger.info(message.trim());
            }
        }
    }));
}
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: constants_1.NODE_ENV,
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/user', user_1.default);
app.use('/api/deposits', deposits_1.default);
app.use('/api/withdrawals', withdrawals_1.default);
app.use('/api/investments', investments_1.default);
app.use('/api/payouts', payouts_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/public', public_1.default);
app.use('/api/contact', contact_1.default);
if (constants_1.NODE_ENV === 'production') {
    app.use(express_1.default.static('public'));
    app.get('*', (req, res) => {
        res.sendFile('index.html', { root: 'public' });
    });
}
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.default)();
        app.listen(constants_1.PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${constants_1.PORT} in ${constants_1.NODE_ENV} mode`);
            logger_1.logger.info(`📱 Frontend URL: ${constants_1.FRONTEND_URL}`);
            logger_1.logger.info(`🔗 API Base URL: http://localhost:${constants_1.PORT}/api`);
            logger_1.logger.info(`📊 Health Check: http://localhost:${constants_1.PORT}/health`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    logger_1.logger.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map