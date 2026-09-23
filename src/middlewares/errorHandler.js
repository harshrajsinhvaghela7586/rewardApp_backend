const { env } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 400;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  if (env.isDev) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace sirf development mein
    ...(env.isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
