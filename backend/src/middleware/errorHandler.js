export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error message and status
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Check if it's a known error type
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};