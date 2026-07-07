import { Router } from 'express';
import validate from '../../middlewares/validate.middleware';
import { auth } from '../../middlewares/auth.middleware';
import { loginSchema } from './auth.validation';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.getMe);

export default router;
