import { Router } from 'express';
import { listCertificadosPorPaciente, createCertificado, getCertificadoPdf } from '../controllers/certificados.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Certificados
 *     description: Emisión de certificados y descarga en PDF
 */

/**
 * @swagger
 * /api/pacientes/{id}/certificados:
 *   get:
 *     summary: Listar certificados de un paciente
 *     tags: [Certificados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de certificados
 */
router.get('/pacientes/:id/certificados', listCertificadosPorPaciente);
/**
 * @swagger
 * /api/certificados:
 *   post:
 *     summary: Crear certificado
 *     tags: [Certificados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificado'
 *     responses:
 *       201:
 *         description: Certificado creado
 */
router.post('/certificados', createCertificado);
/**
 * @swagger
 * /api/certificados/{id}/pdf:
 *   get:
 *     summary: Obtener certificado en PDF
 *     tags: [Certificados]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF generado
 */
router.get('/certificados/:id/pdf', getCertificadoPdf);

export default router;
