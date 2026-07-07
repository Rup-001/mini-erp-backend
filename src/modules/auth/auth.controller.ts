import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../common/catchAsync';
import ApiResponse from '../../common/ApiResponse';
import * as authService from './auth.service';
import { IUserDocument } from '../user/user.model';

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: result,
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;
  const result = await authService.getMe(user.id);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'User profile fetched successfully',
    data: result,
  });
});
