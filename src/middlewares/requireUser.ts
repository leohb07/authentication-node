import { type NextFunction, type Request, type Response } from 'express';
import AppError from '../utils/appError';

export const requireUser = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { user } = response.locals;
    if (!user) {
      next(new AppError('Invalid token or session has expired', 401));
      return;
    }

    next();
  } catch (error: any) {
    next(error);
  }
};
