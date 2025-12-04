import { query } from '../config/database.js';

export const resumen = async (req, res) => {
  try {
    const [{ rows: r1 }, { rows: r2 }, { rows: r3 }] = await Promise.all([
      query('SELECT COUNT(*)::int as pacientes FROM pacientes WHERE activo = true'),
      query('SELECT COUNT(*)::int as profesionales FROM profesionales WHERE activo = true'),
      query('SELECT COUNT(*)::int as citas_hoy FROM citas WHERE DATE(inicio) = CURRENT_DATE')
    ]);
    return res.json({ success: true, pacientes: r1[0].pacientes, profesionales: r2[0].profesionales, citasHoy: r3[0].citas_hoy });
  } catch (err) {
    console.error('dashboard resumen error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener resumen' });
  }
};

export const ingresosMes = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT TO_CHAR(date_trunc('day', fecha), 'YYYY-MM-DD') as dia, SUM(monto)::numeric as total
       FROM pagos
       WHERE date_trunc('month', fecha) = date_trunc('month', CURRENT_DATE)
       GROUP BY 1
       ORDER BY 1`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('dashboard ingresosMes error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener ingresos del mes' });
  }
};
