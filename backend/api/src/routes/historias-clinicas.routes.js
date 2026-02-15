import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createHistoriaClinica,
  getHistoriasClinicas,
  getHistoriaClinica,
  updateHistoriaClinica,
  deleteHistoriaClinica,
  getDatosParaReceta
} from '../controllers/historias-clinicas.controller.js';

const router = Router();

/**
 * ==========================================
 * HISTORIAS CLÍNICAS ROUTES
 * ==========================================
 * Rutas para gestionar historias clínicas
 * Todas requieren autenticación y rol DOCTOR
 */

// POST - Crear nueva historia clínica
router.post('/historias-clinicas', authenticateToken, createHistoriaClinica);

// GET - Listar historias clínicas (con filtros opcionales)
router.get('/historias-clinicas', authenticateToken, getHistoriasClinicas);

// GET - Obtener una historia clínica específica
router.get('/historias-clinicas/:id', authenticateToken, getHistoriaClinica);

// PUT - Actualizar historia clínica
router.put('/historias-clinicas/:id', authenticateToken, updateHistoriaClinica);

// DELETE - Eliminar historia clínica (soft delete)
router.delete('/historias-clinicas/:id', authenticateToken, deleteHistoriaClinica);

// GET - Obtener datos para crear receta desde HC
router.get('/historias-clinicas/:id/datos-receta', authenticateToken, getDatosParaReceta);

export default router;
