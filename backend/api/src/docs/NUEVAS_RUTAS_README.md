# API FisioLab - Documentación para Frontend

## 📋 Resumen de Endpoints

### Base URL
```
http://localhost:3001/api
```

### Swagger/OpenAPI
Documentación interactiva disponible en:
```
http://localhost:3001/api/docs
```

---

## 🔐 Autenticación (Auth)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/me` | Obtener usuario autenticado | Sí |
| POST | `/auth/logout` | Cerrar sesión | Sí |
| POST | `/auth/refresh` | Refrescar token JWT | Sí |
| PUT | `/auth/password` | Cambiar contraseña | Sí |

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: 'password123'
  })
});
const { data } = await response.json();
// data.token, data.user

// Guardar token
localStorage.setItem('token', data.token);
```

### Usar token en peticiones
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

---

## 👥 Profesionales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/profesionales` | Listar profesionales |
| GET | `/profesionales/:id` | Obtener profesional |
| POST | `/profesionales` | Crear profesional |
| PUT | `/profesionales/:id` | Actualizar profesional |
| DELETE | `/profesionales/:id` | Desactivar profesional (soft delete) |

### Query params para listar:
- `activo`: boolean - Filtrar por activos
- `q`: string - Búsqueda por nombre

### Crear profesional:
```javascript
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "documento": "12345678",
  "telefono": "0999999999",
  "especialidad": "Fisioterapia deportiva",
  "color_agenda": "#10B981",
  "comision_porcentaje": 30
}
```

---

## 👤 Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pacientes` | Listar pacientes |
| GET | `/pacientes/:id` | Obtener paciente |
| POST | `/pacientes` | Crear paciente |
| PUT | `/pacientes/:id` | Actualizar paciente |
| DELETE | `/pacientes/:id` | Desactivar paciente |

---

## 📅 Citas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/citas` | Listar citas con filtros |
| GET | `/citas/calendario` | Citas formato calendario con datos completos |
| GET | `/citas/:id` | Obtener cita con datos relacionados |
| POST | `/citas` | Crear cita |
| PUT | `/citas/:id` | Actualizar cita |
| DELETE | `/citas/:id` | Eliminar cita |
| PUT | `/citas/:id/completar` | Marcar cita como completada |
| PUT | `/citas/:id/cancelar` | Cancelar cita |

### GET /citas/calendario
Devuelve citas en formato calendario con información completa del paciente, profesional y recurso.

**Query params:**
- `desde`: date-time
- `hasta`: date-time

**Respuesta incluye:**
```javascript
{
  "success": true,
  "data": [{
    "id": "uuid",
    "title": "Consulta Fisioterapia",
    "start": "2024-01-15T10:00:00Z",
    "end": "2024-01-15T10:45:00Z",
    "estado": "programada",
    "notas": "Primera sesión",
    "paciente_id": "uuid",
    "paciente_nombre": "Juan Pérez",
    "paciente_telefono": "0999999999",
    "paciente_email": "juan@email.com",
    "profesional_id": "uuid",
    "profesional_nombre": "Dr. Ana García",
    "recurso_id": "uuid",
    "recurso_nombre": "Sala 1"
  }]
}
```

### Query params adicionales:
- `profesional_id`: UUID
- `paciente_id`: UUID

### Estados de cita:
- `programada` - Cita agendada
- `confirmada` - Confirmada por paciente
- `en_curso` - Cita en curso
- `completada` - Sesión realizada
- `finalizada` - Sesión finalizada (alternativa a completada)
- `cancelada` - Cita cancelada
- `no_asistio` - Paciente no asistió
- `en_progreso` - En atención actual

---

