import {
  type CookieOptions,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import config from 'config';
import {
  type CreateUserInput,
  type LoginUserInput,
} from '../schemas/user.schema';
import { createUser, findUser, signToken } from '../services/user.service';
import AppError from '../utils/appError';

export const excludedFields = ['password'];

const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000,
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production')
  accessTokenCookieOptions.secure = true;

export const registerHandler = async (
  request: Request<unknown, unknown, CreateUserInput>,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name } = request.body;

    const user = await createUser({
      email,
      password,
      name,
    });

    response.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return response.status(409).json({
        status: 'fail',
        message: 'Email already exist',
      });
    }
    next();
  }
};

export const loginHandler = async (
  request: Request<unknown, unknown, LoginUserInput>,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = request.body;

    const user = await findUser({ email: email });

    if (!user || !(await user.comparePasswords(user.password, password))) {
      next(new AppError('Invalid email or password', 401));
      return;
    }

    const { acceess_token } = await signToken(user);

    response.cookie('access_token', acceess_token, accessTokenCookieOptions);
    response.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return response.status(200).json({
      status: 'success',
      acceess_token,
    });
  } catch (error: unknown) {
    next(error);
  }
};
