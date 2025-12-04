import { query } from '../config/database.js';

// SESIONES
// Columns assumed: id, cita_id, paciente_id, profesional_id, fecha, notas, estado

export const createSesion = async (req, res) => {
  try {
    const { cita_id, paciente_id, profesional_id, fecha, notas, estado } = req.body;
    if (!paciente_id || !profesional_id || !fecha) {
      return res.status(400).json({ success: false, message: 'paciente_id, profesional_id y fecha son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO sesiones (cita_id, paciente_id, profesional_id, fecha, notas, estado)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6,'pendiente'))
       RETURNING id, cita_id, paciente_id, profesional_id, fecha, notas, estado`,
      [cita_id || null, paciente_id, profesional_id, fecha, notas || null, estado || null]
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