## 📆 Agenda

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/agenda` | Agenda con filtros y formato calendario completo |
| GET | `/agenda/disponibilidad` | Verificar disponibilidad de horario |

### GET /agenda
Devuelve agenda con información completa de pacientes, profesionales y recursos.

**Query params:**
- `fecha`: date (YYYY-MM-DD)
- `fecha_inicio`, `fecha_fin`: rango personalizado
- `profesional_id`: UUID
- `paciente_id`: UUID
- `estado`: string
- `vista`: 'dia' | 'semana' | 'mes'

**Respuesta:**
```javascript
{
  "success": true,
  "data": {
    "eventos": [
      {
        "id": "uuid",
        "title": "Juan Pérez - Fisioterapia",
        "start": "2024-01-15T10:00:00Z",
        "end": "2024-01-15T10:45:00Z",
        "backgroundColor": "#10B981",
        "borderColor": "#10B981",
        "extendedProps": {
          "estado": "programada",
          "paciente_id": "uuid",
          "paciente_nombre": "Juan Pérez",
          "paciente_telefono": "0999999999",
          "paciente_email": "juan@email.com",
          "profesional_id": "uuid",
          "profesional_nombre": "Dr. Ana García",
          "recurso_id": "uuid",
          "recurso_nombre": "Sala 1",
          "especialidad": "Fisioterapia deportiva",
          "notas": "Primera sesión"
        }
      }
    ],
    "resumen": {
      "total": 15,
      "programadas": 10,
      "completadas": 3,
      "canceladas": 2,
      "en_progreso": 0
    },
    "periodo": {
      "inicio": "2024-01-15T00:00:00Z",
      "fin": "2024-01-21T23:59:59Z",
      "vista": "semana"
    }
  }
}
```

### Verificar disponibilidad:
```javascript
const response = await fetch(
  `/api/agenda/disponibilidad?profesional_id=${id}&inicio=${start}&fin=${end}`
);
const { disponible, conflictos } = await response.json();
```

---

## 📋 Planes de Tratamiento

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pacientes/:id/planes` | Listar planes de un paciente |
| POST | `/pacientes/:id/planes` | Crear plan para paciente |
| GET | `/planes/:id` | Obtener plan con estadísticas |
| PUT | `/planes/:id` | Actualizar plan |
| DELETE | `/planes/:id` | Eliminar plan (y sesiones) |
| POST | `/evaluaciones/:id/planes` | Crear plan desde evaluación |
| GET | `/planes/:id/sesiones` | Obtener sesiones del plan |
| POST | `/planes/:id/generar-sesiones` | Generar sesiones automáticamente |
| POST | `/planes/:id/generar-pendientes` | Generar sesiones pendientes |
| PUT | `/planes/:id/finalizar` | Finalizar plan |
| PUT | `/planes/:id/estado` | Cambiar estado del plan |

### Crear plan:
```javascript
{
  "objetivo": "Recuperar movilidad en hombro derecho",
  "sesiones_plan": 12,
  "notas": "Paciente con lesión deportiva",
  "evaluacion_id": "uuid-opcional"  // Asociar a una evaluación
}
```

**Respuesta incluye:**
```javascript
{
  "success": true,
  "data": {
    "id": "uuid",
    "paciente_id": "uuid",
    "evaluacion_id": "uuid",  // Si se proporcionó
    "objetivo": "Recuperar movilidad...",
    "sesiones_plan": 12,
    "sesiones_completadas": 0,
    "estado": "activo",
    "notas": "...",
    "activo": true,
    "creado_en": "2024-01-15T..."
  }
}
```

### Listar planes de paciente:
```javascript
// GET /api/pacientes/:id/planes
{
  "success": true,
  "data": [{
    "id": "uuid",
    "evaluacion_id": "uuid",
    "objetivo": "Rehabilitación lumbar",
    "sesiones_plan": 10,
    "evaluacion": {  // Datos de la evaluación asociada
      "id": "uuid",
      "diagnostico": "Lumbalgia mecánica",
      "fecha_evaluacion": "2024-01-10T..."
    },
    "sesiones": [...]  // Lista de sesiones del plan
  }]
}
```

### Generar sesiones automáticas:
```javascript
{
  "fecha_inicio": "2024-01-15",
  "dias_semana": [1, 3, 5],  // Lunes, Miércoles, Viernes
  "hora": "10:00",
  "profesional_id": "uuid-del-profesional",
  "duracion_minutos": 45
}
```

