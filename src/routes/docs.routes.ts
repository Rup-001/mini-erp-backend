import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDefinition from '../docs/swaggerDef';

const router = Router();

const docsGlob = fs.existsSync(path.join(process.cwd(), 'src/docs'))
  ? 'src/docs/*.ts'
  : 'dist/docs/*.js';

const specs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [docsGlob],
});

router.get('/swagger.json', (_req, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

router.get('/', (_req, res: Response) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mini ERP API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: location.origin + '/api/v1/docs/swagger.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
        });
      };
    </script>
  </body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

export default router;
