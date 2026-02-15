import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createReceta,
  getRecetas,
  getReceta,
  updateReceta,
  deleteReceta,
  duplicateReceta,
  getRecetaPDF
} from '../controllers/recetas.controller.js';

const router = Router();

/**
 * ==========================================
 * RECETAS MÉDICAS ROUTES
 * ==========================================
 * Rutas para gestionar recetas médicas
 * Todas requieren autenticación y rol DOCTOR
 * 
 * @swagger
 * tags:
 *   name: Recetas
 *   description: Gestión de recetas médicas (solo DOCTORES)
 */

/**
 * @swagger
 * /api/recetas:
 *   post:
 *     summary: Crear nueva receta médica
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paciente_id
 *               - diagnostico_principal
 *               - medicamentos
 *             properties:
 *               historia_clinica_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la HC (opcional para recetas rápidas)
 *               paciente_id:
 *                 type: string
 *                 format: uuid
 *               diagnostico_principal:
 *                 type: string
 *               medicamentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     presentacion:
 *                       type: string
 *                     dosis:
 *                       type: string
 *                     duracion:
 *                       type: string
 *                     via_administracion:
 *                       type: string
 *                     indicaciones:
 *                       type: string
 *               indicaciones_generales:
 *                 type: string
 *               recomendaciones:
 *                 type: string
 *               vigencia_dias:
 *                 type: integer
 *                 default: 30
 *               firma_doctor:
 *                 type: string
 *               numero_registro_medico:
 *                 type: string
 *     responses:
 *       201:
 *         description: Receta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Solo doctores pueden crear recetas
 *       404:
 *         description: Paciente o HC no encontrada
 */
router.post('/recetas', authenticateToken, createReceta);

/**
 * @swagger
 * /api/recetas:
 *   get:
 *     summary: Listar recetas médicas del doctor autenticado
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [activa, vencida, anulada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por paciente
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por código, paciente o diagnóstico
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Tamaño de página
 *     responses:
 *       200:
 *         description: Lista de recetas con paginación
 *       403:
 *         description: Solo doctores pueden ver recetas
 */
router.get('/recetas', authenticateToken, getRecetas);

/**
 * @swagger
 * /api/recetas/{id}:
 *   get:
 *     summary: Obtener receta específica
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos de la receta
 *       403:
 *         description: Sin permisos para ver esta receta
 *       404:
 *         description: Receta no encontrada
 */
router.get('/recetas/:id', authenticateToken, getReceta);

/**
 * @swagger
 * /api/recetas/{id}:
 *   patch:
 *     summary: Actualizar receta (solo si está activa)
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicamentos:
 *                 type: array
 *               indicaciones_generales:
 *                 type: string
 *               recomendaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receta actualizada
 *       400:
 *         description: No se puede editar receta vencida/anulada
 *       403:
 *         description: Solo puedes editar tus propias recetas
 *       404:
 *         description: Receta no encontrada
 */
router.patch('/recetas/:id', authenticateToken, updateReceta);

/**
 * @swagger
 * /api/recetas/{id}:
 *   delete:
 *     summary: Anular receta (soft delete)
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Receta anulada exitosamente
 *       403:
 *         description: Solo puedes anular tus propias recetas
 *       404:
 *         description: Receta no encontrada
 */
router.delete('/recetas/:id', authenticateToken, deleteReceta);

/**
 * @swagger
 * /api/recetas/{id}/duplicate:
 *   post:
 *     summary: Duplicar receta existente
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Receta duplicada exitosamente
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Receta no encontrada
 */
router.post('/recetas/:id/duplicate', authenticateToken, duplicateReceta);

/**
 * @swagger
 * /api/recetas/{id}/pdf:
 *   get:
 *     summary: Descargar PDF de la receta
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF de la receta
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Receta no encontrada
 */
router.get('/recetas/:id/pdf', authenticateToken, getRecetaPDF);

export default router;
