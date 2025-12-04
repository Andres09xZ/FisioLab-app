import { query } from '../config/database.js';

// Helper: validate UUID (basic)
const isUUID = (id) => /^[0-9a-fA-F-]{36}$/.test(id);

// GET /api/profesionales
export const listProfesionales = async (req, res) => {
  try {
    const { activo, q } = req.query;
    const filters = [];
    const params = [];

    if (activo !== undefined) {
      params.push(activo === 'true');
      filters.push(`activo = $${params.length}`);
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      filters.push(`(LOWER(nombre) LIKE $${params.length} OR LOWER(apellido) LIKE $${params.length})`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const sql = `SELECT id, nombre, apellido, documento, telefono, especialidad, color_agenda, comision_porcentaje, activo, creado_por, created_at
                 FROM profesionales ${where} ORDER BY created_at DESC`;
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error listProfesionales:', error);
    res.status(500).json({ success: false, message: 'Error al listar profesionales', error: error.message });
  }
};

// POST /api/profesionales
export const createProfesional = async (req, res) => {
  try {
    const { nombre, apellido, documento, telefono, especialidad, color_agenda, comision_porcentaje } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ success: false, message: 'Nombre y apellido son requeridos' });
    }

    const result = await query(
      `INSERT INTO profesionales (nombre, apellido, documento, telefono, especialidad, color_agenda, comision_porcentaje, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nombre, apellido, documento, telefono, especialidad, color_agenda, comision_porcentaje, activo, creado_por, created_at`,
      [
        nombre,
        apellido,
        documento || null,
        telefono || null,
        especialidad || null,
        color_agenda || '#10B981',
        comision_porcentaje !== undefined ? comision_porcentaje : 0.0,
        req.user?.id || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error createProfesional:', error);
    res.status(500).json({ success: false, message: 'Error al crear profesional', error: error.message });
  }
};

// GET /api/profesionales/:id
export const getProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    const result = await query(
      `SELECT id, nombre, apellido, documento, telefono, especialidad, color_agenda, comision_porcentaje, activo, creado_por, created_at
       FROM profesionales WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error getProfesional:', error);
    res.status(500).json({ success: false, message: 'Error al obtener profesional', error: error.message });
  }
};

// PUT /api/profesionales/:id
export const updateProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const fields = ['nombre', 'apellido', 'documento', 'telefono', 'especialidad', 'color_agenda', 'comision_porcentaje', 'activo'];
    const sets = [];
    const params = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        params.push(req.body[f]);
        sets.push(`${f} = $${params.length}`);
      }
    });

    if (!sets.length) {
      return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
    }
    params.push(id);
    const sql = `UPDATE profesionales SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id, nombre, apellido, documento, telefono, especialidad, color_agenda, comision_porcentaje, activo, creado_por, created_at`;
    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updateProfesional:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar profesional', error: error.message });
  }
};

// DELETE /api/profesionales/:id (soft delete)
export const softDeleteProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const result = await query(
      `UPDATE profesionales SET activo = false WHERE id = $1 RETURNING id, activo`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
    }
    res.json({ success: true, message: 'Profesional desactivado', data: result.rows[0] });
  } catch (error) {
    console.error('Error softDeleteProfesional:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar profesional', error: error.message });
  }
};
