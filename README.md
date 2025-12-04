<div align="center">

# 🏥 FisioLab

### *Sistema Integral de Gestión para Clínicas de Fisioterapia*

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)](https://expressjs.com/)

*Desarrollado con ❤️ por Andres Rodriguez @ **MagicCorp***

[Demo](#-demo) • [Características](#-características) • [Instalación](#-instalación) • [Documentación](#-documentación) • [Contribuir](#-contribuir)

</div>

---

## 📖 Descripción

**FisioLab** es una solución completa y moderna para la gestión de clínicas de fisioterapia. Diseñado para optimizar el flujo de trabajo de profesionales de la salud, este sistema permite gestionar pacientes, citas, sesiones de tratamiento, facturación y mucho más, todo desde una interfaz intuitiva y responsive.

### 🎯 ¿Por qué FisioLab?

- ⚡ **Rápido y Eficiente**: Interfaz moderna construida con Next.js 16 y React
- 🔒 **Seguro**: Autenticación JWT y encriptación de datos sensibles
- 📱 **Responsive**: Diseñado para funcionar en cualquier dispositivo
- 🎨 **Intuitivo**: UI/UX cuidadosamente diseñada con Shadcn/ui y Tailwind CSS
- 🔄 **Tiempo Real**: Actualización instantánea de datos con React Query
- 📊 **Completo**: Desde la agenda hasta reportes financieros detallados

---

## ✨ Características

### 🏥 Gestión de Pacientes
- ✅ Registro completo con historia clínica digital
- ✅ Gestión de evaluaciones y diagnósticos
- ✅ Seguimiento de evolución del tratamiento
- ✅ Almacenamiento seguro de documentos médicos

### 📅 Agenda Inteligente
- ✅ Calendario interactivo para citas
- ✅ Vista por profesional o por sala
- ✅ Notificaciones automáticas
- ✅ Sistema de recordatorios

### 💼 Planes de Tratamiento
- ✅ Creación personalizada de planes terapéuticos
- ✅ Seguimiento de sesiones realizadas
- ✅ Control de sesiones pendientes
- ✅ Historial completo de tratamientos

### 💰 Gestión Financiera
- ✅ Registro de pagos y facturación
- ✅ Control de ingresos por profesional
- ✅ Reportes financieros detallados
- ✅ Dashboard con métricas en tiempo real

### 👨‍⚕️ Profesionales
- ✅ Perfiles de especialistas
- ✅ Gestión de disponibilidad
- ✅ Estadísticas de rendimiento
- ✅ Control de certificados y licencias

### 📊 Reportes y Analytics
- ✅ Dashboard con KPIs principales
- ✅ Gráficos interactivos de ingresos
- ✅ Estadísticas de ocupación
- ✅ Exportación de datos

---

## 🛠️ Stack Tecnológico

### Frontend
```
⚛️  Next.js 16.0          - Framework React con SSR
🎨  Tailwind CSS          - Estilos utility-first
🧩  Shadcn/ui             - Componentes UI accesibles
🔄  TanStack Query        - Gestión de estado del servidor
📝  React Hook Form       - Manejo de formularios
📅  date-fns              - Manipulación de fechas
🎭  Lucide React          - Iconos modernos
```

### Backend
```
🚀  Node.js + Express     - API REST robusta y escalable
🐘  PostgreSQL            - Base de datos relacional
🔐  JWT + bcrypt          - Autenticación y seguridad
📤  Multer                - Upload de archivos
📚  Swagger               - Documentación automática de API
🐳  Docker                - Containerización del servicio de BD
```

---

## 🚀 Instalación

### Prerequisitos

- Node.js 18+ 
- Docker y Docker Compose
- npm o pnpm

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/fisiolab-web.git
cd fisiolab-web
```

### 2️⃣ Configurar Base de Datos

```bash
cd backend/dbService
docker-compose up -d
```

Esto iniciará PostgreSQL en `localhost:5432` con la base de datos inicializada.

### 3️⃣ Configurar el Backend

```bash
cd backend/api
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones

# Iniciar en modo desarrollo
npm run dev
```

El servidor estará en `http://localhost:3000`

### 4️⃣ Configurar el Frontend

```bash
cd frontend/fisio-lab-st-dashboard
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con la URL de tu API

# Iniciar en modo desarrollo
npm run dev
```

La aplicación estará en `http://localhost:3001`

---

## 📁 Estructura del Proyecto

```
fisiolab-web/
│
├── 📂 backend/
│   ├── 📂 api/                    # API REST
│   │   ├── 📂 src/
│   │   │   ├── 📂 controllers/   # Lógica de negocio
│   │   │   ├── 📂 routes/        # Definición de rutas
│   │   │   ├── 📂 middlewares/   # Autenticación, validación
│   │   │   ├── 📂 config/        # Configuración de BD
│   │   │   └── index.js          # Punto de entrada
│   │   ├── 📂 scripts/           # Scripts de utilidad
│   │   └── package.json
│   │
│   └── 📂 dbService/             # Servicio de Base de Datos
│       ├── docker-compose.yml    # Configuración Docker
│       └── init.sql              # Script de inicialización
│
└── 📂 frontend/
    └── 📂 fisio-lab-st-dashboard/ # Dashboard Web
        ├── 📂 app/               # Páginas (App Router)
        ├── 📂 components/        # Componentes React
        ├── 📂 hooks/             # Custom hooks
        ├── 📂 lib/               # Utilidades
        └── package.json
```

---

## 📚 Documentación

### API Documentation

Una vez iniciado el backend, la documentación Swagger estará disponible en:

```
http://localhost:3000/api-docs
```

### Documentación Adicional

- [API Routes](backend/api/API_ROUTES.md) - Documentación detallada de endpoints
- [Workflow Planes de Tratamiento](backend/api/WORKFLOW_PLANES_TRATAMIENTO.md)
- [Database Service](backend/dbService/README.md)
- [Scripts de BD](backend/api/scripts/README.md)

---

## 🔐 Variables de Entorno

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fisiolab
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secret_key_super_seguro

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🧪 Scripts Disponibles

### Backend

```bash
npm run dev        # Inicia el servidor en modo desarrollo con hot-reload
npm start          # Inicia el servidor en modo producción
npm run clean-db   # Limpia y reinicia la base de datos
```

### Frontend

```bash
npm run dev        # Inicia Next.js en modo desarrollo
npm run build      # Construye la aplicación para producción
npm start          # Inicia el servidor de producción
npm run lint       # Ejecuta el linter
```

---

## 🎨 Capturas de Pantalla

<div align="center">

### Dashboard Principal
*Vista general con métricas y gráficos en tiempo real*

### Gestión de Pacientes
*Registro completo y seguimiento de historias clínicas*

### Agenda de Citas
*Calendario interactivo y gestión de sesiones*

### Reportes Financieros
*Analytics detallados de ingresos y pagos*

</div>

---

## 🗺️ Roadmap

- [x] Sistema de autenticación y autorización
- [x] Gestión completa de pacientes
- [x] Agenda y citas
- [x] Planes de tratamiento
- [x] Sistema de pagos
- [x] Dashboard con métricas
- [ ] Notificaciones por email/SMS
- [ ] Exportación de reportes (PDF/Excel)
- [ ] App móvil para pacientes
- [ ] Integración con pasarelas de pago
- [ ] Sistema de telemedicina
- [ ] Multi-idioma (i18n)
- [ ] Modo offline

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si deseas mejorar FisioLab:

1. 🍴 Fork el proyecto
2. 🌿 Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit tus cambios (`git commit -m 'Add: nueva característica increíble'`)
4. 📤 Push a la rama (`git push origin feature/AmazingFeature`)
5. 🔃 Abre un Pull Request

### Convenciones de Commits

```
feat:     Nueva característica
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Cambios de formato (no afectan el código)
refactor: Refactorización de código
test:     Añadir o modificar tests
chore:    Tareas de mantenimiento
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 👨‍💻 Autor

**Andres Rodriguez**  
💼 [MagicCorp](https://magiccorp.com)  
📧 [Contacto](mailto:andres@magiccorp.com)  
🐙 [GitHub](https://github.com/andresrodriguez)

---

## 🙏 Agradecimientos

- Gracias a todos los profesionales de la salud que inspiraron este proyecto
- A la comunidad open source por las increíbles herramientas
- A Shadcn por los componentes UI excepcionales
- A Vercel por el increíble trabajo con Next.js

---

<div align="center">

### ⭐ Si este proyecto te resultó útil, considera darle una estrella ⭐

**Hecho con 💙 para mejorar la gestión de clínicas de fisioterapia**

</div>
