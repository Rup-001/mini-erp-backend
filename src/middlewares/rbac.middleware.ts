import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/ApiError';
import { roleRights, Permission, Role } from '../config/roles';
import { IUserDocument } from '../modules/user/user.model';

export const requirePermission =
  (...requiredPermissions: Permission[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user as IUserDocument;
    if (!user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized'));
    }

    const userRights = roleRights.get(user.role as Role);
    if (!userRights) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }

    const hasRequiredRights = requiredPermissions.every((permission) =>
      userRights.includes(permission)
    );

    if (!hasRequiredRights) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }

    next();
  };
