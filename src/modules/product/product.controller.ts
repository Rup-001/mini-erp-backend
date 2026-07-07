import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../common/catchAsync';
import ApiResponse from '../../common/ApiResponse';
import * as productService from './product.service';
import { IUserDocument } from '../user/user.model';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;
  const imagePath = req.file!.path;
  const product = await productService.createProduct(req.body, imagePath, user.id);
  ApiResponse.send(res, {
    statusCode: httpStatus.CREATED,
    message: 'Product created successfully',
    data: product,
  });
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query as Record<string, string>);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Products fetched successfully',
    data: result.results,
    pagination: result.pagination,
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Product fetched successfully',
    data: product,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const imagePath = req.file?.path;
  const product = await productService.updateProduct(req.params.id, req.body, imagePath);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Product updated successfully',
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  ApiResponse.send(res, {
    statusCode: httpStatus.OK,
    message: 'Product deleted successfully',
    data: null,
  });
});
