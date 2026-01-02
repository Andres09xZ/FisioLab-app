import { Router } from 'express';
import { 
  ocupacion, 
  pacientesAtendidos, 
  ingresos,
  rendimientoProfesionales,
  progresoPlaness,
  asistencia
} from '../controllers/reportes.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Reportes
 *     description: Reportes operativos y estadísticos
 */

/**
 * @swagger
 * /api/reportes/ocupacion:
 *   get:
 *     summary: Reporte de ocupación de recursos/profesionales
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Datos de ocupación
 */
router.get('/reportes/ocupacion', ocupacion);

/**
 * @swagger
 * /api/reportes/pacientes-atendidos:
 *   get:
 *     summary: Reporte de pacientes atendidos por período
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (default primer día del mes)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (default hoy)
 *       - in: query
 *         name: profesional_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por profesional
 *     responses:
 *       200:
 *         description: Reporte de pacientes atendidos
 */
router.get('/reportes/pacientes-atendidos', pacientesAtendidos);

/**
 * @swagger
 * /api/reportes/ingresos:
 *   get:
 *     summary: Reporte de ingresos por período
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: agrupacion
 *         schema:
 *           type: string
 *           enum: [dia, semana, mes]
 *           default: dia
 *         description: Agrupar resultados por día, semana o mes
 *     responses:
 *       200:
 *         description: Reporte de ingresos con serie temporal
 */
router.get('/reportes/ingresos', ingresos);

/**
 * @swagger
 * /api/reportes/profesionales:
 *   get:
 *     summary: Reporte de rendimiento por profesional
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Rendimiento de cada profesional
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
 *                       id:
 *                         type: string
 *                       profesional:
 *                         type: string
 *                       total_citas:
 *                         type: integer
 *                       completadas:
 *                         type: integer
 *                       tasa_cumplimiento:
 *                         type: integer
 */
router.get('/reportes/profesionales', rendimientoProfesionales);

/**
 * @swagger
 * /api/reportes/planes:
 *   get:
 *     summary: Reporte de progreso de planes de tratamiento
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, finalizado, cancelado]
 *         description: Filtrar por estado del plan
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por paciente
 *     responses:
 *       200:
 *         description: Reporte de planes con progreso
 */
router.get('/reportes/planes', progresoPlaness);

/**
 * @swagger
 * /api/reportes/asistencia:
 *   get:
 *     summary: Reporte de tasa de asistencia
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: profesional_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estadísticas de asistencia
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
 *                     general:
 *                       type: object
 *                       properties:
 *                         total_citas:
 *                           type: integer
 *                         asistieron:
 *                           type: integer
 *                         no_asistieron:
 *                           type: integer
 *                         tasa_asistencia:
 *                           type: integer
 *                     por_dia_semana:
 *                       type: array
 */
router.get('/reportes/asistencia', asistencia);

export default router;
