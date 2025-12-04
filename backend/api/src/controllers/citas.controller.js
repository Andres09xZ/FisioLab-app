import { query, getClient } from '../config/database.js';

// CITAS
// Columns assumed: id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado, notas

export const listCitas = async (req, res) => {
  try {
    const { desde, hasta, profesional_id, paciente_id } = req.query;
    const params = [];
    let sql = 'SELECT id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado FROM citas WHERE 1=1';
    if (desde) { params.push(desde); sql += ` AND inicio >= $${params.length}`; }
    if (hasta) { params.push(hasta); sql += ` AND fin <= $${params.length}`; }
    if (profesional_id) { params.push(profesional_id); sql += ` AND profesional_id = $${params.length}`; }
    if (paciente_id) { params.push(paciente_id); sql += ` AND paciente_id = $${params.length}`; }
    sql += ' ORDER BY inicio ASC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listCitas error', err);
    return res.status(500).json({ success: false, message: 'Error al listar citas' });
  }
};

export const listCalendario = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const params = [];
    let sql = 'SELECT id, titulo as title, inicio as start, fin as end, estado FROM citas WHERE 1=1';
    if (desde) { params.push(desde); sql += ` AND inicio >= $${params.length}`; }
    if (hasta) { params.push(hasta); sql += ` AND fin <= $${params.length}`; }
    sql += ' ORDER BY inicio ASC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listCalendario error', err);
    return res.status(500).json({ success: false, message: 'Error al listar calendario' });
  }
};

export const createCita = async (req, res) => {
  try {
    const { paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado, notas } = req.body;
    // Requeridos mínimos para programar: paciente_id, inicio, fin
    if (!paciente_id || !inicio || !fin) {
      return res.status(400).json({ success: false, message: 'paciente_id, inicio y fin son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO citas (paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado, notas)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::estado_cita,'programada'::estado_cita), $8)
       RETURNING id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado`,
      [paciente_id, profesional_id || null, recurso_id || null, inicio, fin, titulo || null, estado || null, notas || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createCita error', err);
    return res.status(500).json({ success: false, message: 'Error al crear cita' });
  }
};

export const bulkCitas = async (req, res) => {
  try {
    const { paciente_id, profesional_id, recurso_id, inicio, duracion_min, cantidad } = req.body;
    const n = Number(cantidad) || 10;
    if (!paciente_id || !profesional_id || !inicio || !duracion_min) {
      return res.status(400).json({ success: false, message: 'paciente_id, profesional_id, inicio y duracion_min son requeridos' });
    }
    const start = new Date(inicio);
    const results = [];
    const client = await getClient();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < n; i++) {
        const s = new Date(start.getTime() + i * (duracion_min * 60000));
        const e = new Date(s.getTime() + duracion_min * 60000);
        const { rows } = await client.query(
          `INSERT INTO citas (paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado)
           VALUES ($1, $2, $3, $4, $5, $6, 'programada'::estado_cita)
           RETURNING id, inicio, fin`,
          [paciente_id, profesional_id, recurso_id || null, s.toISOString(), e.toISOString(), `Cita ${i + 1}`]
        );
        results.push(rows[0]);
      }
      await client.query('COMMIT');
      client.release();
      return res.status(201).json({ success: true, created: results.length, items: results });
    } catch (e) {
      await client.query('ROLLBACK');
      client.release();
      throw e;
    }
  } catch (err) {
    console.error('bulkCitas error', err);
    return res.status(500).json({ success: false, message: 'Error al crear citas masivas' });
  }
};

export const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { inicio, fin, titulo, estado, notas, recurso_id } = req.body;
    const { rows } = await query(
      `UPDATE citas SET
        inicio = COALESCE($2, inicio),
        fin = COALESCE($3, fin),
        titulo = COALESCE($4, titulo),
        estado = COALESCE($5::estado_cita, estado),
        notas = COALESCE($6, notas),
        recurso_id = COALESCE($7, recurso_id),
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado`,
      [id, inicio || null, fin || null, titulo || null, estado || null, notas || null, recurso_id || null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateCita error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar cita' });
  }
};

export const deleteCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query('DELETE FROM citas WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Cita no encontrada' });
    return res.status(204).send();
  } catch (err) {
    console.error('deleteCita error', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar cita' });
  }
};
