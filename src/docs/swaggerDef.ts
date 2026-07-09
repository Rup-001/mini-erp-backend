import { config } from '../config/env';

import './paths';
import './components';

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Mini ERP API Documentation',
    version: '1.0.0',
    description: 'Inventory & Sales Management System API',
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export default swaggerDef;
