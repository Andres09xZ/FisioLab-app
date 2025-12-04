# FisioLab API

API REST para sistema de gestión de clínica de fisioterapia.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

### 3. Asegurarse que la base de datos está corriendo

```bash
cd ../dbService
docker-compose up -d
```

### 4. Iniciar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Endpoints

### Autenticación

#### Registrar usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "avatar_url": "https://ejemplo.com/avatar.jpg" // Opcional
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "avatar_url": null,
      "created_at": "2025-12-01T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Iniciar sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "avatar_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener información del usuario autenticado
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "avatar_url": null
    }
  }
}
```

### Health Check

```http
GET /api/health
```

```http
GET /
```

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. 

Para acceder a rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <tu_token>
```

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## 📁 Estructura del Proyecto

```
api/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de PostgreSQL
│   ├── controllers/
│   │   └── auth.controller.js   # Controladores de autenticación
│   ├── middlewares/
│   │   └── auth.middleware.js   # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── auth.routes.js       # Rutas de autenticación
│   │   └── index.js             # Router principal
│   └── index.js                 # Punto de entrada
├── .env                         # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Probar con el usuario admin

Puedes iniciar sesión con el usuario admin creado por defecto:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tuclinica.com",
    "password": "Admin2025!"
  }'
```

## 📝 Variables de Entorno

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://fisio_user:fisio_pass_2025@localhost:5432/fisiolabst

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
```

## 🐛 Debugging

Los logs muestran:
- Cada request (método y ruta)
- Queries SQL ejecutadas
- Duración de las queries
- Errores detallados en modo desarrollo
