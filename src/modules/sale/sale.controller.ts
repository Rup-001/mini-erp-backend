import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../common/catchAsync';
import ApiResponse from '../../common/ApiResponse';
import * as saleService from './sale.service';
import { IUserDocument } from '../user/user.model';

export const createSale = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;
  const sale = await saleService.createSale(req.body.items, user.id);
  ApiResponse.send(res, {
    statusCode: httpStatus.CREATED,
    message: 'Sale created successfully',
    data: sale,
  });
});

export const getSales = catchAsync(async (req: Request, res: Response) => {
  const result = await saleService.getSales(req.query as Record<string, string>);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Sales fetched successfully',
    data: result.results,
    pagination: result.pagination,
  });
});

export const getSale = catchAsync(async (req: Request, res: Response) => {
  const sale = await saleService.getSaleById(req.params.id);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Sale fetched successfully',
    data: sale,
  });
});
