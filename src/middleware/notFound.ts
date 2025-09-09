import { Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

export const notFound = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};

export default notFound;