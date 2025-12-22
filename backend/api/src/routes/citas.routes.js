import { Router } from 'express';
import { 
  listCitas, 
  listCalendario, 
  createCita, 
  bulkCitas, 
  updateCita, 
  deleteCita,
  checkDisponibilidad,
  completarCita,
  getCita,
  cancelarCita,
  getSesionDeCita
} from '../controllers/citas.controller.js';

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
 *   get:
 *     summary: Obtener cita por ID con datos relacionados
 *     description: Retorna la cita con información del paciente, profesional, recurso y sesión asociada
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita encontrada
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
 *                     paciente_id:
 *                       type: string
 *                     profesional_id:
 *                       type: string
 *                     inicio:
 *                       type: string
 *                       format: date-time
 *                     fin:
 *                       type: string
 *                       format: date-time
 *                     titulo:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     paciente_nombres:
 *                       type: string
 *                     paciente_apellidos:
 *                       type: string
 *                     profesional_nombre:
 *                       type: string
 *                     sesion_id:
 *                       type: string
 *                       nullable: true
 *                     plan_id:
 *                       type: string
 *                       nullable: true
 *       404:
 *         description: Cita no encontrada
 */
router.get('/:id', getCita);

/**
 * @swagger
 * /api/citas/{id}/sesion:
 *   get:
 *     summary: Obtener la sesión asociada a una cita
 *     description: Retorna la sesión que está vinculada a esta cita, con información del plan de tratamiento
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Sesión encontrada
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
 *                     plan_objetivo:
 *                       type: string
 *                     sesiones_plan:
 *                       type: integer
 *                     sesiones_completadas:
 *                       type: integer
 *                     paciente_nombre:
 *                       type: string
 *       404:
 *         description: No hay sesión asociada a esta cita
 */
router.get('/:id/sesion', getSesionDeCita);

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

/**
 * @swagger
 * /api/citas/{id}/cancelar:
 *   put:
 *     summary: Cancelar cita y desvincular sesión asociada
 *     description: Marca la cita como cancelada. Si tiene una sesión asociada, la desvincula y la devuelve a estado pendiente para poder reagendarla.
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita a cancelar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de la cancelación
 *           example:
 *             motivo: "Paciente no puede asistir por motivos personales"
 *     responses:
 *       200:
 *         description: Cita cancelada exitosamente
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
 *                     cita:
 *                       type: object
 *                     sesion_desvinculada:
 *                       type: object
 *                       nullable: true
 *                 message:
 *                   type: string
 *       400:
 *         description: La cita ya está cancelada
 *       404:
 *         description: Cita no encontrada
 */
router.put('/:id/cancelar', cancelarCita);

/**
 * @swagger
 * /api/citas/{id}/completar:
 *   put:
 *     summary: Marcar cita como completada y actualizar progreso del plan
 *     description: Actualiza el estado de la cita a 'completada', marca la sesión asociada como completada e incrementa el contador de sesiones completadas en el plan de tratamiento
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: 
 *           type: string
 *           format: uuid
 *         description: ID de la cita a completar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notas:
 *                 type: string
 *                 description: Notas adicionales sobre la sesión completada
 *           example:
 *             notas: "Sesión exitosa. Paciente muestra mejoría en movilidad cervical."
 *     responses:
 *       200:
 *         description: Cita completada exitosamente
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
 *                     cita:
 *                       type: object
 *                       description: Datos de la cita actualizada
 *                     plan:
 *                       type: object
 *                       description: Progreso del plan actualizado
 *                       properties:
 *                         id:
 *                           type: string
 *                         sesiones_plan:
 *                           type: integer
 *                         sesiones_completadas:
 *                           type: integer
 *                         estado:
 *                           type: string
 *                     message:
 *                       type: string
 *             example:
 *               success: true
 *               data:
 *                 cita:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   estado: "completada"
 *                 plan:
 *                   id: "a8fe733a-49b3-41e2-b886-55b8b8e49ea2"
 *                   sesiones_plan: 10
 *                   sesiones_completadas: 3
 *                   estado: "activo"
 *                 message: "Cita completada. Progreso del plan: 3/10"
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error al completar la cita
 */
router.put('/:id/completar', completarCita);

export default router;
