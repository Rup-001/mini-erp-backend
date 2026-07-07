import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const createSaleSchema = {
  body: z.object({
    items: z
      .array(
        z.object({
          productId: objectId,
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'At least one item is required'),
  }),
};

export const getSaleSchema = {
  params: z.object({ id: objectId }),
};

export const listSalesSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sortBy: z.string().optional(),
  }),
};
