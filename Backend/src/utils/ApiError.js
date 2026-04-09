class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;

    // Capture stack trace (clean)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
