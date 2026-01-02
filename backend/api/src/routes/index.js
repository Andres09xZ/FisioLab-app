import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profesionalesRoutes from './profesionales.routes.js';
import recursosRoutes from './recursos.routes.js';
import pacientesRoutes from './pacientes.routes.js';
import evaluacionesRoutes from './evaluaciones.routes.js';
import citasRoutes from './citas.routes.js';
import agendaRoutes from './agenda.routes.js';
import planesRoutes from './planes.routes.js';
import sesionesRoutes from './sesiones.routes.js';
import archivosRoutes from './archivos.routes.js';
import pagosRoutes from './pagos.routes.js';
import certificadosRoutes from './certificados.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportesRoutes from './reportes.routes.js';
import ejerciciosRoutes from './ejercicios.routes.js';
import notificationsRoutes from './notifications.routes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/profesionales', profesionalesRoutes);
router.use('/recursos', recursosRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/evaluaciones', evaluacionesRoutes);
router.use('/citas', citasRoutes);
router.use('/agenda', agendaRoutes);
router.use('/sesiones', sesionesRoutes);
router.use('/ejercicios', ejerciciosRoutes);
router.use('/notifications', notificationsRoutes);
// Rutas con paths completos dentro del módulo
router.use('/', planesRoutes);
router.use('/', archivosRoutes);
router.use('/', pagosRoutes);
router.use('/', certificadosRoutes);
router.use('/', dashboardRoutes);
router.use('/', reportesRoutes);
// Rutas de ejercicios asociadas a planes (paths completos)
router.use('/', ejerciciosRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
