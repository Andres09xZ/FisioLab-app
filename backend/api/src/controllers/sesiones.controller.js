import { query } from '../config/database.js';

// SESIONES
// Columns assumed: id, cita_id, paciente_id, profesional_id, fecha, notas, estado

// Listar sesiones con filtros
export const listSesiones = async (req, res) => {
  try {
    const { paciente_id, plan_id, estado, sin_cita } = req.query;
    const params = [];
    let sql = `
      SELECT s.*,
             p.nombres || ' ' || p.apellidos as paciente_nombre,
             p.documento as paciente_documento,
             pr.nombre || ' ' || pr.apellido as profesional_nombre,
             c.inicio as cita_inicio,
             c.fin as cita_fin,
             c.estado as cita_estado,
             pt.objetivo as plan_objetivo,
             pt.sesiones_plan,
             pt.sesiones_completadas
      FROM sesiones s
      LEFT JOIN pacientes p ON s.paciente_id = p.id
      LEFT JOIN profesionales pr ON s.profesional_id = pr.id
      LEFT JOIN citas c ON s.cita_id = c.id
      LEFT JOIN planes_tratamiento pt ON s.plan_id = pt.id
      WHERE 1=1
    `;
    
    if (paciente_id) { 
      params.push(paciente_id); 
      sql += ` AND s.paciente_id = $${params.length}`; 
    }
    if (plan_id) { 
      params.push(plan_id); 
      sql += ` AND s.plan_id = $${params.length}`; 
    }
    if (estado) { 
      params.push(estado); 
      sql += ` AND s.estado = $${params.length}`; 
    }
    if (sin_cita === 'true') {
      sql += ` AND s.cita_id IS NULL`;
    }
    
    sql += ' ORDER BY s.fecha_sesion ASC NULLS LAST, s.creado_en ASC';
    
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listSesiones error', err);
    return res.status(500).json({ success: false, message: 'Error al listar sesiones' });
  }
};

// Obtener sesiones pendientes de un paciente (sin cita asignada)
export const getSesionesPendientesPaciente = async (req, res) => {
  try {
    const { id: paciente_id } = req.params;
    
    const { rows } = await query(
      `SELECT s.*,
              pt.objetivo as plan_objetivo,
              pt.sesiones_plan,
              pt.sesiones_completadas,
              pt.estado as plan_estado
       FROM sesiones s
       JOIN planes_tratamiento pt ON s.plan_id = pt.id
       WHERE s.paciente_id = $1 
         AND s.estado = 'pendiente'
         AND s.cita_id IS NULL
         AND pt.estado = 'activo'
       ORDER BY pt.creado_en ASC, s.creado_en ASC`,
      [paciente_id]
    );
    
    return res.json({ 
      success: true, 
      data: rows,
      total_pendientes: rows.length
    });
  } catch (err) {
    console.error('getSesionesPendientesPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener sesiones pendientes' });
  }
};

