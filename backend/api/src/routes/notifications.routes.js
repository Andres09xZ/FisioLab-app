import { Router } from 'express';
import { sendImmediateSms, scheduleCitaNotification } from '../controllers/notifications.controller.js';

const router = Router();

// Enviar SMS inmediatamente (para pruebas)
router.post('/send', sendImmediateSms);

// Programar notificación para una cita existente
router.post('/citas/:cita_id/schedule', scheduleCitaNotification);

export default router;
