import { Router } from 'express';
import { 
  resumen, 
  ingresosMes, 
  getAnalyticsDashboard, 
  getTendencias,
  getEvaluacionesPorEspecialidad,
  getPlanesPorEspecialidad,
  getResumenEspecialidades,
  getDetalleEspecialidad
} from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Resúmenes e indicadores
 *   - name: Analytics
 *     description: Métricas y estadísticas avanzadas
 */

/**
 * @swagger
 * /api/dashboard/resumen:
 *   get:
 *     summary: Resumen general (citas, pacientes, ingresos)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Resumen
 */
router.get('/dashboard/resumen', resumen);
/**
 * @swagger
 * /api/dashboard/ingresos-mes:
 *   get:
 *     summary: Ingresos por mes
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Serie de ingresos
 */
router.get('/dashboard/ingresos-mes', ingresosMes);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Métricas completas del dashboard
 *     description: Retorna métricas de pacientes, citas, sesiones, ingresos y gráficos para un período específico
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (default primer día del mes)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (default hoy)
 *     responses:
 *       200:
 *         description: Métricas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                         fin:
 *                           type: string
 *                     resumen:
 *                       type: object
 *                       properties:
 *                         pacientes:
 *                           type: object
 *                         citas:
 *                           type: object
 *                         sesiones:
 *                           type: object
 *                         ingresos:
 *                           type: object
 *                         planes_activos:
 *                           type: integer
 *                         profesionales_activos:
 *                           type: integer
 *                     graficos:
 *                       type: object
 */
router.get('/analytics/dashboard', getAnalyticsDashboard);

/**
 * @swagger
 * /api/analytics/tendencias:
 *   get:
 *     summary: Tendencias de citas por día
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de días a consultar
 *     responses:
 *       200:
 *         description: Tendencias diarias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fecha:
 *                         type: string
 *                       total:
 *                         type: integer
 *                       completadas:
 *                         type: integer
 *                       canceladas:
 *                         type: integer
 */
router.get('/analytics/tendencias', getTendencias);

/**
 * @swagger
 * /api/dashboard/especialidades/evaluaciones:
 *   get:
 *     summary: Estadísticas de evaluaciones por especialidad
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período (opcional)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período (opcional)
 *     responses:
 *       200:
 *         description: Evaluaciones agrupadas por especialidad con pacientes
 */
router.get('/dashboard/especialidades/evaluaciones', getEvaluacionesPorEspecialidad);

/**
 * @swagger
 * /api/dashboard/especialidades/planes:
 *   get:
 *     summary: Estadísticas de planes por especialidad
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período (opcional)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período (opcional)
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, finalizado, cancelado]
 *         description: Filtrar por estado de plan (opcional)
 *     responses:
 *       200:
 *         description: Planes agrupados por especialidad con pacientes
 */
router.get('/dashboard/especialidades/planes', getPlanesPorEspecialidad);

/**
 * @swagger
 * /api/dashboard/especialidades/resumen:
 *   get:
 *     summary: Resumen general de todas las especialidades
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Resumen consolidado de evaluaciones y planes por especialidad
 */
router.get('/dashboard/especialidades/resumen', getResumenEspecialidades);

/**
 * @swagger
 * /api/dashboard/especialidades/{especialidad}/detalle:
 *   get:
 *     summary: Detalle completo de una especialidad específica
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: especialidad
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Traumatologia, Neurologia, Deportologia, Pediatria, Geriatria, Sin especialidad]
 *         description: Nombre de la especialidad
 *     responses:
 *       200:
 *         description: Detalle completo con evaluaciones, planes y pacientes
 */
router.get('/dashboard/especialidades/:especialidad/detalle', getDetalleEspecialidad);

export default router;
