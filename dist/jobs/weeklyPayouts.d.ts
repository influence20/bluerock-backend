declare class WeeklyPayoutJob {
    private job;
    constructor();
    processWeeklyPayouts(): Promise<void>;
    private processInvestmentPayout;
    private generateMockTxid;
    processManualPayout(investmentId: string): Promise<boolean>;
    getNextRunTime(): Date | null;
    stop(): void;
    start(): void;
}
export declare const weeklyPayoutJob: WeeklyPayoutJob;
export default weeklyPayoutJob;
//# sourceMappingURL=weeklyPayouts.d.ts.map