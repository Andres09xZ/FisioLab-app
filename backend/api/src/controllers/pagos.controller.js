import { query } from '../config/database.js';

export const listPagosPorPaciente = async (req, res) => {
  try {
    const { id } = req.params; // paciente id
    const { rows } = await query(
      'SELECT id, paciente_id, concepto, monto, moneda, fecha, medio FROM pagos WHERE paciente_id = $1 ORDER BY fecha DESC',
      [id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listPagosPorPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al listar pagos' });
  }
};

export const createPago = async (req, res) => {
  try {
    const { paciente_id, concepto, monto, moneda, fecha, medio } = req.body;
    if (!paciente_id || !concepto || !monto) {
      return res.status(400).json({ success: false, message: 'paciente_id, concepto y monto son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO pagos (paciente_id, concepto, monto, moneda, fecha, medio)
       VALUES ($1, $2, $3, COALESCE($4,'PEN'), COALESCE($5, NOW()), $6)
       RETURNING id, paciente_id, concepto, monto, moneda, fecha, medio`,
      [paciente_id, concepto, monto, moneda || null, fecha || null, medio || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createPago error', err);
    return res.status(500).json({ success: false, message: 'Error al registrar pago' });
  }
};
