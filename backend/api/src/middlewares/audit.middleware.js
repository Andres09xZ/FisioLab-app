/**
 * Middleware de Auditoría
 * Registra todas las acciones críticas en el sistema
 * Cumple con requisitos de seguridad y trazabilidad (US012)
 */

import { query } from '../config/database.js';

/**
 * Registrar actividad en el log de auditoría
 * @param {String} usuarioId - ID del usuario que realiza la acción
 * @param {String} accion - Tipo de acción (CREATE, UPDATE, DELETE, etc.)
 * @param {String} entidad - Nombre de la entidad afectada
 * @param {String} entidadId - ID de la entidad
 * @param {Object} datosAnteriores - Estado anterior (para UPDATE/DELETE)
 * @param {Object} datosNuevos - Estado nuevo (para CREATE/UPDATE)
 * @param {String} ipAddress - IP del cliente
 * @param {String} userAgent - User Agent del cliente
 */
export const registrarLog = async (
  usuarioId,
  accion,
  entidad,
  entidadId,
  datosAnteriores = null,
  datosNuevos = null,
  ipAddress = null,
  userAgent = null
) => {
  try {
    await query(
      `INSERT INTO logs_actividad (
        usuario_id,
        accion,
        entidad,
        entidad_id,
        datos_anteriores,
        datos_nuevos,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        usuarioId,
        accion,
        entidad,
        entidadId,
        datosAnteriores ? JSON.stringify(datosAnteriores) : null,
        datosNuevos ? JSON.stringify(datosNuevos) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    // No fallar la operación principal si falla el log
    console.error('Error al registrar log de auditoría:', error);
  }
};

/**
 * Middleware para auditar automáticamente las acciones
 */
export const auditMiddleware = (accion, entidad) => {
  return async (req, res, next) => {
    // Guardar referencia al método original
    const originalJson = res.json;

    // Sobrescribir res.json para capturar la respuesta
    res.json = function (data) {
      // Solo auditar respuestas exitosas
      if (res.statusCode < 400) {
        const usuarioId = req.user?.id || 'SYSTEM';
        const entidadId = data?.data?.id || req.params?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        let datosAnteriores = null;
        let datosNuevos = null;

        // Configurar datos según el tipo de acción
        if (accion === 'DELETE') {
          datosAnteriores = req.deletedData || null;
        } else if (accion === 'UPDATE') {
          datosAnteriores = req.originalData || null;
          datosNuevos = data?.data || null;
        } else if (accion === 'CREATE') {
          datosNuevos = data?.data || null;
        }

        // Registrar log de forma asíncrona
        registrarLog(
          usuarioId,
          accion,
          entidad,
          entidadId,
          datosAnteriores,
          datosNuevos,
          ipAddress,
          userAgent
        ).catch((err) => {
          console.error('Error en auditoría:', err);
        });
      }

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware para capturar datos antes de eliminar
 */
export const captureBeforeDelete = (entidad, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const id = req.params[idParam];
      const result = await query(`SELECT * FROM ${entidad} WHERE id = $1`, [
        id
      ]);

      if (result.rows.length > 0) {
        req.deletedData = result.rows[0];
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para capturar datos antes de actualizar
 */
export const captureBeforeUpdate = (entidad, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const id = req.params[idParam];
      const result = await query(`SELECT * FROM ${entidad} WHERE id = $1`, [
        id
      ]);

      if (result.rows.length > 0) {
        req.originalData = result.rows[0];
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Obtener logs de auditoría con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Array} Logs encontrados
 */
export const obtenerLogs = async (filtros = {}) => {
  let whereConditions = [];
  let params = [];
  let paramCount = 1;

  if (filtros.usuarioId) {
    whereConditions.push(`usuario_id = $${paramCount}`);
    params.push(filtros.usuarioId);
    paramCount++;
  }

  if (filtros.accion) {
    whereConditions.push(`accion = $${paramCount}`);
    params.push(filtros.accion);
    paramCount++;
  }

  if (filtros.entidad) {
    whereConditions.push(`entidad = $${paramCount}`);
    params.push(filtros.entidad);
    paramCount++;
  }

  if (filtros.entidadId) {
    whereConditions.push(`entidad_id = $${paramCount}`);
    params.push(filtros.entidadId);
    paramCount++;
  }

  if (filtros.fechaDesde) {
    whereConditions.push(`timestamp >= $${paramCount}`);
    params.push(filtros.fechaDesde);
    paramCount++;
  }

  if (filtros.fechaHasta) {
    whereConditions.push(`timestamp <= $${paramCount}`);
    params.push(filtros.fechaHasta);
    paramCount++;
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const limit = filtros.limit || 100;
  const offset = filtros.offset || 0;

  const resultado = await query(
    `SELECT * FROM logs_actividad
     ${whereClause}
     ORDER BY timestamp DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    [...params, limit, offset]
  );

  return resultado.rows;
};

/**
 * Obtener estadísticas de auditoría
 * @param {String} usuarioId - ID del usuario (opcional)
 * @returns {Object} Estadísticas
 */
export const obtenerEstadisticasAuditoria = async (usuarioId = null) => {
  const whereClause = usuarioId ? 'WHERE usuario_id = $1' : '';
  const params = usuarioId ? [usuarioId] : [];

  const resultado = await query(
    `SELECT 
      accion,
      COUNT(*) as total,
      MAX(timestamp) as ultima_accion
     FROM logs_actividad
     ${whereClause}
     GROUP BY accion
     ORDER BY total DESC`,
    params
  );

  return resultado.rows;
};

/**
 * Exportar logs de auditoría a CSV
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {String} CSV content
 */
export const exportarLogsCSV = async (filtros = {}) => {
  const logs = await obtenerLogs({ ...filtros, limit: 10000 });

  // Encabezados
  const headers = [
    'ID',
    'Usuario ID',
    'Acción',
    'Entidad',
    'Entidad ID',
    'IP Address',
    'Timestamp'
  ];

  // Filas
  const rows = logs.map((log) => [
    log.id,
    log.usuario_id,
    log.accion,
    log.entidad,
    log.entidad_id || '',
    log.ip_address || '',
    log.timestamp
  ]);

  // Construir CSV
  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};
