import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerDefinition from '../docs/swaggerDef';

const router = Router();

const specs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ['src/docs/*.ts'],
});

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      protocols: ['http'],
    },
  })
);

export default router;
