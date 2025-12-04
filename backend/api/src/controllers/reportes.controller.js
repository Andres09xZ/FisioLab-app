import { query } from '../config/database.js';

export const ocupacion = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const params = [];
    let sql = `SELECT r.id as recurso_id, r.nombre as recurso, COUNT(c.id)::int as ocupacion
               FROM recursos r
               LEFT JOIN citas c ON c.recurso_id = r.id`;
    if (desde) { params.push(desde); sql += ` AND c.inicio >= $${params.length}`; }
    if (hasta) { params.push(hasta); sql += ` AND c.fin <= $${params.length}`; }
    sql += ' GROUP BY r.id, r.nombre ORDER BY ocupacion DESC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('reportes ocupacion error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de ocupación' });
  }
};
