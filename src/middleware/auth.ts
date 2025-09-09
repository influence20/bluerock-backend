import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JWT_SECRET, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { logger } from '../utils/logger';
import { RequestWithUser } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export const authenticateToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
      });
      return;
    }

    // Check if account is locked
    if (user.isLocked()) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.INVALID_TOKEN,
      });
      return;
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const requireAdmin = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.FORBIDDEN,
    });
    return;
  }

  next();
};

export const optionalAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive && !user.isLocked()) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

export const generateTokens = (user: any): { accessToken: string; refreshToken: string } => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export default {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  generateTokens,
  verifyRefreshToken,
};