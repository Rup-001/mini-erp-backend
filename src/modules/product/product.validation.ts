import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const createProductSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    purchasePrice: z.coerce.number().min(0, 'Purchase price must be non-negative'),
    sellingPrice: z.coerce.number().min(0, 'Selling price must be non-negative'),
    stockQuantity: z.coerce.number().int().min(0, 'Stock quantity must be non-negative'),
  }),
};

export const updateProductSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    sellingPrice: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
  }),
};

export const getProductSchema = {
  params: z.object({ id: objectId }),
};

export const deleteProductSchema = {
  params: z.object({ id: objectId }),
};

export const listProductsSchema = {
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
  }),
};