### Eliminar plan:
```javascript
// Normal (falla si tiene sesiones completadas)
await fetch(`/api/planes/${id}`, { method: 'DELETE' });

// Forzar eliminación
await fetch(`/api/planes/${id}?force=true`, { method: 'DELETE' });
```

---

## 🩺 Sesiones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/sesiones` | Listar sesiones con filtros |
| GET | `/sesiones/:id` | Obtener sesión |
| POST | `/sesiones` | Crear sesión |
| PUT | `/sesiones/:id` | Actualizar sesión |
| PUT | `/sesiones/:id/asignar-cita` | Asignar cita a sesión pendiente |
| POST | `/sesiones/:id/evaluacion` | Registrar evaluación |
| POST | `/sesiones/:id/notas` | Agregar notas a sesión |
| POST | `/sesiones/validar-horario` | Validar disponibilidad |
| GET | `/sesiones/horarios-disponibles` | Obtener slots disponibles |

### Query params para listar:
- `paciente_id`: UUID
- `plan_id`: UUID
- `estado`: 'pendiente' | 'programada' | 'completada' | 'cancelada'
- `sin_cita`: 'true' - Solo sesiones sin cita asignada

### Validar horario (antes de crear cita):
```javascript
const response = await fetch('/api/sesiones/validar-horario', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profesional_id: 'uuid',
    fecha_inicio: '2024-01-15T10:00:00Z',
    fecha_fin: '2024-01-15T10:45:00Z'
  })
});
const { disponible, conflictos } = await response.json();
```

### Horarios disponibles:
```javascript
const response = await fetch(
  '/api/sesiones/horarios-disponibles?profesional_id=uuid&fecha=2024-01-15&duracion_minutos=45'
);
const { data } = await response.json();
// data: [{ inicio, fin, hora }, ...]
```

### Agregar notas:
```javascript
await fetch(`/api/sesiones/${id}/notas`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notas: 'Paciente mostró mejoría',
    append: true  // Agrega a notas existentes
  })
});
```

---

## 💪 Ejercicios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/ejercicios` | Listar ejercicios con filtros |
| GET | `/ejercicios/:id` | Obtener ejercicio |
| POST | `/ejercicios` | Crear ejercicio |
| PUT | `/ejercicios/:id` | Actualizar ejercicio |
| DELETE | `/ejercicios/:id` | Desactivar ejercicio |
| POST | `/planes/:plan_id/ejercicios` | Asignar ejercicios a plan |
| GET | `/planes/:plan_id/ejercicios` | Obtener ejercicios del plan |

### Query params para listar:
- `categoria`: string
- `zona_corporal`: string
- `dificultad`: 'facil' | 'medio' | 'dificil'
- `q`: búsqueda por nombre/descripción
- `activo`: boolean

### Crear ejercicio:
```javascript
{
  "nombre": "Sentadilla profunda",
  "descripcion": "Ejercicio de fortalecimiento de miembros inferiores",
  "categoria": "fortalecimiento",
  "zona_corporal": "piernas",
  "dificultad": "medio",
  "instrucciones": "1. Párese con los pies al ancho de hombros...",
  "imagen_url": "https://...",
  "video_url": "https://..."
}
```

### Asignar ejercicios a plan:
```javascript
await fetch(`/api/planes/${planId}/ejercicios`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ejercicios: [
      { ejercicio_id: 'uuid1', series: 3, repeticiones: 12, notas: 'Con peso ligero' },
      { ejercicio_id: 'uuid2', series: 4, repeticiones: 15 }
    ]
  })
});
```

---

## 📊 Analytics & Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard/resumen` | Resumen rápido |
| GET | `/dashboard/ingresos-mes` | Ingresos del mes actual |
| GET | `/analytics/dashboard` | Métricas completas |
| GET | `/analytics/tendencias` | Tendencias de citas |

### GET /analytics/dashboard
Query params:
- `fecha_inicio`: date
- `fecha_fin`: date

