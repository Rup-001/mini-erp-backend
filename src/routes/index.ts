import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import productRoutes from '../modules/product/product.routes';
import saleRoutes from '../modules/sale/sale.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import docsRoutes from './docs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/docs', docsRoutes);

export default router;
