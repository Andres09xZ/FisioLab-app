import { Router } from 'express';
import { 
  listSesiones,
  createSesion, 
  getSesion, 
  updateSesion, 
  registrarEvaluacion,
  asignarCitaASesion 
} from '../controllers/sesiones.controller.js';

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
 *   get:
 *     summary: Listar sesiones con filtros
 *     description: Retorna sesiones filtradas por paciente, plan, estado o sin cita asignada
 *     tags: [Sesiones]
 *     parameters:
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por paciente
 *       - in: query
 *         name: plan_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por plan de tratamiento
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, programada, completada, cancelada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: sin_cita
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Si es 'true', solo sesiones sin cita asignada
 *     responses:
 *       200:
 *         description: Lista de sesiones
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
 *                       plan_id:
 *                         type: string
 *                       cita_id:
 *                         type: string
 *                         nullable: true
 *                       paciente_id:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       paciente_nombre:
 *                         type: string
 *                       profesional_nombre:
 *                         type: string
 *                       cita_inicio:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 */
router.get('/', listSesiones);

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

/**
 * @swagger
 * /api/sesiones/{id}/asignar-cita:
 *   put:
 *     summary: Asignar una cita existente a una sesión pendiente
 *     description: Vincula una cita a una sesión que está en estado "pendiente". Útil para el flujo de agenda donde se crean citas y luego se asignan a sesiones de un plan.
 *     tags: [Sesiones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cita_id
 *             properties:
 *               cita_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la cita a asignar
 *           example:
 *             cita_id: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Cita asignada exitosamente
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
 *                     id:
 *                       type: string
 *                     plan_id:
 *                       type: string
 *                     cita_id:
 *                       type: string
 *                     paciente_id:
 *                       type: string
 *                     profesional_id:
 *                       type: string
 *                     fecha_sesion:
 *                       type: string
 *                       format: date-time
 *                     estado:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Sesión ya tiene cita asignada, cita de otro paciente, o cita ya asignada a otra sesión
 *       404:
 *         description: Sesión o cita no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/asignar-cita', asignarCitaASesion);

export default router;
