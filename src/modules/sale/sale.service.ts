import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { ApiError } from '../../common/ApiError';
import QueryBuilder from '../../common/QueryBuilder';
import Product, { IProductDocument } from '../product/product.model';
import Sale from './sale.model';

interface SaleItemInput {
  productId: string;
  quantity: number;
}

interface ProcessedItem {
  product: IProductDocument;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export const createSale = async (items: SaleItemInput[], userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
  } catch (error) {
    session.endSession();
    const mongoError = error as { code?: number; codeName?: string };
    if (mongoError.code === 20 || mongoError.codeName === 'IllegalOperation') {
      return executeSale(items, userId);
    }
    throw error;
  }

  try {
    const result = await executeSale(items, userId, session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const executeSale = async (
  items: SaleItemInput[],
  userId: string,
  session?: mongoose.ClientSession
) => {
  const processedItems: ProcessedItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = session
      ? await Product.findById(item.productId).session(session)
      : await Product.findById(item.productId);

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    if (product.stockQuantity < item.quantity) {
      const apiError = new ApiError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for ${product.sku}`
      ) as ApiError & { errors: { field: string; message: string }[] };
      apiError.errors = [
        {
          field: `items[${i}].quantity`,
          message: `Only ${product.stockQuantity} left in stock`,
        },
      ];
      throw apiError;
    }

    const subtotal = item.quantity * product.sellingPrice;
    processedItems.push({
      product,
      quantity: item.quantity,
      unitPrice: product.sellingPrice,
      subtotal,
    });
  }

  const grandTotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

  for (const item of processedItems) {
    await Product.updateOne(
      { _id: item.product._id },
      { $inc: { stockQuantity: -item.quantity } },
      session ? { session } : {}
    );
  }

  const saleItems = processedItems.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal,
  }));

  const sale = session
    ? (await Sale.create([{ items: saleItems, grandTotal, soldBy: userId }], { session }))[0]
    : await Sale.create({ items: saleItems, grandTotal, soldBy: userId });

  return sale.populate([
    { path: 'items.product', select: 'name sku sellingPrice' },
    { path: 'soldBy', select: 'name email role' },
  ]);
};

export const getSales = async (queryParams: Record<string, string>) => {
  const builder = new QueryBuilder(
    Sale.find().populate('soldBy', 'name email role').populate('items.product', 'name sku'),
    queryParams
  )
    .dateRange('createdAt')
    .applyFilter()
    .sort('-createdAt')
    .paginate();

  return builder.execute();
};

export const getSaleById = async (id: string) => {
  const sale = await Sale.findById(id)
    .populate('soldBy', 'name email role')
    .populate('items.product', 'name sku sellingPrice imageUrl');
  if (!sale) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sale not found');
  }
  return sale;
};
