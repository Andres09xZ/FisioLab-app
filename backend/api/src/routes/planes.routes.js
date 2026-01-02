import { Router } from 'express';
import { 
  listPlanesPorPaciente, 
  createPlan, 
  updatePlan,
  getPlan,
  createPlanForEvaluation, 
  getSesionesPlan, 
  generarSesionesAutomaticamente,
  generarSesionesPendientes,
  finalizarPlan,
  cambiarEstadoPlan,
  deletePlan
} from '../controllers/planes.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Planes
 *     description: Planes de tratamiento por paciente
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PlanTratamiento:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         paciente_id:
 *           type: string
 *           format: uuid
 *         evaluacion_id:
 *           type: string
 *           format: uuid
 *         objetivo:
 *           type: string
 *         sesiones_plan:
 *           type: integer
 *         sesiones_completadas:
 *           type: integer
 *         estado:
 *           type: string
 *           enum: [activo, completado, cancelado]
 *         notas:
 *           type: string
 *         creado_en:
 *           type: string
 *           format: date-time
 *         actualizado_en:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/pacientes/{id}/planes:
 *   get:
 *     summary: Listar planes de tratamiento de un paciente
 *     tags: [Planes]
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
 *         description: Lista de planes del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanTratamiento'
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/pacientes/:id/planes', listPlanesPorPaciente);

/**
 * @swagger
 * /api/pacientes/{id}/planes:
 *   post:
 *     summary: Crear plan de tratamiento para un paciente
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - objetivo
 *               - sesiones_plan
 *             properties:
 *               evaluacion_id:
 *                 type: string
 *                 format: uuid
 *               objetivo:
 *                 type: string
 *                 example: Recuperar movilidad en hombro derecho
 *               sesiones_plan:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               notas:
 *                 type: string
 *                 example: Paciente con lesión deportiva
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanTratamiento'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/pacientes/:id/planes', createPlan);

/**
 * @swagger
 * /api/planes/{id}:
 *   get:
 *     summary: Obtener plan de tratamiento por ID
 *     description: Retorna el plan con información del paciente, evaluación asociada y estadísticas de progreso
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     responses:
 *       200:
 *         description: Plan encontrado
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
 *                     evaluacion_id:
 *                       type: string
 *                     objetivo:
 *                       type: string
 *                     sesiones_plan:
 *                       type: integer
 *                     sesiones_completadas:
 *                       type: integer
 *                     estado:
 *                       type: string
 *                     paciente_nombre:
 *                       type: string
 *                     evaluacion_diagnostico:
 *                       type: string
 *                     progreso_porcentaje:
 *                       type: number
 *                     sesiones_programadas:
 *                       type: integer
 *                     sesiones_pendientes:
 *                       type: integer
 *       404:
 *         description: Plan no encontrado
 */
router.get('/planes/:id', getPlan);

