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
