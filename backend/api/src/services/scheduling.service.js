/**
 * Servicio de Smart Scheduling (US017)
 * Algoritmo inteligente para generación de sesiones
 * Detecta conflictos y propone horarios alternativos
 */

import { getClient } from '../config/database.js';

/**
 * Generar sesiones automáticamente para un plan de tratamiento
 * 
 * @param {String} planId - ID del plan de tratamiento
 * @param {Date} fechaInicio - Fecha de inicio
 * @param {Array} diasSemana - Días de la semana [0-6] (0=Domingo, 1=Lunes, etc.)
 * @param {String} hora - Hora en formato HH:MM
 * @param {String} profesionalId - ID del profesional asignado
 * @param {Number} duracionMinutos - Duración de cada sesión (default: 60)
 * @returns {Object} Sesiones generadas y conflictos detectados
 */
export const generarSesiones = async (
  planId,
  fechaInicio,
  diasSemana,
  hora,
  profesionalId,
  duracionMinutos = 60
) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Obtener información del plan
    const planResult = await client.query(
      `SELECT pt.*, p.id as paciente_id
       FROM planes_v2 pt
       INNER JOIN pacientes p ON pt.paciente_id = p.id
       WHERE pt.id = $1`,
      [planId]
    );

    if (planResult.rows.length === 0) {
      throw new Error('Plan de tratamiento no encontrado');
    }

    const plan = planResult.rows[0];

    // 2. Verificar sesiones ya creadas
    const sesionesExistentes = await client.query(
      `SELECT COUNT(*) as count FROM sesiones_v2 WHERE plan_id = $1`,
      [planId]
    );

    const sesionesRestantes =
      plan.total_sesiones - parseInt(sesionesExistentes.rows[0].count);

    if (sesionesRestantes <= 0) {
      throw new Error('El plan ya tiene todas las sesiones generadas');
    }

    // 3. Generar fechas propuestas
    const fechasPropuestas = calcularFechasSesiones(
      fechaInicio,
      diasSemana,
      sesionesRestantes,
      hora
    );

    // 4. Verificar conflictos para cada fecha
    const sesionesGeneradas = [];
    const conflictos = [];
    let numeroSesion =
      parseInt(sesionesExistentes.rows[0].count) + 1;

    for (const fechaPropuesta of fechasPropuestas) {
      const conflicto = await verificarConflictos(
        client,
        fechaPropuesta,
        profesionalId,
        duracionMinutos
      );

      if (conflicto.hayConflicto) {
        // Buscar horario alternativo
        const horarioAlternativo = await buscarHorarioAlternativo(
          client,
          fechaPropuesta,
          profesionalId,
          duracionMinutos
        );

        if (horarioAlternativo) {
          // Crear sesión con horario alternativo
          const sesion = await crearSesion(
            client,
            planId,
            plan.paciente_id,
            numeroSesion,
            horarioAlternativo,
            profesionalId
          );
          sesionesGeneradas.push(sesion);
        } else {
          // No se encontró alternativa, registrar conflicto
          conflictos.push({
            fecha: fechaPropuesta,
            numeroSesion,
            motivo: conflicto.motivo,
            sugerencia: 'Revisar manualmente'
          });
        }
      } else {
        // Sin conflicto, crear sesión normalmente
        const sesion = await crearSesion(
          client,
          planId,
          plan.paciente_id,
          numeroSesion,
          fechaPropuesta,
          profesionalId
        );
        sesionesGeneradas.push(sesion);
      }

      numeroSesion++;
    }

    await client.query('COMMIT');

    return {
      planId,
      sesionesGeneradas: sesionesGeneradas.length,
      sesiones: sesionesGeneradas,
      conflictos,
      mensaje:
        conflictos.length > 0
          ? `${sesionesGeneradas.length} sesiones generadas. ${conflictos.length} conflictos detectados.`
          : `${sesionesGeneradas.length} sesiones generadas exitosamente.`
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Calcular fechas de sesiones según días de la semana
 * @private
 */
const calcularFechasSesiones = (
  fechaInicio,
  diasSemana,
  totalSesiones,
  hora
) => {
  const fechas = [];
  let fecha = new Date(fechaInicio);
  let sesionesGeneradas = 0;

  // Asegurar que diasSemana sea un array
  if (!Array.isArray(diasSemana)) {
    throw new Error('diasSemana debe ser un array');
  }

  const [horas, minutos] = hora.split(':').map(Number);

  while (sesionesGeneradas < totalSesiones) {
    const diaSemana = fecha.getDay();

    if (diasSemana.includes(diaSemana)) {
      const fechaSesion = new Date(fecha);
      fechaSesion.setHours(horas, minutos, 0, 0);
      fechas.push(fechaSesion);
      sesionesGeneradas++;
    }

    // Avanzar al siguiente día
    fecha.setDate(fecha.getDate() + 1);

    // Protección contra bucle infinito
    if (fechas.length === 0 && sesionesGeneradas === 0 && fecha > new Date(fechaInicio).setMonth(fecha.getMonth() + 6)) {
      throw new Error('No se pudieron calcular las fechas de sesiones. Verificar días de la semana.');
    }
  }

  return fechas;
};

/**
 * Verificar conflictos de horario
 * @private
 */
const verificarConflictos = async (
  client,
  fechaPropuesta,
  profesionalId,
  duracionMinutos
) => {
  // Convertir a string ISO para PostgreSQL
  const fechaInicio = fechaPropuesta.toISOString();
  const fechaFin = new Date(
    fechaPropuesta.getTime() + duracionMinutos * 60000
  ).toISOString();

  // Verificar sesiones del profesional en ese rango
  const resultado = await client.query(
    `SELECT s.*, 
            p.nombres || ' ' || p.apellidos as nombre_paciente
     FROM sesiones_v2 s
     INNER JOIN pacientes p ON s.paciente_id = p.id
     WHERE s.profesional_id = $1
     AND s.estado != 'CANCELADA'
     AND (
       (s.fecha_programada >= $2 AND s.fecha_programada < $3)
       OR (s.fecha_programada + INTERVAL '1 hour' > $2 AND s.fecha_programada < $2)
     )`,
    [profesionalId, fechaInicio, fechaFin]
  );

  if (resultado.rows.length > 0) {
    return {
      hayConflicto: true,
      motivo: `El profesional tiene ${resultado.rows.length} sesión(es) programada(s) en ese horario`,
      sesionesConflictivas: resultado.rows
    };
  }

  return { hayConflicto: false };
};

/**
 * Buscar horario alternativo en el mismo día
 * @private
 */
const buscarHorarioAlternativo = async (
  client,
  fechaOriginal,
  profesionalId,
  duracionMinutos
) => {
  // Horarios a probar (bloques de 30 minutos desde las 8:00 hasta las 18:00)
  const horariosProbar = generarBloqueHorarios();

  const fecha = new Date(fechaOriginal);
  fecha.setHours(0, 0, 0, 0);

  for (const horario of horariosProbar) {
    const fechaPrueba = new Date(fecha);
    fechaPrueba.setHours(horario.hora, horario.minuto, 0, 0);

    const conflicto = await verificarConflictos(
      client,
      fechaPrueba,
      profesionalId,
      duracionMinutos
    );

    if (!conflicto.hayConflicto) {
      return fechaPrueba;
    }
  }

  return null;
};

/**
 * Generar bloques de horarios disponibles
 * @private
 */
const generarBloqueHorarios = () => {
  const bloques = [];
  for (let hora = 8; hora < 18; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      bloques.push({ hora, minuto });
    }
  }
  return bloques;
};

