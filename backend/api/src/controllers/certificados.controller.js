import { query } from '../config/database.js';

export const listCertificadosPorPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      'SELECT id, paciente_id, tipo, emitido_en FROM certificados WHERE paciente_id = $1 ORDER BY emitido_en DESC',
      [id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listCertificadosPorPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al listar certificados' });
  }
};

export const createCertificado = async (req, res) => {
  try {
    const { paciente_id, tipo, contenido } = req.body; // contenido puede ser json o texto
    if (!paciente_id || !tipo) return res.status(400).json({ success: false, message: 'paciente_id y tipo son requeridos' });
    const { rows } = await query(
      `INSERT INTO certificados (paciente_id, tipo, contenido, emitido_en)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, paciente_id, tipo, emitido_en`,
      [paciente_id, tipo, contenido || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createCertificado error', err);
    return res.status(500).json({ success: false, message: 'Error al crear certificado' });
  }
};

export const getCertificadoPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT id, contenido FROM certificados WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Certificado no encontrado' });
    // Placeholder: return content as PDF stream if binary stored; here send text as application/pdf if available
    res.setHeader('Content-Type', 'application/pdf');
    return res.send(rows[0].contenido || 'PDF no disponible');
  } catch (err) {
    console.error('getCertificadoPdf error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener PDF' });
  }
};
