import { Router } from 'express';
import { checkDisponibilidad } from '../controllers/citas.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Agenda
 *     description: Gestión de disponibilidad y horarios
 */

/**
 * @swagger
 * /api/agenda/disponibilidad:
 *   get:
 *     summary: Verificar disponibilidad de horario (anti-solapamiento)
 *     description: Verifica si un profesional está disponible en un rango de tiempo específico. Útil para validar antes de crear o mover citas.
 *     tags: [Agenda]
 *     parameters:
 *       - in: query
 *         name: profesional_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del profesional
 *         example: "66b958e1-106a-4956-81a4-e578f8c03fb6"
 *       - in: query
 *         name: inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha y hora de inicio (ISO 8601)
 *         example: "2025-12-15T10:00:00"
 *       - in: query
 *         name: fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha y hora de fin (ISO 8601)
 *         example: "2025-12-15T10:45:00"
 *       - in: query
 *         name: cita_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la cita actual (opcional, para excluirla al editar)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Resultado de verificación de disponibilidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 disponible:
 *                   type: boolean
 *                   description: true si el horario está disponible, false si hay conflictos
 *                 conflictos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       inicio:
 *                         type: string
 *                         format: date-time
 *                       fin:
 *                         type: string
 *                         format: date-time
 *                       titulo:
 *                         type: string
 *                   description: Array de citas que se solapan con el horario solicitado
 *                 message:
 *                   type: string
 *             examples:
 *               disponible:
 *                 value:
 *                   success: true
 *                   disponible: true
 *                   conflictos: []
 *                   message: "Horario disponible"
 *               no_disponible:
 *                 value:
 *                   success: true
 *                   disponible: false
 *                   conflictos:
 *                     - id: "123e4567-e89b-12d3-a456-426614174000"
 *                       inicio: "2025-12-15T10:00:00.000Z"
 *                       fin: "2025-12-15T10:45:00.000Z"
 *                       titulo: "Sesión 1 de 10"
 *                   message: "Hay 1 cita(s) que se solapan con este horario"
 *       400:
 *         description: Faltan parámetros requeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: false
 *               message: "profesional_id, inicio y fin son requeridos"
 *       500:
 *         description: Error al verificar disponibilidad
 */
router.get('/disponibilidad', checkDisponibilidad);

export default router;
