import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.get(
  '/stats',
  auth,
  requirePermission('dashboard:read'),
  dashboardController.getStats
);

export default router;
