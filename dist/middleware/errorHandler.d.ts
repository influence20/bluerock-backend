import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
export declare const errorHandler: (err: AppError | Error, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const createError: (message: string, statusCode: number) => AppError;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map