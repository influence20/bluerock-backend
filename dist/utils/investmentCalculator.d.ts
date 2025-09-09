export declare const calculateWeeklyPayout: (investment: number) => number;
export declare const calculateTotalReturn: (investment: number) => number;
export declare const calculateProfit: (investment: number) => number;
export declare const calculateROI: (investment: number) => number;
export declare const generatePayoutSchedule: (investment: number, startDate?: Date) => {
    week: number;
    date: Date;
    amount: number;
    status: string;
}[];
declare const _default: {
    calculateWeeklyPayout: (investment: number) => number;
    calculateTotalReturn: (investment: number) => number;
    calculateProfit: (investment: number) => number;
    calculateROI: (investment: number) => number;
    generatePayoutSchedule: (investment: number, startDate?: Date) => {
        week: number;
        date: Date;
        amount: number;
        status: string;
    }[];
};
export default _default;
//# sourceMappingURL=investmentCalculator.d.ts.map