export const createSesion = async (req, res) => {
  try {
    const { cita_id, paciente_id, profesional_id, fecha, notas, estado } = req.body;
    if (!paciente_id || !fecha) {
      return res.status(400).json({ success: false, message: 'paciente_id y fecha son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO sesiones (cita_id, paciente_id, profesional_id, fecha, notas, estado)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6,'pendiente'))
       RETURNING id, cita_id, paciente_id, profesional_id, fecha, notas, estado`,
      [cita_id || null, paciente_id, profesional_id || null, fecha, notas || null, estado || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createSesion error', err);
    return res.status(500).json({ success: false, message: 'Error al crear sesión' });
  }
};

export const getSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      'SELECT id, cita_id, paciente_id, profesional_id, fecha, notas, estado FROM sesiones WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getSesion error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener sesión' });
  }
};

export const updateSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, notas, estado } = req.body;
    const { rows } = await query(
      `UPDATE sesiones SET fecha = COALESCE($2, fecha), notas = COALESCE($3, notas), estado = COALESCE($4, estado), actualizado_en = NOW()
       WHERE id = $1 RETURNING id, cita_id, paciente_id, profesional_id, fecha, notas, estado`,
      [id, fecha || null, notas || null, estado || null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateSesion error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar sesión' });
  }
};

// Asignar una cita existente a una sesión pendiente
export const asignarCitaASesion = async (req, res) => {
  try {
    const { id: sesion_id } = req.params;
    const { cita_id } = req.body;

    if (!cita_id) {
      return res.status(400).json({ success: false, message: 'cita_id es requerido' });
    }

    // Verificar que la sesión existe y está pendiente
    const sesionResult = await query(
      'SELECT id, paciente_id, estado, cita_id FROM sesiones WHERE id = $1',
      [sesion_id]
    );

    if (sesionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
    }

    const sesion = sesionResult.rows[0];

    if (sesion.cita_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'La sesión ya tiene una cita asignada' 
      });
    }

    // Verificar que la cita existe y es del mismo paciente
    const citaResult = await query(
      'SELECT id, paciente_id, inicio FROM citas WHERE id = $1',
      [cita_id]
    );

    if (citaResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    const cita = citaResult.rows[0];

    if (cita.paciente_id !== sesion.paciente_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'La cita no pertenece al mismo paciente de la sesión' 
      });
    }

    // Verificar que la cita no esté asignada a otra sesión
    const citaAsignadaResult = await query(
      'SELECT id FROM sesiones WHERE cita_id = $1 AND id != $2',
      [cita_id, sesion_id]
    );

    if (citaAsignadaResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'La cita ya está asignada a otra sesión' 
      });
    }

    // Asignar la cita y cambiar estado a programada
    const { rows } = await query(
      `UPDATE sesiones 
       SET cita_id = $2, 
           fecha_sesion = $3,
           estado = 'programada', 
           actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, plan_id, cita_id, paciente_id, profesional_id, fecha_sesion, estado, notas`,
      [sesion_id, cita_id, cita.inicio]
    );

    return res.json({ 
      success: true, 
      data: rows[0],
      message: 'Cita asignada exitosamente a la sesión'
    });
  } catch (err) {
    console.error('asignarCitaASesion error', err);
    return res.status(500).json({ success: false, message: 'Error al asignar cita a sesión', error: err.message });
  }
};

export const registrarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params; // sesion id
    const { evaluacion } = req.body; // JSON con evaluación completa
    if (!evaluacion) return res.status(400).json({ success: false, message: 'evaluacion es requerida' });
    // Assuming table evaluaciones_fisioterapeuticas with sesion_id and data jsonb
    const { rows } = await query(
      `INSERT INTO evaluaciones_fisioterapeuticas (sesion_id, data)
       VALUES ($1, $2)
       ON CONFLICT (sesion_id)
       DO UPDATE SET data = EXCLUDED.data, actualizado_en = NOW()
       RETURNING id, sesion_id`,
      [id, evaluacion]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('registrarEvaluacion error', err);
    return res.status(500).json({ success: false, message: 'Error al registrar evaluación' });
  }
};

// Validar disponibilidad de horario
export const validarHorario = async (req, res) => {
  try {
    const { profesional_id, fecha_inicio, fecha_fin, excluir_cita_id } = req.body;

    if (!profesional_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        success: false, 
        message: 'profesional_id, fecha_inicio y fecha_fin son requeridos' 
      });
    }

    // Verificar solapamiento con citas existentes
    let sql = `
      SELECT id, paciente_id, inicio, fin, titulo, estado
      FROM citas
      WHERE profesional_id = $1
        AND estado NOT IN ('cancelada', 'no_asistio')
        AND (inicio < $3 AND fin > $2)
    `;
    const params = [profesional_id, fecha_inicio, fecha_fin];

    // Opcionalmente excluir una cita (para edición)
    if (excluir_cita_id) {
      sql += ` AND id != $4`;
      params.push(excluir_cita_id);
    }

    const { rows } = await query(sql, params);

    if (rows.length > 0) {
      return res.json({ 
        success: true, 
        disponible: false,
        conflictos: rows,
        message: 'El horario se solapa con citas existentes'
      });
    }

    return res.json({ 
      success: true, 
      disponible: true,
      message: 'El horario está disponible'
    });
  } catch (err) {
    console.error('validarHorario error', err);
    return res.status(500).json({ success: false, message: 'Error al validar horario' });
  }
};

// Obtener horarios disponibles de un profesional en una fecha
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { profesional_id, fecha, duracion_minutos } = req.query;

    if (!profesional_id || !fecha) {
      return res.status(400).json({ 
        success: false, 
        message: 'profesional_id y fecha son requeridos' 
      });
    }

    const duracion = parseInt(duracion_minutos) || 45;

    // Configuración de horario laboral (8:00 - 20:00)
    const horaInicio = 8;
    const horaFin = 20;
    const intervalo = 30; // Cada 30 minutos

    // Obtener citas del profesional para ese día
    const { rows: citasDelDia } = await query(
      `SELECT inicio, fin 
       FROM citas 
       WHERE profesional_id = $1 
         AND DATE(inicio) = $2
         AND estado NOT IN ('cancelada', 'no_asistio')
       ORDER BY inicio`,
      [profesional_id, fecha]
    );

    // Generar slots disponibles
    const horariosDisponibles = [];
    const fechaBase = new Date(fecha);

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let min = 0; min < 60; min += intervalo) {
        const slotInicio = new Date(fechaBase);
        slotInicio.setHours(hora, min, 0, 0);
        
        const slotFin = new Date(slotInicio);
        slotFin.setMinutes(slotFin.getMinutes() + duracion);

        // No permitir slots que terminen después del horario laboral
        if (slotFin.getHours() > horaFin || (slotFin.getHours() === horaFin && slotFin.getMinutes() > 0)) {
          continue;
        }

        // Verificar si el slot está disponible (no se solapa con ninguna cita)
        const disponible = !citasDelDia.some(cita => {
          const citaInicio = new Date(cita.inicio);
          const citaFin = new Date(cita.fin);
          return slotInicio < citaFin && slotFin > citaInicio;
        });

        if (disponible) {
          horariosDisponibles.push({
            inicio: slotInicio.toISOString(),
            fin: slotFin.toISOString(),
            hora: `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`
          });
        }
      }
    }

    return res.json({ 
      success: true, 
      data: horariosDisponibles,
      fecha,
      profesional_id,
      duracion_minutos: duracion,
      total_slots: horariosDisponibles.length
    });
  } catch (err) {
    console.error('getHorariosDisponibles error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener horarios disponibles' });
  }
};

// Agregar notas a una sesión
export const agregarNotas = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas, append } = req.body;

    if (!notas) {
      return res.status(400).json({ success: false, message: 'notas es requerido' });
    }

    // Verificar que la sesión existe
    const sesionResult = await query('SELECT id, notas FROM sesiones WHERE id = $1', [id]);
    
    if (sesionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
    }

    let notasFinales = notas;

    // Si append es true, agregar a las notas existentes
    if (append && sesionResult.rows[0].notas) {
      const timestamp = new Date().toISOString().split('T')[0];
      notasFinales = `${sesionResult.rows[0].notas}\n\n[${timestamp}] ${notas}`;
    }

    const { rows } = await query(
      `UPDATE sesiones 
       SET notas = $2, actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, plan_id, cita_id, paciente_id, profesional_id, fecha_sesion, estado, notas`,
      [id, notasFinales]
    );

    return res.json({ 
      success: true, 
      data: rows[0],
      message: append ? 'Notas agregadas exitosamente' : 'Notas actualizadas exitosamente'
    });
  } catch (err) {
    console.error('agregarNotas error', err);
    return res.status(500).json({ success: false, message: 'Error al agregar notas' });
  }
};
