import { Router } from 'express';
import { listPacientes, createPaciente, getPaciente, updatePaciente } from '../controllers/pacientes.controller.js';
import { listEvaluacionesByPaciente } from '../controllers/evaluaciones.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Pacientes
 *     description: Gestión de pacientes e historia clínica
 */

/**
 * @swagger
 * /api/pacientes:
 *   get:
 *     summary: Listar pacientes
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, apellido o documento
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/', listPacientes);
/**
 * @swagger
 * /api/pacientes:
 *   post:
 *     summary: Crear paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Paciente'
 *     responses:
 *       201:
 *         description: Paciente creado
 */
router.post('/', createPaciente);
/**
 * @swagger
 * /api/pacientes/{id}:
 *   get:
 *     summary: Obtener paciente por ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente
 *       404:
 *         description: No encontrado
 */
router.get('/:id', getPaciente);
/**
 * @swagger
 * /api/pacientes/{id}:
 *   put:
 *     summary: Actualizar paciente
 *     tags: [Pacientes]
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
 *             $ref: '#/components/schemas/Paciente'
 *     responses:
 *       200:
 *         description: Paciente actualizado
 */
router.put('/:id', updatePaciente);

/**
 * @swagger
 * /api/pacientes/{id}/evaluaciones:
 *   get:
 *     summary: Listar evaluaciones de un paciente
 *     tags: [Pacientes, Evaluaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Lista de evaluaciones del paciente
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
 *                         format: uuid
 *                       paciente_id:
 *                         type: string
 *                         format: uuid
 *                       fecha_evaluacion:
 *                         type: string
 *                         format: date-time
 *                       motivo_consulta:
 *                         type: string
 *                       diagnostico:
 *                         type: string
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/evaluaciones', listEvaluacionesByPaciente);

export default router;
