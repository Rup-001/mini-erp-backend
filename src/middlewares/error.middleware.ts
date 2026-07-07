import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import logger from '../config/logger';
import { ApiError } from '../common/ApiError';

export const errorConverter = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const errObj = error as { statusCode?: number; message?: string; stack?: string };
    const statusCode =
      errObj.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = errObj.message || String(httpStatus[statusCode as keyof typeof httpStatus]);
    error = new ApiError(statusCode, message, false, errObj.stack);
  }
  next(error);
};

export const errorHandler = (err: ApiError, req: Request, res: Response, _next: NextFunction): void => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response: Record<string, unknown> = {
    success: false,
    statusCode,
    message,
  };

  if (err instanceof ApiError && (err as ApiError & { errors?: unknown }).errors) {
    response.errors = (err as ApiError & { errors?: unknown }).errors;
  }

  if (config.env === 'development') {
    response.stack = err.stack;
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
