import { query } from '../config/database.js';

// RECURSOS (camillas, salas)
// Columns assumed: id (uuid/serial), nombre, tipo, descripcion, activo (boolean)

export const listRecursos = async (req, res) => {
  try {
    const { tipo } = req.query; // optional filter: camilla, sala, equipo
    const params = [];
    let sql = 'SELECT id, nombre, tipo, descripcion, activo FROM recursos WHERE activo = true';
    if (tipo) {
      params.push(tipo);
      sql += ' AND tipo = $1';
    }
    sql += ' ORDER BY nombre ASC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listRecursos error', err);
    return res.status(500).json({ success: false, message: 'Error al listar recursos' });
  }
};

export const createRecurso = async (req, res) => {
  try {
    const { nombre, tipo, descripcion } = req.body;
    if (!nombre || !tipo) {
      return res.status(400).json({ success: false, message: 'nombre y tipo son requeridos' });
    }
    const { rows } = await query(
      'INSERT INTO recursos (nombre, tipo, descripcion, activo) VALUES ($1, $2, $3, true) RETURNING id, nombre, tipo, descripcion, activo',
      [nombre, tipo, descripcion || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createRecurso error', err);
    return res.status(500).json({ success: false, message: 'Error al crear recurso' });
  }
};

export const updateRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, descripcion, activo } = req.body;
    const { rows } = await query(
      'UPDATE recursos SET nombre = COALESCE($2, nombre), tipo = COALESCE($3, tipo), descripcion = COALESCE($4, descripcion), activo = COALESCE($5, activo), actualizado_en = NOW() WHERE id = $1 RETURNING id, nombre, tipo, descripcion, activo',
      [id, nombre || null, tipo || null, descripcion || null, typeof activo === 'boolean' ? activo : null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateRecurso error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar recurso' });
  }
};
