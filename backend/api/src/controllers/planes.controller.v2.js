/**
 * Controlador de Planes de Tratamiento con Smart Scheduling
 * Implementa US013, US014, US015, US016, US017
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
  generarSesiones,
  reprogramarSesion,
  buscarHorariosDisponibles
} from '../services/scheduling.service.js';
import {
  validarDatosPlan,
  validarDiasSemana,
  sanitizarDatos
} from '../middlewares/validators.js';
import { query, getClient } from '../config/database.js';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import { registrarLog } from '../middlewares/audit.middleware.js';

/**
 * US014: Listar planes de tratamiento con progreso
 * GET /api/planes
 */
export const listPlanes = async (req, res, next) => {
  try {
    const {
      page = 1,
      page_size = 20,
      paciente_id,
      evaluacion_id,
      estado,
      sort = 'fecha_inicio',
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

    if (evaluacion_id) {
      conditions.push(`pt.evaluacion_id = $${paramCount}`);
      params.push(evaluacion_id);
      paramCount++;
    }

    if (estado) {
      conditions.push(`pt.estado = $${paramCount}`);
      params.push(estado);
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Obtener total
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM planes_v2 pt
       INNER JOIN evaluaciones_v2 e ON pt.evaluacion_id = e.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Obtener planes con progreso
    const result = await query(
      `SELECT 
        pt.*,
        p.nombres || ' ' || p.apellidos as nombre_paciente,
        e.diagnostico_fisio,
        COUNT(CASE WHEN s.estado = 'REALIZADA' THEN 1 END) as sesiones_completadas,
        COUNT(CASE WHEN s.estado = 'PENDIENTE' THEN 1 END) as sesiones_pendientes,
        ROUND(
          (COUNT(CASE WHEN s.estado = 'REALIZADA' THEN 1 END)::NUMERIC / pt.total_sesiones) * 100,
          2
        ) as porcentaje_completado
       FROM planes_v2 pt
       INNER JOIN evaluaciones_v2 e ON pt.evaluacion_id = e.id
       INNER JOIN pacientes p ON e.paciente_id = p.id
       LEFT JOIN sesiones_v2 s ON pt.id = s.plan_id
       ${whereClause}
       GROUP BY pt.id, p.id, e.id
       ORDER BY pt.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(res, result.rows, total, page, page_size);
  } catch (error) {
    next(error);
  }
};

/**
 * US014: Obtener plan específico con detalle de sesiones
 * GET /api/planes/:id
 */
export const getPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        pt.*,
        p.nombres || ' ' || p.apellidos as nombre_paciente,
        p.celular as celular_paciente,
        e.diagnostico_fisio,
        e.motivo_consulta,
        COUNT(CASE WHEN s.estado = 'REALIZADA' THEN 1 END) as sesiones_completadas,
        COUNT(CASE WHEN s.estado = 'PENDIENTE' THEN 1 END) as sesiones_pendientes,
        ROUND(
          (COUNT(CASE WHEN s.estado = 'REALIZADA' THEN 1 END)::NUMERIC / pt.total_sesiones) * 100,
          2
        ) as porcentaje_completado
       FROM planes_v2 pt
       INNER JOIN evaluaciones_v2 e ON pt.evaluacion_id = e.id
       INNER JOIN pacientes p ON e.paciente_id = p.id
       LEFT JOIN sesiones_v2 s ON pt.id = s.plan_id
       WHERE pt.id = $1
       GROUP BY pt.id, p.id, e.id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Plan de tratamiento', id);
    }

    const plan = result.rows[0];

    // Obtener sesiones del plan
    const sesiones = await query(
      `SELECT 
        s.*,
        u.nombre as nombre_profesional
       FROM sesiones_v2 s
       LEFT JOIN usuarios u ON s.profesional_id = u.id
       WHERE s.plan_id = $1
       ORDER BY s.numero_sesion ASC`,
      [id]
    );

    plan.sesiones = sesiones.rows;

    return successResponse(res, plan);
  } catch (error) {
    next(error);
  }
};

/**
 * US013: Crear plan de tratamiento
 * POST /api/planes
 */
export const createPlan = async (req, res, next) => {
  try {
    const datos = sanitizarDatos(req.body);

    // Validar datos
    const validacion = validarDatosPlan(datos);
    if (!validacion.valido) {
      return validationErrorResponse(res, validacion.errores);
    }

    // Verificar que la evaluación existe
    const evaluacionExiste = await query(
      `SELECT e.*, p.id as paciente_id
       FROM evaluaciones_v2 e
       INNER JOIN pacientes p ON e.paciente_id = p.id
       WHERE e.id = $1 AND e.es_activa = TRUE`,
      [datos.evaluacion_id]
    );

    if (evaluacionExiste.rows.length === 0) {
      throw new NotFoundError('Evaluación activa', datos.evaluacion_id);
    }

    const evaluacion = evaluacionExiste.rows[0];

    // Calcular fecha fin estimada
    const fechaInicio = new Date(datos.fecha_inicio);
    const diasEstimados = Math.ceil(
      (datos.total_sesiones / datos.frecuencia_semanal) * 7
    );
    const fechaFinEstimada = new Date(fechaInicio);
    fechaFinEstimada.setDate(fechaFinEstimada.getDate() + diasEstimados);

    // Crear plan
    const result = await query(
      `INSERT INTO planes_v2 (
        evaluacion_id,
        objetivos,
        total_sesiones,
        frecuencia_semanal,
        estado,
        fecha_inicio,
        fecha_fin_estimada,
        notas,
        creado_por
      ) VALUES ($1, $2, $3, $4, 'ACTIVO', $5, $6, $7, $8)
      RETURNING *`,
      [
        datos.evaluacion_id,
        datos.objetivos,
        datos.total_sesiones,
        datos.frecuencia_semanal,
        datos.fecha_inicio,
        fechaFinEstimada.toISOString().split('T')[0],
        datos.notas || null,
        req.user?.id || null
      ]
    );

    const plan = result.rows[0];

    // Registrar auditoría
    await registrarLog(
      req.user?.id || 'SYSTEM',
      'CREATE',
      'planes_v2',
      plan.id,
      null,
      plan,
      req.ip,
      req.get('user-agent')
    );

    return createdResponse(res, plan, `/api/planes/${plan.id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * US017: Generar sesiones automáticamente con Smart Scheduling
 * POST /api/planes/:id/generar-sesiones
 */
export const generarSesionesPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = sanitizarDatos(req.body);

    const { fecha_inicio, dias_semana, hora, profesional_id, duracion_minutos = 60 } = datos;

    // Validaciones
    if (!fecha_inicio || !dias_semana || !hora || !profesional_id) {
      return validationErrorResponse(res, [
        { field: 'fecha_inicio', message: 'Fecha de inicio es requerida' },
        { field: 'dias_semana', message: 'Días de la semana son requeridos' },
        { field: 'hora', message: 'Hora es requerida (formato HH:MM)' },
        { field: 'profesional_id', message: 'ID del profesional es requerido' }
      ].filter(Boolean));
    }

    // Validar días de la semana
    const validacionDias = validarDiasSemana(dias_semana);
    if (!validacionDias.valido) {
      return validationErrorResponse(res, [
        { field: 'dias_semana', message: validacionDias.mensaje }
      ]);
    }

    // Verificar que el plan existe
    const planExiste = await query(
      `SELECT * FROM planes_v2 WHERE id = $1`,
      [id]
    );

    if (planExiste.rows.length === 0) {
      throw new NotFoundError('Plan de tratamiento', id);
    }

    // Verificar que el profesional existe
    const profesionalExiste = await query(
      `SELECT id FROM profesionales WHERE id = $1`,
      [profesional_id]
    );

    if (profesionalExiste.rows.length === 0) {
      throw new NotFoundError('Profesional', profesional_id);
    }

    // Generar sesiones con algoritmo inteligente
    const resultado = await generarSesiones(
      id,
      new Date(fecha_inicio),
      dias_semana,
      hora,
      profesional_id,
      duracion_minutos
    );

    // Registrar auditoría
    await registrarLog(
      req.user?.id || 'SYSTEM',
      'GENERAR_SESIONES',
      'planes_v2',
      id,
      null,
      { total_sesiones: resultado.sesionesGeneradas, conflictos: resultado.conflictos.length },
      req.ip,
      req.get('user-agent')
    );

    return createdResponse(res, resultado, `/api/planes/${id}/sesiones`);
  } catch (error) {
    next(error);
  }
};

/**
 * US015: Actualizar plan de tratamiento
 * PATCH /api/planes/:id
 */
export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = sanitizarDatos(req.body);

    // Verificar que el plan existe
    const planExiste = await query(
      `SELECT * FROM planes_v2 WHERE id = $1`,
      [id]
    );

    if (planExiste.rows.length === 0) {
      throw new NotFoundError('Plan de tratamiento', id);
    }

    const planAnterior = planExiste.rows[0];

    // Construir query de actualización
    const campos = [];
    const valores = [];
    let paramCount = 1;

    if (datos.objetivos !== undefined) {
      campos.push(`objetivos = $${paramCount}`);
      valores.push(datos.objetivos);
      paramCount++;
    }

    if (datos.estado !== undefined) {
      campos.push(`estado = $${paramCount}`);
      valores.push(datos.estado);
      paramCount++;
    }

    if (datos.notas !== undefined) {
      campos.push(`notas = $${paramCount}`);
      valores.push(datos.notas);
      paramCount++;
    }

    if (datos.total_sesiones !== undefined) {
      campos.push(`total_sesiones = $${paramCount}`);
      valores.push(datos.total_sesiones);
      paramCount++;
    }

    if (datos.fecha_fin_real !== undefined) {
      campos.push(`fecha_fin_real = $${paramCount}`);
      valores.push(datos.fecha_fin_real);
      paramCount++;
    }

    if (campos.length === 0) {
      return validationErrorResponse(res, [
        { field: 'body', message: 'No hay campos para actualizar' }
      ]);
    }

    // Actualizar plan
    valores.push(id);
    const result = await query(
      `UPDATE planes_v2 
       SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      valores
    );

    const planActualizado = result.rows[0];

    // Registrar auditoría
    await registrarLog(
      req.user?.id || 'SYSTEM',
      'UPDATE',
      'planes_v2',
      id,
      planAnterior,
      planActualizado,
      req.ip,
      req.get('user-agent')
    );

    return successResponse(res, planActualizado);
  } catch (error) {
    next(error);
  }
};

/**
 * US016: Registrar sesión realizada
 * PATCH /api/sesiones/:id
 */
export const registrarSesion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = sanitizarDatos(req.body);

    // Verificar que la sesión existe
    const sesionExiste = await query(
      `SELECT * FROM sesiones_v2 WHERE id = $1`,
      [id]
    );

    if (sesionExiste.rows.length === 0) {
      throw new NotFoundError('Sesión', id);
    }

    const sesionAnterior = sesionExiste.rows[0];

    // Actualizar sesión
    const result = await query(
      `UPDATE sesiones
       SET estado = $1,
           fecha_realizada = $2,
           eva_inicial = $3,
           eva_final = $4,
           ejercicios_ejecutados = $5,
           tecnicas_aplicadas = $6,
           observaciones = $7,
           evolucion_paciente = $8,
           duracion_minutos = $9,
           asistencia = $10,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        datos.estado || 'REALIZADA',
        datos.fecha_realizada || new Date().toISOString(),
        datos.eva_inicial || null,
        datos.eva_final || null,
        JSON.stringify(datos.ejercicios_ejecutados || []),
        JSON.stringify(datos.tecnicas_aplicadas || []),
        datos.observaciones || null,
        datos.evolucion_paciente || null,
        datos.duracion_minutos || null,
        datos.asistencia !== undefined ? datos.asistencia : true,
        id
      ]
    );

    const sesionActualizada = result.rows[0];

    // Registrar auditoría
    await registrarLog(
      req.user?.id || 'SYSTEM',
      'UPDATE',
      'sesiones_v2',
      id,
      sesionAnterior,
      sesionActualizada,
      req.ip,
      req.get('user-agent')
    );

    return successResponse(res, sesionActualizada);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener sesiones de un plan
 * GET /api/planes/:id/sesiones
 */
export const getSesionesPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.query;

    let whereClause = 'WHERE s.plan_id = $1';
    const params = [id];

    if (estado) {
      whereClause += ' AND s.estado = $2';
      params.push(estado);
    }

    const result = await query(
      `SELECT 
        s.*,
        u.nombre as nombre_profesional
       FROM sesiones_v2 s
       LEFT JOIN usuarios u ON s.profesional_id = u.id
       ${whereClause}
       ORDER BY s.numero_sesion ASC`,
      params
    );

    return successResponse(res, result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Reprogramar una sesión
 * POST /api/sesiones/:id/reprogramar
 */
export const reprogramarSesionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nueva_fecha, motivo } = req.body;

    if (!nueva_fecha || !motivo) {
      return validationErrorResponse(res, [
        { field: 'nueva_fecha', message: 'Nueva fecha es requerida' },
        { field: 'motivo', message: 'Motivo de reprogramación es requerido' }
      ]);
    }

    const sesionActualizada = await reprogramarSesion(
      id,
      new Date(nueva_fecha),
      motivo
    );

    return successResponse(res, sesionActualizada, 200, {
      message: 'Sesión reprogramada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar horarios disponibles
 * GET /api/profesionales/:profesional_id/horarios-disponibles
 */
export const buscarHorariosDisponiblesProfesional = async (req, res, next) => {
  try {
    const { profesional_id } = req.params;
    const { fecha, duracion = 60 } = req.query;

    if (!fecha) {
      return validationErrorResponse(res, [
        { field: 'fecha', message: 'Fecha es requerida (formato: YYYY-MM-DD)' }
      ]);
    }

    const horarios = await buscarHorariosDisponibles(
      profesional_id,
      new Date(fecha),
      parseInt(duracion)
    );

    return successResponse(res, horarios, 200, {
      fecha,
      total_disponibles: horarios.length
    });
  } catch (error) {
    next(error);
  }
};
