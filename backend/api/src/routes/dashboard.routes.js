import { Router } from 'express';
import { resumen, ingresosMes, getAnalyticsDashboard, getTendencias } from '../controllers/dashboard.controller.js';

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

export default router;
