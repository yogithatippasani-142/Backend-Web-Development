const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const http = require('./utils/http');

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/', postRoutes);

  // Safe internal-failure endpoint for demonstration and testing.
  app.get('/__test__/internal-error', controller.explode);

  // Return a structured error for unknown routes.
  app.use((req, res) => {
    return http.sendError(
      res,
      404,
      'ROUTE_NOT_FOUND',
      'Route not found'
    );
  });

  // Centralized error handler.
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    // Handle malformed JSON separately.
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return http.sendError(
        res,
        400,
        'INVALID_JSON',
        'Request body contains invalid JSON'
      );
    }

    const status = err.statusCode || 500;

    if (status >= 400 && status < 500) {
      return http.sendError(
        res,
        status,
        err.code || 'BAD_REQUEST',
        err.message || 'Request could not be processed'
      );
    }

    // Never expose stack traces or internal error details.
    return http.sendError(
      res,
      500,
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred'
    );
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;

  app.listen(port, () => {
    console.log(`Starter API listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};