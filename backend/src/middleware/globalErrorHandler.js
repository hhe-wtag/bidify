import ApiError from '../utils/ApiError.js';
import handleValidationError from '../utils/handleValidationError.js';

const formatErrorMessage = (message, path = '') => ({
  path,
  message,
});

const globalErrorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages = [];

  if (error?.name === 'ValidationError') {
    const { statusCode: code, message: msg, errorMessages: errors } = handleValidationError(error);
    statusCode = code;
    message = msg;
    errorMessages = errors;
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode || 500;
    message = error.message || 'Internal Server Error';
    errorMessages = [formatErrorMessage(message)];
  } else if (error instanceof Error) {
    message = error.message || 'Internal Server Error';
    errorMessages = [formatErrorMessage(message)];
  }

  // Log the error for debugging (only in development mode)
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
  });
};

export default globalErrorHandler;
