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
import historiasClinicasRoutes from './historias-clinicas.routes.js';
import recetasRoutes from './recetas.routes.js';

// ✨ NUEVAS RUTAS V2 - Arquitectura inmutable con versionado y smart scheduling
import evaluacionesRoutesV2 from './evaluaciones.routes.v2.js';
import planesRoutesV2 from './planes.routes.v2.js';

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

// ============================================
// ✨ RUTAS V2 - NUEVAS FUNCIONALIDADES
// ============================================
// Versionado inmutable con auditoría completa
router.use('/v2/evaluaciones', evaluacionesRoutesV2);
// Smart scheduling con detección de conflictos
router.use('/v2/planes', planesRoutesV2);
// ============================================

// Rutas con paths completos dentro del módulo
router.use('/', planesRoutes);
router.use('/', archivosRoutes);
router.use('/', pagosRoutes);
router.use('/', certificadosRoutes);
router.use('/', dashboardRoutes);
router.use('/', reportesRoutes);
// Rutas de historias clínicas
router.use('/', historiasClinicasRoutes);
// Rutas de recetas médicas
router.use('/', recetasRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '2.0',
    features: {
      v1: 'Rutas originales en /api/*',
      v2: 'Nuevas rutas con versionado en /api/v2/*'
    }
  });
});

// Ruta de información de versión V2
router.get('/v2/info', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '2.0.0',
      release_date: '2024-01',
      features: [
        'Arquitectura inmutable con versionado',
        'Smart scheduling con detección de conflictos',
        'Sistema completo de auditoría',
        'REST API siguiendo principios de diseño'
      ],
      endpoints: {
        evaluaciones: '/api/v2/evaluaciones',
        planes: '/api/v2/planes'
      },
      documentation: 'Ver BACKEND_V2_README.md'
    }
  });
});

export default router;
