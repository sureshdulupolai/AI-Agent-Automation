/**
 * Centralized Enterprise Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[SERVER ERROR] [${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  const showStack = process.env.SHOW_DEBUG_STACK === 'true';

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(showStack ? { stack: err.stack } : {})
  });
}

/**
 * 404 Not Found Catch-All Route Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString()
  });
}
