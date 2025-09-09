declare class PinExpiryJob {
    private job;
    constructor();
    processExpiredPins(): Promise<void>;
    clearExpiredPin(withdrawalId: string): Promise<boolean>;
    getExpiringPins(minutesFromNow?: number): Promise<any[]>;
    getExpiredPinsCount(): Promise<number>;
    getNextRunTime(): Date | null;
    stop(): void;
    start(): void;
}
export declare const pinExpiryJob: PinExpiryJob;
export default pinExpiryJob;
//# sourceMappingURL=pinExpiry.d.ts.map