/**
 * Utilidades para respuestas API consistentes
 * Siguiendo principios REST y mejores prácticas
 */

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Express response object
 * @param {Object} data - Datos a retornar
 * @param {Number} statusCode - Código HTTP (default: 200)
 * @param {Object} meta - Metadata adicional
 */
export const successResponse = (res, data, statusCode = 200, meta = {}) => {
  const response = {
    success: true,
    data,
    ...meta
  };

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de recurso creado (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Recurso creado
 * @param {String} location - URL del nuevo recurso
 */
export const createdResponse = (res, data, location = null) => {
  const response = {
    success: true,
    message: 'Recurso creado exitosamente',
    data
  };

  if (location) {
    res.setHeader('Location', location);
  }

  return res.status(201).json(response);
};

/**
 * Respuesta sin contenido (204)
 * @param {Object} res - Express response object
 */
export const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Respuesta de error estándar
 * @param {Object} res - Express response object
 * @param {String} message - Mensaje de error
 * @param {Number} statusCode - Código HTTP
 * @param {Object} details - Detalles adicionales del error
 */
export const errorResponse = (
  res,
  message,
  statusCode = 500,
  details = null
) => {
  const response = {
    success: false,
    error: getErrorType(statusCode),
    message,
    timestamp: new Date().toISOString(),
    path: res.req.originalUrl
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de validación fallida (422)
 * @param {Object} res - Express response object
 * @param {Array} errors - Array de errores de validación
 */
export const validationErrorResponse = (res, errors) => {
  return res.status(422).json({
    success: false,
    error: 'ValidationError',
    message: 'Error de validación en la solicitud',
    details: {
      errors: errors.map((err) => ({
        field: err.field || err.param,
        message: err.message || err.msg,
        value: err.value
      }))
    },
    timestamp: new Date().toISOString(),
    path: res.req.originalUrl
  });
};

/**
 * Respuesta de recurso no encontrado (404)
 * @param {Object} res - Express response object
 * @param {String} resource - Nombre del recurso
 * @param {String} id - ID del recurso
 */
export const notFoundResponse = (res, resource, id = null) => {
  const message = id
    ? `${resource} con ID '${id}' no encontrado`
    : `${resource} no encontrado`;

  return errorResponse(res, message, 404, { resource, id });
};

/**
 * Respuesta de conflicto (409)
 * @param {Object} res - Express response object
 * @param {String} message - Mensaje del conflicto
 * @param {Object} details - Detalles del conflicto
 */
export const conflictResponse = (res, message, details = null) => {
  return errorResponse(res, message, 409, details);
};

/**
 * Respuesta de no autorizado (401)
 * @param {Object} res - Express response object
 * @param {String} message - Mensaje
 */
export const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(res, message, 401);
};

/**
 * Respuesta de prohibido (403)
 * @param {Object} res - Express response object
 * @param {String} message - Mensaje
 */
export const forbiddenResponse = (
  res,
  message = 'No tiene permisos para realizar esta acción'
) => {
  return errorResponse(res, message, 403);
};

/**
 * Respuesta paginada
 * @param {Object} res - Express response object
 * @param {Array} items - Items de la página actual
 * @param {Number} total - Total de items
 * @param {Number} page - Página actual
 * @param {Number} pageSize - Tamaño de página
 */
export const paginatedResponse = (res, items, total, page, pageSize) => {
  const totalPages = Math.ceil(total / pageSize);

  return successResponse(res, items, 200, {
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};

/**
 * Obtener tipo de error según código HTTP
 * @param {Number} statusCode - Código HTTP
 * @returns {String} Tipo de error
 */
const getErrorType = (statusCode) => {
  const errorTypes = {
    400: 'BadRequest',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'NotFound',
    409: 'Conflict',
    422: 'ValidationError',
    429: 'TooManyRequests',
    500: 'InternalServerError',
    503: 'ServiceUnavailable'
  };

  return errorTypes[statusCode] || 'Error';
};

/**
 * Wrapper para manejo de errores async
 * @param {Function} fn - Función async
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
