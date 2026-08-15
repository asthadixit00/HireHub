import logger from '../config/logger.js';

const errorMiddleware = (err, req, res, next) => {
  // Log error with Winston
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

  let statusCode = err.statusCode || 500;
  let message    = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired, please refresh';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || []
  });
};

export default errorMiddleware;