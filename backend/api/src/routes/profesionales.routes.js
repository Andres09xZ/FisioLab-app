import { Router } from 'express';
import {
  listProfesionales,
  createProfesional,
  getProfesional,
  updateProfesional,
  softDeleteProfesional,
} from '../controllers/profesionales.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Profesionales
 *     description: Gestión de profesionales
 */

// Listar profesionales
/**
 * @swagger
 * /api/profesionales:
 *   get:
 *     summary: Listar profesionales
 *     tags: [Profesionales]
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre/apellido
 *     responses:
 *       200:
 *         description: Lista de profesionales
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
 *                     $ref: '#/components/schemas/Profesional'
 */
router.get('/', listProfesionales);

// Crear profesional
/**
 * @swagger
 * /api/profesionales:
 *   post:
 *     summary: Crear profesional
 *     tags: [Profesionales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProfesionalRequest'
 *     responses:
 *       201:
 *         description: Profesional creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profesional'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', createProfesional);

// Obtener profesional por ID
/**
 * @swagger
 * /api/profesionales/{id}:
 *   get:
 *     summary: Obtener profesional por ID
 *     tags: [Profesionales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profesional encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profesional'
 *       404:
 *         description: No encontrado
 */
router.get('/:id', getProfesional);

// Actualizar profesional
/**
 * @swagger
 * /api/profesionales/{id}:
 *   put:
 *     summary: Actualizar profesional
 *     tags: [Profesionales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfesionalRequest'
 *     responses:
 *       200:
 *         description: Profesional actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profesional'
 */
router.put('/:id', updateProfesional);

// Soft delete profesional
/**
 * @swagger
 * /api/profesionales/{id}:
 *   delete:
 *     summary: Desactivar (soft delete) profesional
 *     tags: [Profesionales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profesional desactivado
 *       404:
 *         description: No encontrado
 */
router.delete('/:id', softDeleteProfesional);

export default router;
