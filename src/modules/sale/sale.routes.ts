import { Router } from 'express';
import validate from '../../middlewares/validate.middleware';
import { auth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { createSaleSchema, getSaleSchema, listSalesSchema } from './sale.validation';
import * as saleController from './sale.controller';

const router = Router();

router.post(
  '/',
  auth,
  requirePermission('sale:create'),
  validate(createSaleSchema),
  saleController.createSale
);

router.get(
  '/',
  auth,
  requirePermission('sale:read'),
  validate(listSalesSchema),
  saleController.getSales
);

router.get(
  '/:id',
  auth,
  requirePermission('sale:read'),
  validate(getSaleSchema),
  saleController.getSale
);

export default router;
