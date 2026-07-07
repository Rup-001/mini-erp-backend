import httpStatus from 'http-status';
import { ApiError } from '../../common/ApiError';
import QueryBuilder from '../../common/QueryBuilder';
import Product from './product.model';

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
}

interface UpdateProductInput {
  name?: string;
  sku?: string;
  category?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stockQuantity?: number;
}

export const createProduct = async (
  input: CreateProductInput,
  imagePath: string,
  userId: string
) => {
  const existing = await Product.findOne({ sku: input.sku.toUpperCase() });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'SKU already exists');
  }

  const imageUrl = '/' + imagePath.replace(/\\/g, '/');

  const product = await Product.create({
    ...input,
    sku: input.sku.toUpperCase(),
    imageUrl,
    createdBy: userId,
  });

  return product;
};

export const getProducts = async (queryParams: Record<string, string>) => {
  const builder = new QueryBuilder(Product.find(), queryParams)
    .search(['name', 'sku', 'category'])
    .filter(['category'])
    .applyFilter()
    .sort('-createdAt')
    .paginate();

  return builder.execute();
};

export const getProductById = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

export const updateProduct = async (
  id: string,
  input: UpdateProductInput,
  imagePath?: string
) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (input.sku && input.sku.toUpperCase() !== product.sku) {
    const existing = await Product.findOne({ sku: input.sku.toUpperCase() });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, 'SKU already exists');
    }
    input.sku = input.sku.toUpperCase();
  }

  if (imagePath) {
    product.imageUrl = '/' + imagePath.replace(/\\/g, '/');
  }

  Object.assign(product, input);
  await product.save();
  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};
