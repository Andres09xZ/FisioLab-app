/**
 * Servicio de Versionado Inmutable (US011)
 * Implementa el patrón de versionado para evaluaciones
 */

import { getClient } from '../config/database.js';

/**
 * Crear nueva versión de una evaluación
 * Este método implementa el patrón inmutable:
 * 1. Desactiva la versión actual
 * 2. Crea una nueva versión con los datos actualizados
 * 3. Incrementa el número de versión
 * 
 * @param {String} evaluacionId - ID de la evaluación a actualizar
 * @param {Object} datosActualizados - Nuevos datos de la evaluación
 * @param {String} motivoCambio - Razón del cambio
 * @param {String} usuarioId - ID del usuario que hace el cambio
 * @returns {Object} Nueva versión de la evaluación
 */
export const crearNuevaVersion = async (
  evaluacionId,
  datosActualizados,
  motivoCambio,
  usuarioId
) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Obtener la evaluación actual
    const evaluacionActual = await client.query(
      `SELECT * FROM evaluaciones_v2 WHERE id = $1 AND es_activa = TRUE`,
      [evaluacionId]
    );

    if (evaluacionActual.rows.length === 0) {
      throw new Error('Evaluación no encontrada o ya está inactiva');
    }

    const evaluacionAnterior = evaluacionActual.rows[0];

    // 2. Desactivar la versión actual
    await client.query(
      `UPDATE evaluaciones_v2 
       SET es_activa = FALSE, 
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [evaluacionId]
    );

    // 3. Crear nueva versión
    const nuevoNumeroVersion = evaluacionAnterior.version_numero + 1;

    const nuevaVersion = await client.query(
      `INSERT INTO evaluaciones_v2 (
        paciente_id,
        parent_id,
        version_numero,
        es_activa,
        motivo_cambio,
        motivo_consulta,
        tiempo_evolucion,
        eva_score,
        hallazgos_clinicos,
        amplitud_movimiento,
        limitaciones_funcionales,
        diagnostico_fisio,
        tratamientos_anteriores,
        creado_por
      ) VALUES ($1, $2, $3, TRUE, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        evaluacionAnterior.paciente_id,
        evaluacionId, // parent_id apunta a la versión anterior
        nuevoNumeroVersion,
        motivoCambio,
        datosActualizados.motivo_consulta || evaluacionAnterior.motivo_consulta,
        datosActualizados.tiempo_evolucion || evaluacionAnterior.tiempo_evolucion,
        datosActualizados.eva_score !== undefined
          ? datosActualizados.eva_score
          : evaluacionAnterior.eva_score,
        datosActualizados.hallazgos_clinicos ||
          evaluacionAnterior.hallazgos_clinicos,
        datosActualizados.amplitud_movimiento ||
          evaluacionAnterior.amplitud_movimiento,
        datosActualizados.limitaciones_funcionales ||
          evaluacionAnterior.limitaciones_funcionales,
        datosActualizados.diagnostico_fisio ||
          evaluacionAnterior.diagnostico_fisio,
        datosActualizados.tratamientos_anteriores ||
          evaluacionAnterior.tratamientos_anteriores,
        usuarioId
      ]
    );

    // 4. Registrar auditoría
    await client.query(
      `INSERT INTO logs_actividad (
        usuario_id, 
        accion, 
        entidad, 
        entidad_id, 
        datos_anteriores, 
        datos_nuevos,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        usuarioId,
        'CREAR_VERSION_EVALUACION',
        'evaluaciones',
        nuevaVersion.rows[0].id,
        JSON.stringify(evaluacionAnterior),
        JSON.stringify(nuevaVersion.rows[0]),
        null // IP se puede obtener del request
      ]
    );

    await client.query('COMMIT');

    return nuevaVersion.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Obtener historial completo de versiones de una evaluación
 * @param {String} evaluacionId - ID de cualquier versión de la evaluación
 * @returns {Array} Todas las versiones ordenadas
 */
export const obtenerHistorialVersiones = async (evaluacionId) => {
  const client = await getClient();

  try {
    // Primero encontramos la raíz de la cadena de versiones
    const resultado = await client.query(
      `WITH RECURSIVE cadena_versiones AS (
        -- Caso base: la versión actual
        SELECT * FROM evaluaciones_v2 WHERE id = $1
        
        UNION ALL
        
        -- Caso recursivo: ir hacia atrás en el historial
        SELECT e.* 
        FROM evaluaciones_v2 e
        INNER JOIN cadena_versiones cv ON e.id = cv.parent_id
      ),
      raiz AS (
        -- Encontrar la versión raíz (sin parent)
        SELECT * FROM cadena_versiones WHERE parent_id IS NULL
      )
      -- Ahora traer todas las versiones desde la raíz hacia adelante
      SELECT e.*,
             p.nombres || ' ' || p.apellidos as nombre_paciente
      FROM evaluaciones_v2 e
      INNER JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.id IN (
        SELECT id FROM raiz
        UNION ALL
        SELECT e2.id FROM evaluaciones_v2 e2
        WHERE e2.parent_id IN (SELECT id FROM raiz)
        OR e2.parent_id IN (
          SELECT id FROM evaluaciones_v2 WHERE parent_id IN (SELECT id FROM raiz)
        )
      )
      ORDER BY e.version_numero ASC`,
      [evaluacionId]
    );

    return resultado.rows;
  } finally {
    client.release();
  }
};

/**
 * Obtener la versión activa actual
 * @param {String} pacienteId - ID del paciente
 * @returns {Object} Versión activa o null
 */
export const obtenerVersionActiva = async (pacienteId) => {
  const client = await getClient();

  try {
    const resultado = await client.query(
      `SELECT e.*,
              p.nombres || ' ' || p.apellidos as nombre_paciente
       FROM evaluaciones_v2 e
       INNER JOIN pacientes p ON e.paciente_id = p.id
       WHERE e.paciente_id = $1 AND e.es_activa = TRUE
       ORDER BY e.fecha_creacion DESC
       LIMIT 1`,
      [pacienteId]
    );

    return resultado.rows[0] || null;
  } finally {
    client.release();
  }
};

/**
 * Comparar dos versiones de una evaluación
 * @param {String} versionAnteriorId - ID de la versión anterior
 * @param {String} versionNuevaId - ID de la versión nueva
 * @returns {Object} Diferencias entre versiones
 */
export const compararVersiones = async (versionAnteriorId, versionNuevaId) => {
  const client = await getClient();

  try {
    const resultado = await client.query(
      `SELECT 
        row_to_json(e1.*) as version_anterior,
        row_to_json(e2.*) as version_nueva
       FROM evaluaciones_v2 e1
       CROSS JOIN evaluaciones e2
       WHERE e1.id = $1 AND e2.id = $2`,
      [versionAnteriorId, versionNuevaId]
    );

    if (resultado.rows.length === 0) {
      throw new Error('Una o ambas versiones no existen');
    }

    const { version_anterior, version_nueva } = resultado.rows[0];
    const diferencias = {};

    // Campos a comparar
    const campos = [
      'motivo_consulta',
      'tiempo_evolucion',
      'eva_score',
      'diagnostico_fisio',
      'limitaciones_funcionales',
      'tratamientos_anteriores'
    ];

    campos.forEach((campo) => {
      if (version_anterior[campo] !== version_nueva[campo]) {
        diferencias[campo] = {
          anterior: version_anterior[campo],
          nuevo: version_nueva[campo]
        };
      }
    });

    return {
      version_anterior: {
        id: version_anterior.id,
        version_numero: version_anterior.version_numero,
        fecha_creacion: version_anterior.fecha_creacion
      },
      version_nueva: {
        id: version_nueva.id,
        version_numero: version_nueva.version_numero,
        fecha_creacion: version_nueva.fecha_creacion,
        motivo_cambio: version_nueva.motivo_cambio
      },
      diferencias
    };
  } finally {
    client.release();
  }
};
