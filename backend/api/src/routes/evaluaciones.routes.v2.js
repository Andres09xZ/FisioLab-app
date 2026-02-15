/**
 * Rutas de Evaluaciones con Versionado Inmutable
 * API REST siguiendo principios de diseño
 */

import { Router } from 'express';
import {
  listEvaluaciones,
  getEvaluacion,
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  listEvaluacionesByPaciente,
  compararVersionesEvaluacion,
  getHistorialVersiones
} from '../controllers/evaluaciones.controller.v2.js';
import {
  auditMiddleware,
  captureBeforeDelete,
  captureBeforeUpdate
} from '../middlewares/audit.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Evaluaciones
 *   description: Gestión de evaluaciones fisioterapéuticas con versionado inmutable
 */

/**
 * @swagger
 * /api/evaluaciones:
 *   get:
 *     summary: Listar evaluaciones con paginación y filtros
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: es_activa
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [fecha_creacion, version_numero, eva_score]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Lista paginada de evaluaciones
 */
router.get('/', asyncHandler(listEvaluaciones));

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
 *       - in: query
 *         name: incluir_historial
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Evaluación encontrada
 *       404:
 *         description: Evaluación no encontrada
 */
router.get('/:id', asyncHandler(getEvaluacion));

/**
 * @swagger
 * /api/evaluaciones:
 *   post:
 *     summary: Crear nueva evaluación (versión 1)
 *     tags: [Evaluaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paciente_id
 *               - motivo_consulta
 *               - diagnostico_fisio
 *     responses:
 *       201:
 *         description: Evaluación creada exitosamente
 *       422:
 *         description: Error de validación
 */
router.post(
  '/',
  auditMiddleware('CREATE', 'evaluaciones'),
  asyncHandler(createEvaluacion)
);

/**
 * @swagger
 * /api/evaluaciones/{id}:
 *   put:
 *     summary: Actualizar evaluación (CREA NUEVA VERSIÓN)
 *     description: No actualiza in-place. Crea una nueva versión manteniendo historial inmutable
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
 *             type: object
 *             required:
 *               - motivo_cambio
 *     responses:
 *       200:
 *         description: Nueva versión creada exitosamente
 *       404:
 *         description: Evaluación no encontrada
 */
router.put(
  '/:id',
  captureBeforeUpdate('evaluaciones'),
  auditMiddleware('UPDATE', 'evaluaciones'),
  asyncHandler(updateEvaluacion)
);

/**
 * @swagger
 * /api/evaluaciones/{id}:
 *   delete:
 *     summary: Eliminar evaluación
 *     description: Eliminación física con auditoría completa
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
 *             type: object
 *             required:
 *               - motivo
 *     responses:
 *       204:
 *         description: Evaluación eliminada
 *       404:
 *         description: Evaluación no encontrada
 */
router.delete(
  '/:id',
  captureBeforeDelete('evaluaciones'),
  auditMiddleware('DELETE', 'evaluaciones'),
  asyncHandler(deleteEvaluacion)
);

/**
 * @swagger
 * /api/evaluaciones/{id}/historial:
 *   get:
 *     summary: Obtener historial completo de versiones
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de versiones
 */
router.get('/:id/historial', asyncHandler(getHistorialVersiones));

/**
 * @swagger
 * /api/evaluaciones/{id}/comparar/{version_id}:
 *   get:
 *     summary: Comparar dos versiones de una evaluación
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: version_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comparación de versiones
 */
router.get('/:id/comparar/:version_id', asyncHandler(compararVersionesEvaluacion));

/**
 * @swagger
 * /api/pacientes/{id}/evaluaciones:
 *   get:
 *     summary: Obtener evaluaciones activas de un paciente
 *     tags: [Evaluaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evaluaciones activas del paciente
 */
router.get('/pacientes/:id/evaluaciones', asyncHandler(listEvaluacionesByPaciente));

export default router;
