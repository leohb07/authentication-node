import { omit } from 'lodash';
import userModel, { type User } from '../models/user.model';
import { type FilterQuery, type QueryOptions } from 'mongoose';
import { type DocumentType } from '@typegoose/typegoose';
import { signJwt } from '../utils/jwt';
import config from 'config';
import redisClient from '../utils/connectRedis';
import { excludedFields } from '../controllers/auth.controller';

export const createUser = async (input: Partial<User>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};

export const findUserById = async (id: string) => {
  const user = await userModel.findById(id).lean();
  return omit(user, excludedFields);
};

export const findAllUsers = async () => {
  return await userModel.find();
};

export const findUser = async (
  query: FilterQuery<User>,
  options: QueryOptions = {},
) => {
  return await userModel.findOne(query, {}, options).select('+password');
};

export const signToken = async (user: DocumentType<User>) => {
  const acceess_token = signJwt(
    { sub: user._id },
    {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    },
  );

  redisClient.set(String(user._id), JSON.stringify(user), {
    EX: 60 * 60,
  });

  return { acceess_token };
};
