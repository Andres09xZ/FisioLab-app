import { Router } from 'express';
import { 
  listEvaluaciones, 
  getEvaluacion, 
  createEvaluacion, 
  updateEvaluacion, 
  deleteEvaluacion,
  listEvaluacionesByPaciente 
} from '../controllers/evaluaciones.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Evaluaciones
 *     description: Evaluaciones fisioterapéuticas de pacientes
 */

/**
 * @swagger
 * /api/evaluaciones:
 *   get:
 *     summary: Listar evaluaciones fisioterapéuticas
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de paciente
 *     responses:
 *       200:
 *         description: Lista de evaluaciones
 */
router.get('/', listEvaluaciones);

/**
 * @swagger
 * /api/evaluaciones/{id}:
 *   get:
 *     summary: Obtener evaluación por ID
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evaluación encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', getEvaluacion);

/**
 * @swagger
 * /api/evaluaciones:
 *   post:
 *     summary: Crear evaluación fisioterapéutica
 *     tags: [Evaluaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvaluacionFisioterapeutica'
 *     responses:
 *       201:
 *         description: Evaluación creada
 */
router.post('/', createEvaluacion);

/**
 * @swagger
 * /api/evaluaciones/{id}:
 *   put:
 *     summary: Actualizar evaluación
 *     tags: [Evaluaciones]
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
 *             $ref: '#/components/schemas/EvaluacionFisioterapeutica'
 *     responses:
 *       200:
 *         description: Evaluación actualizada
 */
router.put('/:id', updateEvaluacion);

/**
 * @swagger
 * /api/evaluaciones/{id}:
 *   delete:
 *     summary: Eliminar evaluación
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Evaluación eliminada
 */
router.delete('/:id', deleteEvaluacion);

export default router;
