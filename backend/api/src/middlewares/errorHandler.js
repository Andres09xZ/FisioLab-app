/**
 * Middleware de manejo global de errores
 * Siguiendo principios REST de respuestas consistentes
 */

import {
  errorResponse,
  validationErrorResponse,
  conflictResponse
} from '../utils/apiResponse.js';

/**
 * Middleware de manejo de errores global
 */
export const errorHandler = (err, req, res, next) => {
  // Log del error para debugging
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user?.id
  });

  // Errores de validación de PostgreSQL
  if (err.code && err.code.startsWith('23')) {
    return handleDatabaseError(err, req, res);
  }

  // Errores de validación custom
  if (err.name === 'ValidationError') {
    return validationErrorResponse(res, err.errors || [{ message: err.message }]);
  }

  // Error de recurso no encontrado
  if (err.name === 'NotFoundError' || err.statusCode === 404) {
    return errorResponse(res, err.message || 'Recurso no encontrado', 404);
  }

  // Error de autenticación
  if (err.name === 'UnauthorizedError' || err.statusCode === 401) {
    return errorResponse(
      res,
      err.message || 'No autorizado. Token inválido o expirado',
      401
    );
  }

  // Error de permisos
  if (err.name === 'ForbiddenError' || err.statusCode === 403) {
    return errorResponse(
      res,
      err.message || 'No tiene permisos para realizar esta acción',
      403
    );
  }

  // Error de conflicto
  if (err.name === 'ConflictError' || err.statusCode === 409) {
    return conflictResponse(res, err.message, err.details);
  }

  // Error de rate limiting
  if (err.statusCode === 429) {
    res.setHeader('Retry-After', '60');
    return errorResponse(
      res,
      'Demasiadas solicitudes. Por favor intente más tarde',
      429
    );
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message;

  return errorResponse(res, message, statusCode, {
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack
    })
  });
};

/**
 * Manejo específico de errores de base de datos
 */
const handleDatabaseError = (err, req, res) => {
  // Constraint de clave única
  if (err.code === '23505') {
    const field = extractFieldFromConstraint(err.constraint);
    return conflictResponse(
      res,
      `El ${field} ya existe en el sistema`,
      {
        constraint: err.constraint,
        detail: err.detail
      }
    );
  }

  // Violación de foreign key
  if (err.code === '23503') {
    return errorResponse(
      res,
      'El recurso referenciado no existe',
      400,
      {
        constraint: err.constraint,
        detail: err.detail
      }
    );
  }

  // Violación de check constraint
  if (err.code === '23514') {
    return validationErrorResponse(res, [
      {
        field: extractFieldFromConstraint(err.constraint),
        message: 'Valor fuera del rango permitido',
        detail: err.detail
      }
    ]);
  }

  // Violación de not null
  if (err.code === '23502') {
    return validationErrorResponse(res, [
      {
        field: err.column,
        message: 'Este campo es requerido'
      }
    ]);
  }

  // Error genérico de base de datos
  return errorResponse(
    res,
    'Error de base de datos',
    500,
    process.env.NODE_ENV !== 'production' ? { detail: err.detail } : undefined
  );
};

/**
 * Extraer nombre de campo del constraint de PostgreSQL
 */
const extractFieldFromConstraint = (constraint) => {
  if (!constraint) return 'campo';

  // Ejemplo: "pacientes_numero_documento_key" -> "número de documento"
  const parts = constraint.split('_');
  if (parts.length > 2) {
    return parts.slice(1, -1).join(' ');
  }

  return constraint;
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404,
    {
      availableRoutes: [
        '/api/pacientes',
        '/api/evaluaciones',
        '/api/planes',
        '/api/sesiones',
        '/api/profesionales'
      ]
    }
  );
};

/**
 * Wrapper para funciones async (prevenir errores no capturados)
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Clase para errores customizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 422);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id
      ? `${resource} con ID '${id}' no encontrado`
      : `${resource} no encontrado`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}
