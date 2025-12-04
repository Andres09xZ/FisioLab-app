import { query } from '../config/database.js';

// PACIENTES
// Columns assumed: id, nombres, apellidos, documento, telefono, email, direccion, fecha_nacimiento, activo

export const listPacientes = async (req, res) => {
  try {
    const { q } = req.query; // search by name or documento
  let sql = `SELECT 
      p.id, p.nombres, p.apellidos, p.tipo_documento, p.documento, p.celular, p.email, p.sexo, p.edad,
      p.emergencia_nombre, p.emergencia_telefono, p.activo, p.antecedentes, p.notas
    FROM pacientes p
    WHERE p.activo = true`;
    const params = [];
    if (q) {
      sql += ' AND (LOWER(p.nombres) LIKE $1 OR LOWER(p.apellidos) LIKE $1 OR p.documento LIKE $1)';
      params.push(`%${q.toLowerCase()}%`);
    }
    sql += ' ORDER BY p.apellidos, p.nombres';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listPacientes error', err);
    return res.status(500).json({ success: false, message: 'Error al listar pacientes' });
  }
};

export const createPaciente = async (req, res) => {
  try {
    const { nombres, apellidos, tipo_documento, documento, celular, email, direccion, fecha_nacimiento, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas } = req.body;
    // Normalizar sexo a CHAR(1) (M/F/O) si envían palabras completas
    const sexoMap = { masculino: 'M', femenino: 'F', otro: 'O' };
    const sexoNorm = typeof sexo === 'string'
      ? (sexo.length === 1 ? sexo.toUpperCase() : (sexoMap[sexo.toLowerCase()] || null))
      : null;
    // Normalizar tipo_documento (mayúsculas) y aplicar un valor por defecto si no envían
    const tipoDocNorm = typeof tipo_documento === 'string' && tipo_documento.trim()
      ? tipo_documento.trim().toUpperCase()
      : 'DNI';
    if (!nombres || !apellidos) {
      return res.status(400).json({ success: false, message: 'nombres y apellidos son requeridos' });
    }
    // Preparar antecedentes como JSONB array
    const antecedentesJson = Array.isArray(antecedentes) ? JSON.stringify(antecedentes) : '[]';
    const { rows } = await query(
  `INSERT INTO pacientes (nombres, apellidos, tipo_documento, documento, celular, email, direccion, fecha_nacimiento, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas, activo)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, true)
   RETURNING id, nombres, apellidos, tipo_documento, documento, celular, email, direccion, fecha_nacimiento, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas, activo`,
  [nombres, apellidos, tipoDocNorm, documento || null, celular || null, email || null, direccion || null, fecha_nacimiento || null, sexoNorm, typeof edad === 'number' ? edad : null, emergencia_nombre || null, emergencia_telefono || null, antecedentesJson, notas || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createPaciente error', err);
    // Unique email/documento violations
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Paciente ya existe (email/documento duplicado)' });
    }
    return res.status(500).json({ success: false, message: 'Error al crear paciente' });
  }
};

export const getPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT 
         p.id, p.nombres, p.apellidos, p.tipo_documento, p.documento, p.celular, p.email,
         p.direccion, p.fecha_nacimiento, p.sexo, p.edad, p.emergencia_nombre, p.emergencia_telefono, 
         p.antecedentes, p.notas, p.activo
       FROM pacientes p
       WHERE p.id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener paciente' });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, tipo_documento, documento, celular, email, direccion, fecha_nacimiento, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas, activo } = req.body;
    const sexoMap2 = { masculino: 'M', femenino: 'F', otro: 'O' };
    const sexoNorm2 = typeof sexo === 'string'
      ? (sexo.length === 1 ? sexo.toUpperCase() : (sexoMap2[sexo.toLowerCase()] || null))
      : null;
    const tipoDocNorm2 = typeof tipo_documento === 'string' && tipo_documento.trim()
      ? tipo_documento.trim().toUpperCase()
      : null;
    // Preparar antecedentes como JSONB array si se envían
    const antecedentesJson = Array.isArray(antecedentes) ? JSON.stringify(antecedentes) : null;
    const { rows } = await query(
      `UPDATE pacientes SET
        nombres = COALESCE($2, nombres),
        apellidos = COALESCE($3, apellidos),
        tipo_documento = COALESCE($4, tipo_documento),
        documento = COALESCE($5, documento),
        celular = COALESCE($6, celular),
        email = COALESCE($7, email),
        direccion = COALESCE($8, direccion),
        fecha_nacimiento = COALESCE($9, fecha_nacimiento),
        sexo = COALESCE($10, sexo),
        edad = COALESCE($11, edad),
        emergencia_nombre = COALESCE($12, emergencia_nombre),
        emergencia_telefono = COALESCE($13, emergencia_telefono),
        antecedentes = COALESCE($14::jsonb, antecedentes),
        notas = COALESCE($15, notas),
        activo = COALESCE($16, activo),
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, nombres, apellidos, tipo_documento, documento, celular, email, direccion, fecha_nacimiento, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas, activo`,
  [id, nombres || null, apellidos || null, tipoDocNorm2, documento || null, celular || null, email || null, direccion || null, fecha_nacimiento || null, sexoNorm2, typeof edad === 'number' ? edad : null, emergencia_nombre || null, emergencia_telefono || null, antecedentesJson, notas || null, typeof activo === 'boolean' ? activo : null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updatePaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar paciente' });
  }
};


