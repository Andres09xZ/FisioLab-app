import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario en la base de datos CON EL ROL
    const result = await query(
      'SELECT id, email, nombre, apellido, avatar_url, rol, activo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario está activo
    if (!result.rows[0].activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar el usuario al request (ahora incluye el rol)
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

/**
 * Middleware para validar que el usuario tiene uno de los roles permitidos
 * @param {string[]} rolesPermitidos - Array de roles permitidos (ej: ['DOCTOR', 'ADMIN'])
 * @returns {Function} Middleware function
 */
export const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario tiene un rol permitido
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}`,
        rolActual: req.user.rol
      });
    }

    next();
  };
};

/**
 * Middleware específico para validar rol DOCTOR
 */
export const requireDoctor = requireRole(['DOCTOR']);

/**
 * Middleware específico para validar rol FISIOTERAPEUTA
 */
export const requireFisioterapeuta = requireRole(['FISIOTERAPEUTA']);

/**
 * Middleware para validar DOCTOR o FISIOTERAPEUTA
 */
export const requireDoctorOrFisioterapeuta = requireRole(['DOCTOR', 'FISIOTERAPEUTA']);
