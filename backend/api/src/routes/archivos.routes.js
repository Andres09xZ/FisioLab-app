import { Router } from 'express';
import { uploader, uploadArchivoPaciente, deleteArchivo } from '../controllers/archivos.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Archivos
 *     description: Subida y eliminación de archivos adjuntos
 */

/**
 * @swagger
 * /api/pacientes/{id}/archivos:
 *   post:
 *     summary: Subir archivo de paciente
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido
 */
router.post('/pacientes/:id/archivos', uploader.single('file'), uploadArchivoPaciente);
/**
 * @swagger
 * /api/archivos/{id}:
 *   delete:
 *     summary: Eliminar archivo adjunto
 *     tags: [Archivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Archivo eliminado
 */
router.delete('/archivos/:id', deleteArchivo);

export default router;
