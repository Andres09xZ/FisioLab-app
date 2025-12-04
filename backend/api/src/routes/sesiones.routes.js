import { Router } from 'express';
import { createSesion, getSesion, updateSesion, registrarEvaluacion } from '../controllers/sesiones.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Sesiones
 *     description: Sesiones y evaluación fisioterapéutica
 */

/**
 * @swagger
 * /api/sesiones:
 *   post:
 *     summary: Crear sesión
 *     tags: [Sesiones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sesion'
 *     responses:
 *       201:
 *         description: Sesión creada
 */
router.post('/', createSesion);
/**
 * @swagger
 * /api/sesiones/{id}:
 *   get:
 *     summary: Obtener sesión por ID
 *     tags: [Sesiones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sesión
 *       404:
 *         description: No encontrada
 */
router.get('/:id', getSesion);
/**
 * @swagger
 * /api/sesiones/{id}:
 *   put:
 *     summary: Actualizar sesión
 *     tags: [Sesiones]
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
 *             $ref: '#/components/schemas/Sesion'
 *     responses:
 *       200:
 *         description: Sesión actualizada
 */
router.put('/:id', updateSesion);
/**
 * @swagger
 * /api/sesiones/{id}/evaluacion:
 *   post:
 *     summary: Registrar evaluación fisioterapéutica para la sesión
 *     tags: [Sesiones]
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
 *             type: object
 *     responses:
 *       200:
 *         description: Evaluación registrada
 */
router.post('/:id/evaluacion', registrarEvaluacion);

export default router;
