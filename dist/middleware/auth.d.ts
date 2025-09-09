import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
interface JwtPayload {
    userId: string;
    email: string;
    isAdmin: boolean;
}
export declare const authenticateToken: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: RequestWithUser, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
export declare const generateTokens: (user: any) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyRefreshToken: (token: string) => JwtPayload | null;
declare const _default: {
    authenticateToken: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    requireAdmin: (req: RequestWithUser, res: Response, next: NextFunction) => void;
    optionalAuth: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    generateTokens: (user: any) => {
        accessToken: string;
        refreshToken: string;
    };
    verifyRefreshToken: (token: string) => JwtPayload | null;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map