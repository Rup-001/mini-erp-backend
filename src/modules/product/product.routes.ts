import { Router } from 'express';
import validate from '../../middlewares/validate.middleware';
import { auth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import {
  productUpload,
  requireProductImage,
  handleMulterError,
} from '../../middlewares/upload.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
  listProductsSchema,
} from './product.validation';
import * as productController from './product.controller';

const router = Router();

router.get(
  '/',
  auth,
  requirePermission('product:read'),
  validate(listProductsSchema),
  productController.getProducts
);

router.get(
  '/:id',
  auth,
  requirePermission('product:read'),
  validate(getProductSchema),
  productController.getProduct
);

router.post(
  '/',
  auth,
  requirePermission('product:create'),
  productUpload.single('image'),
  handleMulterError,
  requireProductImage,
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:id',
  auth,
  requirePermission('product:update'),
  productUpload.single('image'),
  handleMulterError,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  auth,
  requirePermission('product:delete'),
  validate(deleteProductSchema),
  productController.deleteProduct
);

export default router;
