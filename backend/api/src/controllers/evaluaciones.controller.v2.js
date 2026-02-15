/**
 * Controlador de Evaluaciones con Versionado Inmutable
 * Implementa US009, US010, US011, US012
 */

import {
  successResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  paginatedResponse,
  validationErrorResponse
} from '../utils/apiResponse.js';
import {
  crearNuevaVersion,
  obtenerHistorialVersiones,
  obtenerVersionActiva,
  compararVersiones
} from '../services/versionado.service.js';
import {
  validarDatosEvaluacion,
  sanitizarDatos
} from '../middlewares/validators.js';
import { query } from '../config/database.js';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import { registrarLog } from '../middlewares/audit.middleware.js';

/**
 * US010: Listar evaluaciones con paginación
 * GET /api/evaluaciones
 */
export const listEvaluaciones = async (req, res, next) => {
  try {
    const {
      page = 1,
      page_size = 20,
      paciente_id,
      es_activa,
      sort = 'fecha_creacion',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const limit = parseInt(page_size);

    // Construir WHERE clause
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (paciente_id) {
      conditions.push(`e.paciente_id = $${paramCount}`);
      params.push(paciente_id);
      paramCount++;
    }

    if (es_activa !== undefined) {
      conditions.push(`e.es_activa = $${paramCount}`);
      params.push(es_activa === 'true');
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validar campo de ordenamiento
    const validSortFields = [
      'fecha_creacion',
      'version_numero',
      'eva_score',
      'motivo_consulta'
    ];
    const sortField = validSortFields.includes(sort) ? sort : 'fecha_creacion';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Obtener total de registros
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM evaluaciones_v2 e
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Obtener evaluaciones
    const result = await query(
      `SELECT 
        e.*,
        p.nombres || ' ' || p.apellidos as nombre_paciente,
        u.nombre as nombre_profesional,
        (SELECT COUNT(*) FROM evaluaciones_v2 WHERE parent_id = e.id) as total_versiones
       FROM evaluaciones_v2 e
       INNER JOIN pacientes p ON e.paciente_id = p.id
       LEFT JOIN usuarios u ON e.creado_por = u.id
       ${whereClause}
       ORDER BY e.${sortField} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(res, result.rows, total, page, page_size);
  } catch (error) {
    next(error);
  }
};

/**
 * US009: Obtener evaluación por ID con historial de versiones
 * GET /api/evaluaciones/:id
 */
export const getEvaluacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { incluir_historial = 'false' } = req.query;

    const result = await query(
      `SELECT 
        e.*,
        p.nombres || ' ' || p.apellidos as nombre_paciente,
        p.documento,
        p.celular,
        u.nombre as nombre_profesional
       FROM evaluaciones_v2 e
       INNER JOIN pacientes p ON e.paciente_id = p.id
       LEFT JOIN usuarios u ON e.creado_por = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Evaluación', id);
    }

    const evaluacion = result.rows[0];

    // Incluir historial de versiones si se solicita
    if (incluir_historial === 'true') {
      const historial = await obtenerHistorialVersiones(id);
      evaluacion.historial_versiones = historial;
    }

    return successResponse(res, evaluacion);
  } catch (error) {
    next(error);
  }
};

/**
 * US009: Crear nueva evaluación (versión 1)
 * POST /api/evaluaciones
 */
export const createEvaluacion = async (req, res, next) => {
  try {
    const datos = sanitizarDatos(req.body);

    // Validar datos
    const validacion = validarDatosEvaluacion(datos);
    if (!validacion.valido) {
      return validationErrorResponse(res, validacion.errores);
    }

    // Verificar que el paciente existe
    const pacienteExiste = await query(
      `SELECT id FROM pacientes WHERE id = $1`,
      [datos.paciente_id]
    );

    if (pacienteExiste.rows.length === 0) {
      throw new NotFoundError('Paciente', datos.paciente_id);
    }

    // Calcular el siguiente número de versión para este paciente
    const versionResult = await query(
      `SELECT COALESCE(MAX(version_numero), 0) + 1 as siguiente_version
       FROM evaluaciones_v2
       WHERE paciente_id = $1`,
      [datos.paciente_id]
    );
    const siguienteVersion = versionResult.rows[0].siguiente_version;

    // Crear evaluación
    const result = await query(
      `INSERT INTO evaluaciones_v2 (
        paciente_id,
        motivo_consulta,
        historia_enfermedad_actual,
        diagnostico_fisio,
        hallazgos_clinicos,
        eva_score,
        observaciones,
        creado_por,
        version_numero,
        es_activa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
      RETURNING *`,
      [
        datos.paciente_id,
        datos.motivo_consulta,
        datos.historia_enfermedad_actual || null,
        datos.diagnostico_fisio,
        JSON.stringify(datos.hallazgos_clinicos || {}),
        datos.eva_score || null,
        datos.observaciones || null,
        req.user?.id || null,
        siguienteVersion
      ]
    );

    const evaluacion = result.rows[0];

    // Registrar auditoría
    await registrarLog(
      req.user?.id || 'SYSTEM',
      'CREATE',
      'evaluaciones_v2',
      evaluacion.id,
      null,
      evaluacion,
      req.ip,
      req.get('user-agent')
    );

    return createdResponse(
      res,
      evaluacion,
      `/api/evaluaciones/${evaluacion.id}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * US011: Actualizar evaluación (CREAR NUEVA VERSIÓN inmutable)
 * PUT /api/evaluaciones/:id
 */
export const updateEvaluacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = sanitizarDatos(req.body);
    const { motivo_cambio } = datos;

    if (!motivo_cambio) {
      return validationErrorResponse(res, [
        {
          field: 'motivo_cambio',
          message: 'Debe especificar el motivo del cambio de versión'
        }
      ]);
    }

    // Validar datos actualizados
    const validacion = validarDatosEvaluacion({
      ...datos,
      paciente_id: 'dummy' // Se mantiene el paciente original
    });

    if (!validacion.valido) {
      return validationErrorResponse(res, validacion.errores);
    }

    // Crear nueva versión
    const nuevaVersion = await crearNuevaVersion(
      id,
      datos,
      motivo_cambio,
      req.user?.id || 'SYSTEM'
    );

    return successResponse(res, nuevaVersion, 200, {
      message: 'Nueva versión de evaluación creada exitosamente',
      version_anterior: id,
      version_nueva: nuevaVersion.id,
      numero_version: nuevaVersion.version_numero
    });
  } catch (error) {
    next(error);
  }
};

/**
 * US012: Eliminar evaluación (soft delete con auditoría)
 * DELETE /api/evaluaciones/:id
 */
export const deleteEvaluacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return validationErrorResponse(res, [
        {
          field: 'motivo',
          message: 'Debe especificar el motivo de la eliminación'
        }
      ]);
    }

    // Verificar que existe
    const evaluacionExiste = await query(
      `SELECT * FROM evaluaciones_v2 WHERE id = $1`,
      [id]
    );

    if (evaluacionExiste.rows.length === 0) {
      throw new NotFoundError('Evaluación', id);
    }

    const evaluacionAnterior = evaluacionExiste.rows[0];

    // Verificar si tiene planes asociados
    const planesAsociados = await query(
      `SELECT COUNT(*) as total FROM planes_tratamiento WHERE evaluacion_id = $1`,
      [id]
    );

    if (parseInt(planesAsociados.rows[0].total) > 0) {
      return validationErrorResponse(res, [
        {
          field: 'evaluacion_id',
          message: `No se puede eliminar. Esta evaluación tiene ${planesAsociados.rows[0].total} plan(es) de tratamiento asociado(s)`
        }
      ]);
    }

    // Eliminar evaluación
    await query(`DELETE FROM evaluaciones_v2 WHERE id = $1`, [id]);

    // Registrar auditoría
    await registrarLog(
      req.user?.id || 'SYSTEM',
      'DELETE_EVALUACION',
      'evaluaciones_v2',
      id,
      evaluacionAnterior,
      { motivo },
      req.ip,
      req.get('user-agent')
    );

    return noContentResponse(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener evaluaciones activas de un paciente
 * GET /api/pacientes/:id/evaluaciones
 */
export const listEvaluacionesByPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        e.*,
        u.nombre as nombre_profesional
       FROM evaluaciones_v2 e
       LEFT JOIN usuarios u ON e.creado_por = u.id
       WHERE e.paciente_id = $1 AND e.es_activa = TRUE
       ORDER BY e.fecha_creacion DESC`,
      [id]
    );

    return successResponse(res, result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Comparar dos versiones de una evaluación
 * GET /api/evaluaciones/:id/comparar/:version_id
 */
export const compararVersionesEvaluacion = async (req, res, next) => {
  try {
    const { id, version_id } = req.params;

    const comparacion = await compararVersiones(id, version_id);

    return successResponse(res, comparacion);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial completo de versiones
 * GET /api/evaluaciones/:id/historial
 */
export const getHistorialVersiones = async (req, res, next) => {
  try {
    const { id } = req.params;

    const historial = await obtenerHistorialVersiones(id);

    return successResponse(res, historial, 200, {
      total_versiones: historial.length
    });
  } catch (error) {
    next(error);
  }
};
