// PURPOSE: Custom error class for consistent error responses
// WHY: Instead of throwing generic errors, we throw structured
// errors with status codes that our error middleware can handle

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

export default ApiError;