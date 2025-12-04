import { Router } from 'express';
import { resumen, ingresosMes } from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Resúmenes e indicadores
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

export default router;
