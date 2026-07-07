import passport from 'passport';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/ApiError';
import { IUserDocument } from '../modules/user/user.model';

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: IUserDocument | false) => {
    if (err || !user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized'));
    }
    req.user = user;
    next();
  })(req, res, next);
};
