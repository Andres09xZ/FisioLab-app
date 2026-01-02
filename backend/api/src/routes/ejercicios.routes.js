import { Router } from 'express';
import {
  listEjercicios,
  getEjercicio,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio,
  asignarEjerciciosAPlan,
  getEjerciciosDePlan
} from '../controllers/ejercicios.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Ejercicios
 *     description: Biblioteca de ejercicios terapéuticos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ejercicio:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         categoria:
 *           type: string
 *           example: "fortalecimiento"
 *         zona_corporal:
 *           type: string
 *           example: "espalda"
 *         dificultad:
 *           type: string
 *           enum: [facil, medio, dificil]
 *         instrucciones:
 *           type: string
 *         imagen_url:
 *           type: string
 *         video_url:
 *           type: string
 *         activo:
 *           type: boolean
 *         creado_en:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/ejercicios:
 *   get:
 *     summary: Listar ejercicios con filtros
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: zona_corporal
 *         schema:
 *           type: string
 *         description: Filtrar por zona corporal
 *       - in: query
 *         name: dificultad
 *         schema:
 *           type: string
 *           enum: [facil, medio, dificil]
 *         description: Filtrar por dificultad
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de ejercicios con filtros disponibles
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
 *                     $ref: '#/components/schemas/Ejercicio'
 *                 filtros:
 *                   type: object
 *                   properties:
 *                     categorias:
 *                       type: array
 *                       items:
 *                         type: string
 *                     zonas_corporales:
 *                       type: array
 *                       items:
 *                         type: string
 *                     dificultades:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/', listEjercicios);

/**
 * @swagger
 * /api/ejercicios/{id}:
 *   get:
 *     summary: Obtener ejercicio por ID
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ejercicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ejercicio'
 *       404:
 *         description: Ejercicio no encontrado
 */
router.get('/:id', getEjercicio);

/**
 * @swagger
 * /api/ejercicios:
 *   post:
 *     summary: Crear nuevo ejercicio
 *     tags: [Ejercicios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Sentadilla profunda"
 *               descripcion:
 *                 type: string
 *                 example: "Ejercicio de fortalecimiento de miembros inferiores"
 *               categoria:
 *                 type: string
 *                 example: "fortalecimiento"
 *               zona_corporal:
 *                 type: string
 *                 example: "piernas"
 *               dificultad:
 *                 type: string
 *                 enum: [facil, medio, dificil]
 *                 default: medio
 *               instrucciones:
 *                 type: string
 *                 example: "1. Párese con los pies al ancho de hombros..."
 *               imagen_url:
 *                 type: string
 *               video_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ejercicio creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', createEjercicio);

/**
 * @swagger
 * /api/ejercicios/{id}:
 *   put:
 *     summary: Actualizar ejercicio
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *               zona_corporal:
 *                 type: string
 *               dificultad:
 *                 type: string
 *                 enum: [facil, medio, dificil]
 *               instrucciones:
 *                 type: string
 *               imagen_url:
 *                 type: string
 *               video_url:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ejercicio actualizado
 *       404:
 *         description: Ejercicio no encontrado
 */
router.put('/:id', updateEjercicio);

/**
 * @swagger
 * /api/ejercicios/{id}:
 *   delete:
 *     summary: Desactivar ejercicio (soft delete)
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ejercicio desactivado
 *       404:
 *         description: Ejercicio no encontrado
 */
router.delete('/:id', deleteEjercicio);

/**
 * @swagger
 * /api/planes/{plan_id}/ejercicios:
 *   post:
 *     summary: Asignar ejercicios a un plan de tratamiento
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: plan_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ejercicios
 *             properties:
 *               ejercicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ejercicio_id
 *                   properties:
 *                     ejercicio_id:
 *                       type: string
 *                       format: uuid
 *                     series:
 *                       type: integer
 *                       default: 3
 *                     repeticiones:
 *                       type: integer
 *                       default: 10
 *                     notas:
 *                       type: string
 *           example:
 *             ejercicios:
 *               - ejercicio_id: "550e8400-e29b-41d4-a716-446655440000"
 *                 series: 3
 *                 repeticiones: 12
 *                 notas: "Con peso ligero inicialmente"
 *     responses:
 *       201:
 *         description: Ejercicios asignados exitosamente
 *       404:
 *         description: Plan no encontrado
 */
router.post('/planes/:plan_id/ejercicios', asignarEjerciciosAPlan);

/**
 * @swagger
 * /api/planes/{plan_id}/ejercicios:
 *   get:
 *     summary: Obtener ejercicios asignados a un plan
 *     tags: [Ejercicios]
 *     parameters:
 *       - in: path
 *         name: plan_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de ejercicios del plan
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
 *                       ejercicio_id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       series:
 *                         type: integer
 *                       repeticiones:
 *                         type: integer
 *                       notas:
 *                         type: string
 */
router.get('/planes/:plan_id/ejercicios', getEjerciciosDePlan);

export default router;
