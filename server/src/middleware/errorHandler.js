const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details || undefined,
    stack: isProd ? undefined : err.stack,
  });
};

module.exports = errorHandler;
