"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePayoutSchedule = exports.calculateROI = exports.calculateProfit = exports.calculateTotalReturn = exports.calculateWeeklyPayout = void 0;
const constants_1 = require("../config/constants");
const calculateWeeklyPayout = (investment) => {
    return (investment / constants_1.INVESTMENT_CONFIG.FORMULA_DIVISOR) * constants_1.INVESTMENT_CONFIG.FORMULA_MULTIPLIER;
};
exports.calculateWeeklyPayout = calculateWeeklyPayout;
const calculateTotalReturn = (investment) => {
    const weeklyPayout = (0, exports.calculateWeeklyPayout)(investment);
    return weeklyPayout * constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS;
};
exports.calculateTotalReturn = calculateTotalReturn;
const calculateProfit = (investment) => {
    return (0, exports.calculateTotalReturn)(investment) - investment;
};
exports.calculateProfit = calculateProfit;
const calculateROI = (investment) => {
    if (investment === 0)
        return Infinity;
    const profit = (0, exports.calculateProfit)(investment);
    return (profit / investment) * 100;
};
exports.calculateROI = calculateROI;
const generatePayoutSchedule = (investment, startDate = new Date()) => {
    const weeklyPayout = (0, exports.calculateWeeklyPayout)(investment);
    const schedule = [];
    let nextFriday = new Date(startDate);
    while (nextFriday.getDay() !== 5) {
        nextFriday.setDate(nextFriday.getDate() + 1);
    }
    for (let week = 1; week <= constants_1.INVESTMENT_CONFIG.PAYOUT_WEEKS; week++) {
        const payoutDate = new Date(nextFriday);
        payoutDate.setDate(payoutDate.getDate() + (week - 1) * 7);
        schedule.push({
            week,
            date: payoutDate,
            amount: weeklyPayout,
            status: 'pending',
        });
    }
    return schedule;
};
exports.generatePayoutSchedule = generatePayoutSchedule;
exports.default = {
    calculateWeeklyPayout: exports.calculateWeeklyPayout,
    calculateTotalReturn: exports.calculateTotalReturn,
    calculateProfit: exports.calculateProfit,
    calculateROI: exports.calculateROI,
    generatePayoutSchedule: exports.generatePayoutSchedule,
};
//# sourceMappingURL=investmentCalculator.js.map