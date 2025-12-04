import { Router } from 'express';
import { listCitas, listCalendario, createCita, bulkCitas, updateCita, deleteCita } from '../controllers/citas.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Citas
 *     description: Gestión de citas y calendario
 */

/**
 * @swagger
 * /api/citas:
 *   get:
 *     summary: Listar citas
 *     tags: [Citas]
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: profesional_id
 *         schema: { type: string }
 *       - in: query
 *         name: paciente_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de citas
 */
router.get('/', listCitas);
/**
 * @swagger
 * /api/citas/calendario:
 *   get:
 *     summary: Listar eventos de calendario
 *     tags: [Citas]
 *     responses:
 *       200:
 *         description: Eventos agrupados para calendario
 */
router.get('/calendario', listCalendario);
/**
 * @swagger
 * /api/citas:
 *   post:
 *     summary: Crear cita
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cita'
 *     responses:
 *       201:
 *         description: Cita creada
 */
router.post('/', createCita);
/**
 * @swagger
 * /api/citas/bulk:
 *   post:
 *     summary: Crear varias citas en una transacción
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Cita'
 *     responses:
 *       201:
 *         description: Citas creadas
 */
router.post('/bulk', bulkCitas);
/**
 * @swagger
 * /api/citas/{id}:
 *   put:
 *     summary: Actualizar cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cita'
 *     responses:
 *       200:
 *         description: Cita actualizada
 */
router.put('/:id', updateCita);
/**
 * @swagger
 * /api/citas/{id}:
 *   delete:
 *     summary: Eliminar cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cita eliminada
 */
router.delete('/:id', deleteCita);

export default router;