```javascript
const response = await fetch('/api/analytics/dashboard?fecha_inicio=2024-01-01&fecha_fin=2024-01-31');
const { data } = await response.json();
// data.resumen: { pacientes, citas, sesiones, ingresos, ... }
// data.graficos: { citas_por_estado, citas_por_profesional }
```

---

## 📈 Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reportes/ocupacion` | Ocupación de recursos |
| GET | `/reportes/pacientes-atendidos` | Pacientes atendidos por período |
| GET | `/reportes/ingresos` | Reporte de ingresos |
| GET | `/reportes/profesionales` | Rendimiento por profesional |
| GET | `/reportes/planes` | Progreso de planes |
| GET | `/reportes/asistencia` | Tasa de asistencia |

### Ejemplo: Reporte de ingresos
```javascript
const response = await fetch(
  '/api/reportes/ingresos?fecha_inicio=2024-01-01&fecha_fin=2024-01-31&agrupacion=semana'
);
const { data } = await response.json();
// data.resumen: { total, cantidad, promedio }
// data.serie: [{ periodo, total, cantidad }, ...]
```

---

## 🔄 Flujos Comunes

### 1. Flujo de Agendamiento

```javascript
// 1. Verificar disponibilidad
const disponibilidad = await fetch('/api/agenda/disponibilidad?...').then(r => r.json());

if (disponibilidad.disponible) {
  // 2. Crear cita
  const cita = await fetch('/api/citas', {
    method: 'POST',
    body: JSON.stringify({ paciente_id, profesional_id, inicio, fin, titulo })
  }).then(r => r.json());
}
```

### 2. Flujo de Plan de Tratamiento

```javascript
// 1. Crear plan
const plan = await fetch(`/api/pacientes/${pacienteId}/planes`, {
  method: 'POST',
  body: JSON.stringify({ objetivo, sesiones_plan: 12 })
}).then(r => r.json());

// 2. Generar sesiones automáticas
await fetch(`/api/planes/${plan.data.id}/generar-sesiones`, {
  method: 'POST',
  body: JSON.stringify({
    fecha_inicio: '2024-01-15',
    dias_semana: [1, 3, 5],
    hora: '10:00',
    profesional_id
  })
});

// 3. Obtener sesiones generadas
const sesiones = await fetch(`/api/planes/${plan.data.id}/sesiones`).then(r => r.json());
```

### 3. Completar Sesión desde Agenda

```javascript
// 1. Completar la cita (actualiza automáticamente sesión y plan)
const resultado = await fetch(`/api/citas/${citaId}/completar`, {
  method: 'PUT',
  body: JSON.stringify({ notas: 'Sesión exitosa' })
}).then(r => r.json());

// resultado.data.plan muestra progreso actualizado
```

---

## ❌ Manejo de Errores

### Formato estándar de error:
```javascript
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalle técnico (opcional)"
}
```

### Códigos HTTP comunes:
- `200` - Éxito
- `201` - Creado
- `204` - Sin contenido (eliminación exitosa)
- `400` - Datos inválidos
- `401` - No autenticado
- `404` - No encontrado
- `409` - Conflicto (ej: email duplicado)
- `500` - Error del servidor

### Ejemplo de manejo:
```javascript
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error desconocido');
  }
  
  return data;
} catch (error) {
  console.error('Error:', error.message);
  // Mostrar mensaje al usuario
}
```

---

## 🔧 Configuración CORS

Orígenes permitidos:
- `http://localhost:3000`
- `http://localhost:3002`
- `http://localhost:5173` (Vite)
- `http://localhost:5174`
- `http://localhost:4200` (Angular)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:4200`

---

## 📝 Notas Importantes

1. **Fechas**: Usar formato ISO 8601 (`2024-01-15T10:00:00Z`)
2. **UUIDs**: Todos los IDs son UUID v4
3. **Autenticación**: Bearer token en header `Authorization`
4. **Paginación**: No implementada actualmente, cuidado con datasets grandes
5. **Soft Delete**: Profesionales y ejercicios usan `activo: false` en lugar de eliminación física
