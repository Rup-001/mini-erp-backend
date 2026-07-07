import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../common/catchAsync';
import ApiResponse from '../../common/ApiResponse';
import * as dashboardService from './dashboard.service';

export const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Dashboard stats fetched successfully',
    data: stats,
  });
});
