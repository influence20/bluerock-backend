import { INVESTMENT_CONFIG } from '../config/constants';

export const calculateWeeklyPayout = (investment: number): number => {
  return (investment / INVESTMENT_CONFIG.FORMULA_DIVISOR) * INVESTMENT_CONFIG.FORMULA_MULTIPLIER;
};

export const calculateTotalReturn = (investment: number): number => {
  const weeklyPayout = calculateWeeklyPayout(investment);
  return weeklyPayout * INVESTMENT_CONFIG.PAYOUT_WEEKS;
};

export const calculateProfit = (investment: number): number => {
  return calculateTotalReturn(investment) - investment;
};

export const calculateROI = (investment: number): number => {
  if (investment === 0) return Infinity;
  const profit = calculateProfit(investment);
  return (profit / investment) * 100;
};

export const generatePayoutSchedule = (investment: number, startDate: Date = new Date()) => {
  const weeklyPayout = calculateWeeklyPayout(investment);
  const schedule = [];
  
  // Find next Friday
  let nextFriday = new Date(startDate);
  while (nextFriday.getDay() !== 5) {
    nextFriday.setDate(nextFriday.getDate() + 1);
  }
  
  for (let week = 1; week <= INVESTMENT_CONFIG.PAYOUT_WEEKS; week++) {
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

export default {
  calculateWeeklyPayout,
  calculateTotalReturn,
  calculateProfit,
  calculateROI,
  generatePayoutSchedule,
};