import ApiError from '../utils/ApiError.js';
import handleValidationError from '../utils/handleValidationError.js';

const formatErrorMessage = (message, path = '') => ({
  path,
  message,
});

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages = [];

  if (error?.name === 'ValidationError') {
    const {
      statusCode: code,
      message: msg,
      errorMessages: errors,
    } = handleValidationError(error);
    statusCode = code;
    message = msg;
    errorMessages = errors;
  } else if (error?.code === 11000) {
    // Handle MongoDB duplicate key error
    const fields = Object.keys(error.keyValue);
    const duplicateField = fields[0];
    const duplicateValue = error.keyValue[duplicateField];

    statusCode = 409;
    message = `${duplicateField} '${duplicateValue}' already exists.`;
    errorMessages = [formatErrorMessage(message, duplicateField)];
  } else if (error instanceof ApiError) {
    // Handle custom API errors
    statusCode = error.statusCode || 500;
    message = error.message || 'Internal Server Error';
    errorMessages = [formatErrorMessage(message)];
  } else if (error instanceof Error) {
    // Handle general errors
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
