// Custom error class
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Create error helper function
export const createError = (statusCode, message) => {
  return new AppError(statusCode, message);
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Production error response
  else {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        success: false,
        message: 'Something went wrong!'
      });
    }
  }
};

// Handle MongoDB duplicate key errors
export const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  return new AppError(400, message);
};

// Handle MongoDB validation errors
export const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(400, message);
};

// Handle JWT errors
export const handleJWTError = () => 
  new AppError(401, 'Invalid token. Please log in again.');

export const handleJWTExpiredError = () => 
  new AppError(401, 'Your token has expired. Please log in again.'); 