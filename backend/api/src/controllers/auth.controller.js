import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, nombre, apellido, avatar_url } = req.body;

    // Validaciones
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: email, password, nombre, apellido'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insertar el nuevo usuario
    const result = await query(
      `INSERT INTO usuarios (email, password_hash, nombre, apellido, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, nombre, apellido, avatar_url, created_at`,
      [email.toLowerCase(), password_hash, nombre, apellido, avatar_url || null]
    );

    const newUser = result.rows[0];

    // Generar token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          avatar_url: newUser.avatar_url,
          created_at: newUser.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const result = await query(
      'SELECT id, email, password_hash, nombre, apellido, avatar_url FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          avatar_url: user.avatar_url
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // El usuario ya viene del middleware authenticateToken
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message
    });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    // En una implementación con JWT stateless, el logout es manejado en el cliente
    // simplemente eliminando el token. Este endpoint sirve para:
    // 1. Confirmar la intención de logout
    // 2. Potencialmente invalidar el token en una blacklist (implementación futura)
    // 3. Registrar el evento de logout

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
};

// POST /api/auth/refresh (opcional - para refrescar token)
export const refreshToken = async (req, res) => {
  try {
    // El usuario viene del middleware (token válido pero posiblemente por expirar)
    const newToken = generateToken(req.user.id);

    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        token: newToken,
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error en refreshToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error al refrescar token',
      error: error.message
    });
  }
};

// PUT /api/auth/password - Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener hash actual
    const userResult = await query(
      'SELECT password_hash FROM usuarios WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hashear nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};
