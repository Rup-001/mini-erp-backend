import { RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Parameters<RequestHandler>[0],
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2]
) => Promise<void>;

const catchAsync = (fn: AsyncRequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default catchAsync;
