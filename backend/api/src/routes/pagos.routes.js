import { Router } from 'express';
import { listPagosPorPaciente, createPago } from '../controllers/pagos.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Pagos
 *     description: Gestión de pagos de pacientes
 */

/**
 * @swagger
 * /api/pacientes/{id}/pagos:
 *   get:
 *     summary: Listar pagos de un paciente
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/pacientes/:id/pagos', listPagosPorPaciente);
/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Registrar pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pago'
 *     responses:
 *       201:
 *         description: Pago registrado
 */
router.post('/pagos', createPago);

export default router;
