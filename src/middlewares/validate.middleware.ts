import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { pick } from '../common/pick';
import { ApiError } from '../common/ApiError';

interface ValidationSchema {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}

const validate = (schema: ValidationSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema) as (keyof Request)[]);

  const errors: { field: string; message: string }[] = [];

  for (const key of Object.keys(validSchema) as (keyof ValidationSchema)[]) {
    const zodSchema = validSchema[key];
    if (!zodSchema) continue;

    const result = zodSchema.safeParse(object[key]);
    if (!result.success) {
      const zodError = result.error as ZodError;
      zodError.errors.forEach((detail) => {
        errors.push({
          field: `${key}.${detail.path.join('.')}`,
          message: detail.message,
        });
      });
    } else {
      (req as unknown as Record<string, unknown>)[key] = result.data;
    }
  }

  if (errors.length > 0) {
    const apiError = new ApiError(httpStatus.BAD_REQUEST, errors.map((e) => e.message).join(', ')) as ApiError & {
      errors: { field: string; message: string }[];
    };
    apiError.errors = errors;
    return next(apiError);
  }

  return next();
};

export default validate;