/**
 * Crear una sesión en la base de datos
 * @private
 */
const crearSesion = async (
  client,
  planId,
  pacienteId,
  numeroSesion,
  fechaProgramada,
  profesionalId
) => {
  const resultado = await client.query(
    `INSERT INTO sesiones_v2 (
      plan_id,
      paciente_id,
      numero_sesion,
      fecha_programada,
      estado,
      profesional_id
    ) VALUES ($1, $2, $3, $4, 'PENDIENTE', $5)
    RETURNING *`,
    [planId, pacienteId, numeroSesion, fechaProgramada.toISOString(), profesionalId]
  );

  return resultado.rows[0];
};

/**
 * Re-programar una sesión
 * @param {String} sesionId - ID de la sesión
 * @param {Date} nuevaFecha - Nueva fecha/hora
 * @param {String} motivoReprogramacion - Motivo del cambio
 * @returns {Object} Sesión actualizada
 */
export const reprogramarSesion = async (
  sesionId,
  nuevaFecha,
  motivoReprogramacion
) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Obtener datos de la sesión
    const sesionActual = await client.query(
      `SELECT * FROM sesiones_v2 WHERE id = $1`,
      [sesionId]
    );

    if (sesionActual.rows.length === 0) {
      throw new Error('Sesión no encontrada');
    }

    const sesion = sesionActual.rows[0];

    // Verificar conflictos en la nueva fecha
    const conflicto = await verificarConflictos(
      client,
      nuevaFecha,
      sesion.profesional_id,
      60
    );

    if (conflicto.hayConflicto) {
      throw new Error(
        `Conflicto de horario: ${conflicto.motivo}. Use buscarHorariosDisponibles() para encontrar alternativas.`
      );
    }

    // Actualizar sesión
    const resultado = await client.query(
      `UPDATE sesiones_v2 
       SET fecha_programada = $1,
           observaciones = COALESCE(observaciones, '') || $2,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [
        nuevaFecha.toISOString(),
        `\n[Reprogramada] ${motivoReprogramacion}`,
        sesionId
      ]
    );

    await client.query('COMMIT');

    return resultado.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Buscar horarios disponibles para un profesional en un día
 * @param {String} profesionalId - ID del profesional
 * @param {Date} fecha - Fecha a consultar
 * @param {Number} duracionMinutos - Duración de la sesión
 * @returns {Array} Horarios disponibles
 */
export const buscarHorariosDisponibles = async (
  profesionalId,
  fecha,
  duracionMinutos = 60
) => {
  const client = await getClient();

  try {
    const horariosProbar = generarBloqueHorarios();
    const horariosDisponibles = [];

    for (const horario of horariosProbar) {
      const fechaPrueba = new Date(fecha);
      fechaPrueba.setHours(horario.hora, horario.minuto, 0, 0);

      const conflicto = await verificarConflictos(
        client,
        fechaPrueba,
        profesionalId,
        duracionMinutos
      );

      if (!conflicto.hayConflicto) {
        horariosDisponibles.push({
          hora: `${horario.hora.toString().padStart(2, '0')}:${horario.minuto.toString().padStart(2, '0')}`,
          fecha: fechaPrueba
        });
      }
    }

    return horariosDisponibles;
  } finally {
    client.release();
  }
};
