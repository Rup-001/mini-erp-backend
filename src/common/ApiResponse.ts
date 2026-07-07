import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface ApiResponseOptions<T> {
  statusCode?: number;
  message: string;
  data?: T;
  pagination?: PaginationMeta;
}

class ApiResponse {
  static send<T>(res: Response, options: ApiResponseOptions<T>): Response {
    const { statusCode = 200, message, data, pagination } = options;

    const body: Record<string, unknown> = {
      success: true,
      statusCode,
      message,
    };

    if (data !== undefined) {
      if (pagination) {
        body.data = { results: data, pagination };
      } else {
        body.data = data;
      }
    }

    return res.status(statusCode).json(body);
  }
}

export default ApiResponse;
