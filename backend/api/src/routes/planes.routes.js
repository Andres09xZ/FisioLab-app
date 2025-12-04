import { Router } from 'express';
import { listPlanesPorPaciente, createPlan, updatePlan, createPlanForEvaluation, getSesionesPlan, generarSesionesAutomaticamente } from '../controllers/planes.controller.js';

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
 *     summary: Generar sesiones automáticas para un plan de tratamiento
 *     description: Crea sesiones automáticamente basándose en una fecha de inicio, días de la semana y hora específica
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
 *                 description: Hora de las sesiones en formato HH:mm
 *               profesional_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del profesional que atenderá las sesiones
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

export default router;