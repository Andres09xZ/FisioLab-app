import { Router } from 'express';
import { listRecursos, createRecurso, updateRecurso } from '../controllers/recursos.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Recursos
 *     description: Camillas, salas y otros recursos
 */

/**
 * @swagger
 * /api/recursos:
 *   get:
 *     summary: Listar recursos
 *     tags: [Recursos]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo (sala, camilla, equipo)
 *     responses:
 *       200:
 *         description: Lista de recursos
 */
router.get('/', listRecursos);

/**
 * @swagger
 * /api/recursos:
 *   post:
 *     summary: Crear recurso
 *     tags: [Recursos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, tipo]
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recurso creado
 */
router.post('/', createRecurso);

/**
 * @swagger
 * /api/recursos/{id}:
 *   put:
 *     summary: Actualizar recurso
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Recurso actualizado
 */
router.put('/:id', updateRecurso);

export default router;