/**
 * @swagger
 * /api/planes/{id}:
 *   put:
 *     summary: Actualizar plan de tratamiento
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objetivo:
 *                 type: string
 *               sesiones_plan:
 *                 type: integer
 *               sesiones_completadas:
 *                 type: integer
 *               estado:
 *                 type: string
 *                 enum: [activo, completado, cancelado]
 *               notas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanTratamiento'
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/planes/:id', updatePlan);

/**
 * @swagger
 * /api/planes/{id}:
 *   delete:
 *     summary: Eliminar plan de tratamiento
 *     description: Elimina un plan y todas sus sesiones/citas asociadas. No permite eliminar planes con sesiones completadas a menos que se use force=true.
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan a eliminar
 *       - in: query
 *         name: force
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Si es 'true', elimina el plan aunque tenga sesiones completadas
 *     responses:
 *       200:
 *         description: Plan eliminado exitosamente
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
 *                     objetivo:
 *                       type: string
 *                 eliminados:
 *                   type: object
 *                   properties:
 *                     sesiones:
 *                       type: integer
 *                     citas:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: El plan tiene sesiones completadas (use force=true)
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/planes/:id', deletePlan);

/**
 * @swagger
 * /api/evaluaciones/{id}/planes:
 *   post:
 *     summary: Crear plan de tratamiento desde una evaluación fisioterapéutica
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la evaluación fisioterapéutica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - objetivo
 *               - sesiones_plan
 *             properties:
 *               objetivo:
 *                 type: string
 *                 example: Mejorar rango de movimiento cervical
 *               sesiones_plan:
 *                 type: integer
 *                 minimum: 1
 *                 example: 12
 *               notas:
 *                 type: string
 *                 example: Plan basado en evaluación inicial del 01/12/2025
 *     responses:
 *       201:
 *         description: Plan creado exitosamente desde evaluación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanTratamiento'
 *       404:
 *         description: Evaluación no encontrada
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/evaluaciones/:id/planes', createPlanForEvaluation);

/**
 * @swagger
 * /api/planes/{id}/sesiones:
 *   get:
 *     summary: Obtener todas las sesiones de un plan de tratamiento
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     responses:
 *       200:
 *         description: Lista de sesiones del plan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   plan_id:
 *                     type: string
 *                     format: uuid
 *                   fecha_sesion:
 *                     type: string
 *                     format: date-time
 *                   profesional_id:
 *                     type: string
 *                     format: uuid
 *                   profesional_nombre:
 *                     type: string
 *                   estado:
 *                     type: string
 *                     enum: [programada, completada, cancelada]
 *                   notas:
 *                     type: string
 *                   creado_en:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/planes/:id/sesiones', getSesionesPlan);

/**
 * @swagger
 * /api/planes/{id}/generar-sesiones:
 *   post:
 *     summary: Generar sesiones automáticas y citas para un plan de tratamiento
 *     description: Crea sesiones Y citas automáticamente basándose en una fecha de inicio, días de la semana, hora y duración específica. Las citas se crean en el calendario para cada sesión.
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_inicio
 *               - dias_semana
 *               - hora
 *               - profesional_id
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-04"
 *                 description: Fecha de inicio para generar sesiones
 *               dias_semana:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 example: [1, 3, 5]
 *                 description: "Días de la semana (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)"
 *               hora:
 *                 type: string
 *                 pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "10:00"
 *                 description: Hora de las sesiones en formato HH:mm (24 horas)
 *               profesional_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del profesional que atenderá las sesiones
 *               duracion_minutos:
 *                 type: integer
 *                 default: 45
 *                 example: 45
 *                 description: Duración de cada sesión en minutos (por defecto 45 minutos)
 *     responses:
 *       201:
 *         description: Sesiones generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "10 sesiones generadas exitosamente"
 *                 sesiones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       plan_id:
 *                         type: string
 *                         format: uuid
 *                       fecha_sesion:
 *                         type: string
 *                         format: date-time
 *                       profesional_id:
 *                         type: string
 *                         format: uuid
 *                       estado:
 *                         type: string
 *                         enum: [programada]
 *       400:
 *         description: Datos inválidos o plan ya completado
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/planes/:id/generar-sesiones', generarSesionesAutomaticamente);

/**
 * @swagger
 * /api/planes/{id}/generar-sesiones-pendientes:
 *   post:
 *     summary: Generar sesiones pendientes simples para un plan (sin citas asignadas)
 *     description: Crea N sesiones en estado "pendiente" vinculadas al plan. Útil para crear sesiones que luego se asignarán manualmente a citas desde la agenda.
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad_sesiones:
 *                 type: integer
 *                 description: Cantidad de sesiones a generar (opcional, usa sesiones_plan - sesiones_completadas si no se envía)
 *                 example: 5
 *     responses:
 *       201:
 *         description: Sesiones pendientes creadas exitosamente
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
 *                 message:
 *                   type: string
 *       400:
 *         description: No hay sesiones por generar
 *       404:
 *         description: Plan no encontrado
 */
router.post('/planes/:id/generar-sesiones-pendientes', generarSesionesPendientes);

/**
 * @swagger
 * /api/planes/{id}/sesiones:
 *   get:
 *     summary: Listar sesiones de un plan con información de citas y profesionales
 *     description: Retorna todas las sesiones asociadas al plan con detalles de citas asignadas y profesionales.
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     responses:
 *       200:
 *         description: Lista de sesiones del plan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   plan_id:
 *                     type: string
 *                   cita_id:
 *                     type: string
 *                     nullable: true
 *                   fecha_sesion:
 *                     type: string
 *                     format: date-time
 *                   profesional_id:
 *                     type: string
 *                     nullable: true
 *                   estado:
 *                     type: string
 *                   notas:
 *                     type: string
 *                     nullable: true
 *                   profesional_nombre:
 *                     type: string
 *                     nullable: true
 *                   cita_inicio:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   cita_fin:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   cita_estado:
 *                     type: string
 *                     nullable: true
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/planes/:id/sesiones', getSesionesPlan);

/**
 * @swagger
 * /api/planes/{id}/finalizar:
 *   post:
 *     summary: Finalizar un plan de tratamiento
 *     description: Marca el plan como finalizado y opcionalmente agrega notas de cierre
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notas_cierre:
 *                 type: string
 *                 example: Tratamiento completado con éxito. Paciente recuperado.
 *     responses:
 *       200:
 *         description: Plan finalizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PlanTratamiento'
 *                 message:
 *                   type: string
 *       400:
 *         description: El plan ya está finalizado
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/planes/:id/finalizar', finalizarPlan);

/**
 * @swagger
 * /api/planes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de un plan de tratamiento
 *     description: Permite cambiar el estado del plan a activo, finalizado o cancelado
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan de tratamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [activo, finalizado, cancelado]
 *                 example: finalizado
 *               motivo:
 *                 type: string
 *                 example: Paciente solicitó cancelar el tratamiento
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PlanTratamiento'
 *                 message:
 *                   type: string
 *       400:
 *         description: Estado inválido
 *       404:
 *         description: Plan no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/planes/:id/estado', cambiarEstadoPlan);

export default router;