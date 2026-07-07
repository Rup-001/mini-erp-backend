import multer from 'multer';
import path from 'path';
import fs from 'fs';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { ApiError } from '../common/ApiError';

const defaultMimeTypes = [
  'image/jpg',
  'image/png',
  'image/jpeg',
  'image/heic',
  'image/heif',
  'image/webp',
];

export const createUploadMiddleware = (uploadDir: string, allowedMimeTypes?: string[]) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, '')
          .toLocaleLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, filename + fileExt);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: config.upload.maxFileSizeMb * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      const types = allowedMimeTypes || defaultMimeTypes;
      if (types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${types.join(', ')}`));
      }
    },
  });
};

export const productUpload = createUploadMiddleware(config.upload.dir);

export const requireProductImage = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.file) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Product image is required'));
  }
  next();
};

export const handleMulterError = (err: Error, _req: Request, _res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
  }
  if (err) {
    return next(new ApiError(httpStatus.BAD_REQUEST, err.message));
  }
  next();
};
