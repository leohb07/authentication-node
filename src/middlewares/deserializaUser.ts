import { type NextFunction, type Request, type Response } from 'express';
import AppError from '../utils/appError';
import { verifyJwt } from '../utils/jwt';
import redisClient from '../utils/connectRedis';
import { findUserById } from '../services/user.service';

export const deserializeUser = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    let access_token;

    const { authorization } = request.headers;
    const { access_token: accessTokenCookie } = request.cookies;

    if (authorization && authorization.startsWith('Bearer')) {
      access_token = authorization.split(' ')[1];
    } else if (accessTokenCookie) {
      access_token = accessTokenCookie;
    }

    if (!access_token) {
      return next(new AppError('You are not logged in', 401));
    }

    const decoded = verifyJwt<{ sub: string }>(access_token);
    if (!decoded) {
      return next(new AppError("Invalid token or user doesn't exist", 400));
    }

    const session = await redisClient.get(decoded.sub);
    if (!session) {
      return next(new AppError('User session has expired', 401));
    }

    const user = await findUserById(JSON.parse(session)._id);

    if (!user) {
      return next(new AppError('User with that token no longer exist', 401));
    }

    response.locals.user = user;

    next();
  } catch (error: any) {
    next(error);
  }
};
