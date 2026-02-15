/**
 * Rutas de Planes de Tratamiento con Smart Scheduling
 * API REST siguiendo principios de diseño
 */

import { Router } from 'express';
import {
  listPlanes,
  getPlan,
  createPlan,
  updatePlan,
  generarSesionesPlan,
  registrarSesion,
  getSesionesPlan,
  reprogramarSesionController,
  buscarHorariosDisponiblesProfesional
} from '../controllers/planes.controller.v2.js';
import {
  auditMiddleware,
  captureBeforeUpdate
} from '../middlewares/audit.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Planes
 *   description: Gestión de planes de tratamiento con generación inteligente de sesiones
 */

/**
 * @swagger
 * /api/planes:
 *   get:
 *     summary: Listar planes de tratamiento con progreso
 *     tags: [Planes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVO, PAUSADO, PENDIENTE_CIERRE, COMPLETADO, CANCELADO]
 *     responses:
 *       200:
 *         description: Lista paginada de planes con progreso
 */
router.get('/', asyncHandler(listPlanes));

/**
 * @swagger
 * /api/planes/{id}:
 *   get:
 *     summary: Obtener plan de tratamiento con sesiones
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan de tratamiento con detalle de sesiones
 *       404:
 *         description: Plan no encontrado
 */
router.get('/:id', asyncHandler(getPlan));

/**
 * @swagger
 * /api/planes:
 *   post:
 *     summary: Crear plan de tratamiento
 *     tags: [Planes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evaluacion_id
 *               - objetivos
 *               - total_sesiones
 *               - frecuencia_semanal
 *               - fecha_inicio
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 */
router.post(
  '/',
  auditMiddleware('CREATE', 'planes_tratamiento'),
  asyncHandler(createPlan)
);

/**
 * @swagger
 * /api/planes/{id}:
 *   patch:
 *     summary: Actualizar plan de tratamiento
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objetivos:
 *                 type: string
 *               estado:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan actualizado
 */
router.patch(
  '/:id',
  captureBeforeUpdate('planes_tratamiento'),
  auditMiddleware('UPDATE', 'planes_tratamiento'),
  asyncHandler(updatePlan)
);

/**
 * @swagger
 * /api/planes/{id}/generar-sesiones:
 *   post:
 *     summary: Generar sesiones automáticamente con Smart Scheduling
 *     description: Algoritmo inteligente que detecta conflictos y propone alternativas
 *     tags: [Planes]
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
 *               dias_semana:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *                 example: [1, 3, 5]
 *               hora:
 *                 type: string
 *                 example: "15:00"
 *               profesional_id:
 *                 type: string
 *               duracion_minutos:
 *                 type: integer
 *                 default: 60
 *     responses:
 *       201:
 *         description: Sesiones generadas exitosamente
 *       422:
 *         description: Error de validación
 */
router.post(
  '/:id/generar-sesiones',
  auditMiddleware('GENERAR_SESIONES', 'planes_tratamiento'),
  asyncHandler(generarSesionesPlan)
);

/**
 * @swagger
 * /api/planes/{id}/sesiones:
 *   get:
 *     summary: Obtener sesiones de un plan
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, REALIZADA, CANCELADA, NO_ASISTIO]
 *     responses:
 *       200:
 *         description: Lista de sesiones
 */
router.get('/:id/sesiones', asyncHandler(getSesionesPlan));

/**
 * @swagger
 * /api/sesiones/{id}:
 *   patch:
 *     summary: Registrar sesión realizada
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *               eva_inicial:
 *                 type: integer
 *               eva_final:
 *                 type: integer
 *               ejercicios_ejecutados:
 *                 type: array
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión actualizada
 */
router.patch(
  '/sesiones/:id',
  captureBeforeUpdate('sesiones'),
  auditMiddleware('UPDATE', 'sesiones'),
  asyncHandler(registrarSesion)
);

/**
 * @swagger
 * /api/sesiones/{id}/reprogramar:
 *   post:
 *     summary: Reprogramar una sesión
 *     tags: [Planes]
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
 *             type: object
 *             required:
 *               - nueva_fecha
 *               - motivo
 *     responses:
 *       200:
 *         description: Sesión reprogramada
 */
router.post(
  '/sesiones/:id/reprogramar',
  auditMiddleware('REPROGRAMAR_SESION', 'sesiones'),
  asyncHandler(reprogramarSesionController)
);

/**
 * @swagger
 * /api/profesionales/{profesional_id}/horarios-disponibles:
 *   get:
 *     summary: Buscar horarios disponibles de un profesional
 *     tags: [Planes]
 *     parameters:
 *       - in: path
 *         name: profesional_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: duracion
 *         schema:
 *           type: integer
 *           default: 60
 *     responses:
 *       200:
 *         description: Lista de horarios disponibles
 */
router.get(
  '/profesionales/:profesional_id/horarios-disponibles',
  asyncHandler(buscarHorariosDisponiblesProfesional)
);

export default router;
