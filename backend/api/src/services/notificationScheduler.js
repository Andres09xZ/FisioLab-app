import cron from 'node-cron';
import { query } from '../config/database.js';
import { sendSms } from '../config/twilio.js';

// In-memory map of scheduled jobs: { citaId: { job, runAt } }
const jobs = new Map();

const formatPhone = (phone) => {
  // Basic normalization: if already with +, return; else assume local and return as-is
  if (!phone) return null;
  if (phone.startsWith('+')) return phone;
  return phone;
};

// Helper to compute cron expression (minute hour day month *) for a given Date
const toCronExpr = (date) => {
  const d = new Date(date);
  const minute = d.getMinutes();
  const hour = d.getHours();
  const day = d.getDate();
  const month = d.getMonth() + 1; // cron months 1-12
  // day of week wildcard
  return `${minute} ${hour} ${day} ${month} *`;
};

export const scheduleNotificationForCita = async (cita) => {
  try {
    if (!cita || !cita.id) return null;
    const citaId = cita.id;
    // if notifications disabled or already sent, skip
    if (cita.notification_enabled === false || cita.notification_sent === true) return null;

    const inicio = new Date(cita.inicio);
    const scheduledTime = new Date(inicio.getTime() - 30 * 60000); // 30 minutes before
    const now = new Date();

    // If scheduled time already passed, send immediately (if not sent)
    if (scheduledTime <= now) {
      // immediate send
      await sendNotificationNow(cita);
      return null;
    }

    // Cancel existing job if present
    if (jobs.has(citaId)) {
      const existing = jobs.get(citaId);
      existing.job.stop();
      jobs.delete(citaId);
    }

    const cronExpr = toCronExpr(scheduledTime);
    const job = cron.schedule(cronExpr, async () => {
      try {
        await sendNotificationNow(cita);
      } catch (err) {
        console.error('Error sending scheduled SMS for cita', citaId, err.message);
      } finally {
        // stop and remove job after first run
        job.stop();
        jobs.delete(citaId);
      }
    }, { timezone: process.env.TZ || undefined });

    jobs.set(citaId, { job, runAt: scheduledTime });
    console.log(`Scheduled SMS for cita ${citaId} at ${scheduledTime.toISOString()} (cron: ${cronExpr})`);
    return { citaId, runAt: scheduledTime };
  } catch (err) {
    console.error('scheduleNotificationForCita error', err.message);
    return null;
  }
};

export const cancelScheduledNotification = (citaId) => {
  if (jobs.has(citaId)) {
    const item = jobs.get(citaId);
    item.job.stop();
    jobs.delete(citaId);
    console.log(`Cancelled scheduled SMS for cita ${citaId}`);
  }
};

export const sendNotificationNow = async (cita) => {
  try {
    // Load patient phone and professional name if not provided
    let pacienteTelefono = cita.paciente_telefono;
    let pacienteNombre = cita.paciente_nombre;
    let profesionalNombre = cita.profesional_nombre;

    if (!pacienteTelefono || !pacienteNombre || !profesionalNombre) {
      const { rows } = await query(`
        SELECT p.celular as paciente_telefono, p.nombres || ' ' || p.apellidos as paciente_nombre,
               pr.nombre || ' ' || pr.apellido as profesional_nombre
        FROM citas c
        LEFT JOIN pacientes p ON c.paciente_id = p.id
        LEFT JOIN profesionales pr ON c.profesional_id = pr.id
        WHERE c.id = $1
      `, [cita.id]);
      if (rows && rows[0]) {
        pacienteTelefono = pacienteTelefono || rows[0].paciente_telefono;
        pacienteNombre = pacienteNombre || rows[0].paciente_nombre;
        profesionalNombre = profesionalNombre || rows[0].profesional_nombre;
      }
    }

    const phone = formatPhone(pacienteTelefono);
    if (!phone) {
      console.warn(`No phone for cita ${cita.id}, skipping SMS`);
      return null;
    }

    const inicio = new Date(cita.inicio);
    const timeStr = inicio.toLocaleString();
    const body = `Hola ${pacienteNombre || ''}, tienes una cita con ${profesionalNombre || 'su profesional'} el ${timeStr}. Te esperamos.`;

    // send via Twilio
    await sendSms({ to: phone, body });

    // mark as sent
    await query(`UPDATE citas SET notification_sent = true WHERE id = $1`, [cita.id]);
    console.log(`SMS enviado para cita ${cita.id} a ${phone}`);
    return true;
  } catch (err) {
    console.error('sendNotificationNow error', err.message);
    return null;
  }
};

export const rescheduleUpcoming = async (daysAhead = 7) => {
  try {
    const now = new Date();
    const hasta = new Date(now.getTime() + daysAhead * 24 * 60 * 60000);
    const { rows } = await query(`SELECT c.* FROM citas c WHERE c.inicio >= $1 AND c.inicio <= $2 AND COALESCE(c.notification_enabled, true) = true AND COALESCE(c.notification_sent, false) = false`, [now.toISOString(), hasta.toISOString()]);
    for (const cita of rows) {
      await scheduleNotificationForCita(cita);
    }
    console.log(`Rescheduled ${rows.length} upcoming notifications`);
  } catch (err) {
    console.error('rescheduleUpcoming error', err.message);
  }
};

export default {
  scheduleNotificationForCita,
  cancelScheduledNotification,
  sendNotificationNow,
  rescheduleUpcoming
};
