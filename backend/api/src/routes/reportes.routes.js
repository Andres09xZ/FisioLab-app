import { Router } from 'express';
import { ocupacion } from '../controllers/reportes.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Reportes
 *     description: Reportes operativos
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

export default router;
