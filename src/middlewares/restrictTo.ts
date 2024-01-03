import { type NextFunction, type Request, type Response } from 'express';
import AppError from '../utils/appError';

export const restrictTo =
  (...allowedRoles: string[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    const { user } = response.locals;
    if (!allowedRoles.includes(user.role)) {
      next(new AppError('You are not allowed to perform this action', 403));
      return;
    }

    next();
  };
