import { sendSms } from '../config/twilio.js';
import scheduler from '../services/notificationScheduler.js';

export const sendImmediateSms = async (req, res) => {
  try {
    const { cita_id, to, body } = req.body;
    if (!to || !body) return res.status(400).json({ success: false, message: 'to y body son requeridos' });
    const result = await sendSms({ to, body });
    // Optionally mark cita as sent
    if (cita_id) {
      // scheduler will mark notification_sent after sendNotificationNow; here just best-effort
      // but we won't update DB here to keep single source in scheduler
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('sendImmediateSms error', err.message);
    return res.status(500).json({ success: false, message: 'Error al enviar SMS' });
  }
};

// Expose scheduling helper for manual trigger
export const scheduleCitaNotification = async (req, res) => {
  try {
    const { cita_id } = req.params;
    if (!cita_id) return res.status(400).json({ success: false, message: 'cita_id requerido' });
    // fetch cita
    const { rows } = await import('../config/database.js').then(m => m.query(`SELECT * FROM citas WHERE id = $1`, [cita_id]));
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    await scheduler.scheduleNotificationForCita(rows[0]);
    return res.json({ success: true, message: 'Notificación programada' });
  } catch (err) {
    console.error('scheduleCitaNotification error', err.message);
    return res.status(500).json({ success: false, message: 'Error al programar notificación' });
  }
};

export default {
  sendImmediateSms,
  scheduleCitaNotification
};
