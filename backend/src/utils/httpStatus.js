const HTTP_STATUS = {
  OK: 200, // Success
  CREATED: 201, // Resource created successfully
  ACCEPTED: 202, // Request accepted for processing
  NO_CONTENT: 204, // Request processed successfully, but no content returned

  BAD_REQUEST: 400, // Client sent an invalid request
  UNAUTHORIZED: 401, // Authentication required or failed
  FORBIDDEN: 403, // Client authenticated but does not have permission
  NOT_FOUND: 404, // Requested resource not found
  METHOD_NOT_ALLOWED: 405, // HTTP method not allowed on this route
  CONFLICT: 409, // Resource conflict, e.g., duplicate data
  UNPROCESSABLE_ENTITY: 422, // Validation errors in client input

  INTERNAL_SERVER_ERROR: 500, // General server error
  NOT_IMPLEMENTED: 501, // API endpoint not implemented
  BAD_GATEWAY: 502, // Server received an invalid response from an upstream server
  SERVICE_UNAVAILABLE: 503, // Server unavailable, usually due to overload or maintenance
  GATEWAY_TIMEOUT: 504, // Upstream server did not respond in time
};

export default HTTP_STATUS;
