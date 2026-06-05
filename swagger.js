// import { createRequire } from 'module';
import swaggerAutogen from 'swagger-autogen';
// const require = createRequire(import.meta.url);
// const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'Description',
  },
  host: 'localhost:3000',
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
    parameters: {
      AccessTokenCookie: {
        name: 'accessToken',
        in: 'cookie',
        description: 'Access token cookie for authenticated requests',
        schema: { type: 'string' },
      },
      RefreshTokenCookie: {
        name: 'refreshToken',
        in: 'cookie',
        description: 'Refresh token cookie for session refresh',
        schema: { type: 'string' },
      },
      SessionIdCookie: {
        name: 'sessionId',
        in: 'cookie',
        description: 'Session ID cookie for authenticated requests',
        schema: { type: 'string' },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      BadRequestError: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFoundError: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sessionId',
      },
    },
  },
  security: [{ cookieAuth: [] }],
};

const outputFile = './swagger-output.json';
// include your route files (use the entry files for routers)
const routes = ['./src/routes/authRoutes.js', './src/routes/notesRoutes.js', './src/routes/userRoutes.js', './src/server.js'];

/* NOTE: If you are using the express Router, pass only the root file where the
   routes are initialized (for example `src/server.js`). We include route files
   explicitly to capture route-level comments as well. */

swaggerAutogen({openapi: '3.0.0'})(outputFile, routes, doc);
