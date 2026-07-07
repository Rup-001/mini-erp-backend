import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { config } from '../../config/env';
import { ApiError } from '../../common/ApiError';
import User, { comparePassword } from '../user/user.model';
import { Role } from '../../config/roles';

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  sub: string;
  role: Role;
}

export const generateToken = (userId: string, role: Role): string => {
  const payload: TokenPayload = { sub: userId, role };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const accessToken = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
