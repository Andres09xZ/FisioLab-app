# 📚 FisioLab API - Documentación para Frontend

## Agendamiento de Citas y Sesiones

Este documento contiene la especificación completa de todos los endpoints necesarios para implementar el sistema de agendamiento en el frontend.

**Base URL:** `http://localhost:3001/api`

---

## 📑 Índice de Endpoints

### Citas
1. [GET /citas](#get-citas) - Listar citas
2. [GET /citas/calendario](#get-citascalendario) - Eventos para calendario
3. [GET /citas/:id](#get-citasid) - Obtener cita por ID ⭐ NUEVO
4. [GET /citas/:id/sesion](#get-citasidsesion) - Obtener sesión de una cita ⭐ NUEVO
5. [POST /citas](#post-citas) - Crear cita
6. [PUT /citas/:id](#put-citasid) - Actualizar cita
7. [PUT /citas/:id/completar](#put-citasidcompletar) - Completar cita
8. [PUT /citas/:id/cancelar](#put-citasidcancelar) - Cancelar cita ⭐ NUEVO
9. [DELETE /citas/:id](#delete-citasid) - Eliminar cita

### Sesiones
10. [GET /sesiones](#get-sesiones) - Listar sesiones ⭐ NUEVO
11. [GET /sesiones/:id](#get-sesionesid) - Obtener sesión
12. [PUT /sesiones/:id](#put-sesionesid) - Actualizar sesión
13. [PUT /sesiones/:id/asignar-cita](#put-sesionesidasignar-cita) - Asignar cita a sesión

### Planes
14. [GET /pacientes/:id/planes](#get-pacientesidplanes) - Listar planes con sesiones ⭐ MEJORADO
15. [GET /planes/:id](#get-planesid) - Obtener plan (con contador total de sesiones)
16. [GET /planes/:id/sesiones](#get-planesidsesiones) - Sesiones del plan
17. [POST /planes/:id/generar-sesiones](#post-planesidgenerar-sesiones) - Generar sesiones automáticas
18. [POST /planes/:id/generar-sesiones-pendientes](#post-planesidgenerar-sesiones-pendientes) - Generar sesiones pendientes
19. [POST /planes/:id/finalizar](#post-planesidfinalizar) - Finalizar plan ⭐ NUEVO
20. [PATCH /planes/:id/estado](#patch-planesidestado) - Cambiar estado del plan ⭐ NUEVO

### Pacientes
21. [GET /pacientes/:id/sesiones-pendientes](#get-pacientesidsesiones-pendientes) - Sesiones pendientes

### Agenda
22. [GET /agenda/disponibilidad](#get-agendadisponibilidad) - Verificar disponibilidad

---

## 🗓️ CITAS

### GET /citas

Listar citas con filtros opcionales.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `desde` | ISO DateTime | No | Fecha inicio del rango |
| `hasta` | ISO DateTime | No | Fecha fin del rango |
| `profesional_id` | UUID | No | Filtrar por profesional |
| `paciente_id` | UUID | No | Filtrar por paciente |

**Request:**
```http
GET /api/citas?desde=2025-12-01T00:00:00&hasta=2025-12-31T23:59:59&profesional_id=uuid
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
      "recurso_id": null,
      "inicio": "2025-12-15T10:00:00.000Z",
      "fin": "2025-12-15T10:45:00.000Z",
      "titulo": "Sesión 1 de 10",
      "estado": "programada"
    }
  ]
}
```

---

### GET /citas/calendario

Obtener eventos formateados para FullCalendar.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `desde` | ISO DateTime | No | Fecha inicio |
| `hasta` | ISO DateTime | No | Fecha fin |

**Request:**
```http
GET /api/citas/calendario?desde=2025-12-01&hasta=2025-12-31
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Sesión 1 de 10",
      "start": "2025-12-15T10:00:00.000Z",
      "end": "2025-12-15T10:45:00.000Z",
      "estado": "programada"
    }
  ]
}
```

---

### GET /citas/:id

⭐ **NUEVO** - Obtener detalle completo de una cita.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID de la cita |

**Request:**
```http
GET /api/citas/550e8400-e29b-41d4-a716-446655440000
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "recurso_id": null,
    "inicio": "2025-12-15T10:00:00.000Z",
    "fin": "2025-12-15T10:45:00.000Z",
    "titulo": "Sesión 1 de 10",
    "estado": "programada",
    "notas": null,
    "paciente_nombres": "Juan",
    "paciente_apellidos": "Pérez García",
    "paciente_documento": "12345678",
    "paciente_celular": "987654321",
    "profesional_nombre": "Carlos",
    "profesional_apellido": "Ramírez",
    "profesional_especialidad": "Fisioterapeuta",
    "recurso_nombre": null,
    "sesion_id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "sesion_estado": "programada"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Cita no encontrada"
}
```

---

### GET /citas/:id/sesion

⭐ **NUEVO** - Obtener la sesión asociada a una cita (si existe).

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID de la cita |

**Request:**
```http
GET /api/citas/550e8400-e29b-41d4-a716-446655440000/sesion
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "cita_id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "fecha_sesion": "2025-12-15T10:00:00.000Z",
    "estado": "programada",
    "notas": null,
    "plan_objetivo": "Reducir dolor cervical",
    "sesiones_plan": 10,
    "sesiones_completadas": 3,
    "plan_estado": "activo",
    "paciente_nombre": "Juan Pérez García",
    "paciente_documento": "12345678",
    "profesional_nombre": "Carlos Ramírez",
    "cita_inicio": "2025-12-15T10:00:00.000Z",
    "cita_fin": "2025-12-15T10:45:00.000Z",
    "cita_titulo": "Sesión 4 de 10",
    "cita_estado": "programada"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "No hay sesión asociada a esta cita"
}
```

---

### POST /citas

Crear una nueva cita.

**Request Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `paciente_id` | UUID | ✅ Sí | ID del paciente |
| `inicio` | ISO DateTime | ✅ Sí | Fecha/hora inicio |
| `fin` | ISO DateTime | ✅ Sí | Fecha/hora fin |
| `profesional_id` | UUID | No | ID del profesional |
| `recurso_id` | UUID | No | ID del recurso (sala/camilla) |
| `titulo` | string | No | Título de la cita |
| `estado` | string | No | Estado inicial (default: 'programada') |
| `notas` | string | No | Notas adicionales |

**Request:**
```http
POST /api/citas
Content-Type: application/json

{
  "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
  "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
  "inicio": "2025-12-15T10:00:00",
  "fin": "2025-12-15T10:45:00",
  "titulo": "Consulta inicial"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "recurso_id": null,
    "inicio": "2025-12-15T10:00:00.000Z",
    "fin": "2025-12-15T10:45:00.000Z",
    "titulo": "Consulta inicial",
    "estado": "programada"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "paciente_id, inicio y fin son requeridos"
}
```

---

### PUT /citas/:id

Actualizar una cita (mover, editar).

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID de la cita |

**Request Body (todos opcionales):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `inicio` | ISO DateTime | Nueva fecha/hora inicio |
| `fin` | ISO DateTime | Nueva fecha/hora fin |
| `titulo` | string | Nuevo título |
| `estado` | string | Nuevo estado |
| `notas` | string | Nuevas notas |
| `recurso_id` | UUID | Nuevo recurso |

**Request (Drag & Drop):**
```http
PUT /api/citas/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "inicio": "2025-12-15T11:00:00",
  "fin": "2025-12-15T11:45:00"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "recurso_id": null,
    "inicio": "2025-12-15T11:00:00.000Z",
    "fin": "2025-12-15T11:45:00.000Z",
    "titulo": "Consulta inicial",
    "estado": "programada"
  }
}
```

---

### PUT /citas/:id/completar

Completar una cita. Automáticamente:
- Marca la cita como completada
- Marca la sesión asociada como completada
- Incrementa el contador de sesiones del plan
- Si el plan se completa, lo marca como completado

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID de la cita |

**Request Body (opcional):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `notas` | string | Notas de la sesión realizada |

**Request:**
```http
PUT /api/citas/550e8400-e29b-41d4-a716-446655440000/completar
Content-Type: application/json

{
  "notas": "Sesión exitosa. Paciente muestra mejoría notable."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cita": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
      "inicio": "2025-12-15T10:00:00.000Z",
      "fin": "2025-12-15T10:45:00.000Z",
      "titulo": "Sesión 1 de 10",
      "estado": "completada"
    },
    "plan": {
      "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "sesiones_plan": 10,
      "sesiones_completadas": 3,
      "estado": "activo"
    },
    "message": "Cita completada. Progreso del plan: 3/10"
  }
}
```

**Response 200 (Plan completado):**
```json
{
  "success": true,
  "data": {
    "cita": { ... },
    "plan": {
      "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "sesiones_plan": 10,
      "sesiones_completadas": 10,
      "estado": "completado"
    },
    "message": "Cita completada. Progreso del plan: 10/10"
  }
}
```

---

### PUT /citas/:id/cancelar

⭐ **NUEVO** - Cancelar una cita. Si tiene sesión asociada, la desvincula y devuelve a estado pendiente.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID de la cita |

**Request Body (opcional):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `motivo` | string | Motivo de la cancelación |

**Request:**
```http
PUT /api/citas/550e8400-e29b-41d4-a716-446655440000/cancelar
Content-Type: application/json

{
  "motivo": "Paciente no puede asistir por motivos personales"
}
```

**Response 200 (con sesión asociada):**
```json
{
  "success": true,
  "data": {
    "cita": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
      "inicio": "2025-12-15T10:00:00.000Z",
      "fin": "2025-12-15T10:45:00.000Z",
      "titulo": "Sesión 1 de 10",
      "estado": "cancelada"
    },
    "sesion_desvinculada": {
      "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  },
  "message": "Cita cancelada. La sesión fue devuelta a estado pendiente y puede ser reagendada."
}
```

**Response 200 (sin sesión asociada):**
```json
{
  "success": true,
  "data": {
    "cita": { ... },
    "sesion_desvinculada": null
  },
  "message": "Cita cancelada exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "La cita ya está cancelada"
}
```

---

### DELETE /citas/:id

Eliminar una cita permanentemente.

**Request:**
```http
DELETE /api/citas/550e8400-e29b-41d4-a716-446655440000
```

**Response 204:** (Sin contenido)

**Response 404:**
```json
{
  "message": "Cita no encontrada"
}
```

---

## 📋 SESIONES

### GET /sesiones

⭐ **NUEVO** - Listar sesiones con filtros.

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `paciente_id` | UUID | No | Filtrar por paciente |
| `plan_id` | UUID | No | Filtrar por plan |
| `estado` | string | No | Filtrar por estado: `pendiente`, `programada`, `completada`, `cancelada` |
| `sin_cita` | 'true' | No | Solo sesiones sin cita asignada |

**Request:**
```http
GET /api/sesiones?paciente_id=uuid&estado=pendiente&sin_cita=true
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "cita_id": null,
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": null,
      "fecha_sesion": null,
      "estado": "pendiente",
      "notas": null,
      "paciente_nombre": "Juan Pérez García",
      "paciente_documento": "12345678",
      "profesional_nombre": null,
      "cita_inicio": null,
      "cita_fin": null,
      "cita_estado": null,
      "plan_objetivo": "Reducir dolor cervical",
      "sesiones_plan": 10,
      "sesiones_completadas": 3
    }
  ]
}
```

---

### GET /sesiones/:id

Obtener detalle de una sesión.

**Request:**
```http
GET /api/sesiones/64b88775-24e1-4f4a-a7bd-3cca350bf457
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "cita_id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "fecha": "2025-12-15T10:00:00.000Z",
    "notas": "Primera sesión de tratamiento",
    "estado": "programada"
  }
}
```

---

### PUT /sesiones/:id

Actualizar una sesión.

**Request Body (todos opcionales):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha` | ISO DateTime | Nueva fecha |
| `notas` | string | Nuevas notas |
| `estado` | string | Nuevo estado |

**Request:**
```http
PUT /api/sesiones/64b88775-24e1-4f4a-a7bd-3cca350bf457
Content-Type: application/json

{
  "estado": "completada",
  "notas": "Sesión finalizada con éxito"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "cita_id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "fecha": "2025-12-15T10:00:00.000Z",
    "notas": "Sesión finalizada con éxito",
    "estado": "completada"
  }
}
```

---

### PUT /sesiones/:id/asignar-cita

Asignar una cita existente a una sesión pendiente. Útil para el flujo de agenda flexible.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID de la sesión |

**Request Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `cita_id` | UUID | ✅ Sí | ID de la cita a asignar |

**Request:**
```http
PUT /api/sesiones/64b88775-24e1-4f4a-a7bd-3cca350bf457/asignar-cita
Content-Type: application/json

{
  "cita_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "cita_id": "550e8400-e29b-41d4-a716-446655440000",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "fecha_sesion": "2025-12-15T10:00:00.000Z",
    "estado": "programada",
    "notas": null
  },
  "message": "Cita asignada exitosamente a la sesión"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "La sesión ya tiene una cita asignada"
}
```

```json
{
  "success": false,
  "message": "La cita no pertenece al mismo paciente de la sesión"
}
```

```json
{
  "success": false,
  "message": "La cita ya está asignada a otra sesión"
}
```

---

## 📊 PLANES

### GET /pacientes/:id/planes

⭐ **MEJORADO** - Listar planes de tratamiento de un paciente con sus sesiones anidadas.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del paciente |

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `estado` | string | No | Filtrar por estado: `activo`, `finalizado`, `cancelado` |

**Request:**
```http
GET /api/pacientes/8dc7458b-f837-473d-8b55-28ef5ab59828/planes
GET /api/pacientes/8dc7458b-f837-473d-8b55-28ef5ab59828/planes?estado=activo
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "7b1aa05b-a024-4470-bee8-29d66882cbda",
      "paciente_id": "8dc7458b-f837-473d-8b55-28ef5ab59828",
      "objetivo": "Reducir la irritación del nervio lumbar",
      "sesiones_plan": 6,
      "sesiones_completadas": 0,
      "estado": "activo",
      "notas": "Usar electrodos",
      "activo": true,
      "creado_en": "2025-12-21T16:56:08.419Z",
      "actualizado_en": "2025-12-21T17:00:59.546Z",
      "sesiones": [
        {
          "id": "372fe1f7-395d-4c63-976f-17f0b69a6ac8",
          "cita_id": "43a2fef0-8f47-4902-804e-5aa8585155f2",
          "fecha_sesion": "2025-12-22T21:00:00+00:00",
          "profesional_id": "382e7f70-9b0c-4110-910c-92dd17af1d08",
          "estado": "programada",
          "notas": null,
          "profesional_nombre": "Veronica Estrella",
          "cita_inicio": "2025-12-22T21:00:00+00:00",
          "cita_fin": "2025-12-22T22:00:00+00:00"
        },
        {
          "id": "c568f0c2-08a6-4014-8b2c-ec47b54d6807",
          "cita_id": "cba34c55-a1ce-41d9-b535-be06b5915822",
          "fecha_sesion": "2025-12-26T21:00:00+00:00",
          "profesional_id": "382e7f70-9b0c-4110-910c-92dd17af1d08",
          "estado": "programada",
          "notas": null,
          "profesional_nombre": "Veronica Estrella",
          "cita_inicio": "2025-12-26T21:00:00+00:00",
          "cita_fin": "2025-12-26T22:00:00+00:00"
        }
      ]
    }
  ]
}
```

**Campos de cada sesión:**
| Campo | Descripción |
|-------|-------------|
| `id` | ID de la sesión |
| `cita_id` | ID de la cita asociada (null si pendiente) |
| `fecha_sesion` | Fecha/hora de la sesión |
| `profesional_id` | ID del profesional asignado |
| `estado` | Estado: `pendiente`, `programada`, `completada`, `cancelada` |
| `notas` | Notas de la sesión |
| `profesional_nombre` | Nombre completo del profesional |
| `cita_inicio` | Fecha/hora inicio de la cita |
| `cita_fin` | Fecha/hora fin de la cita |

---

### GET /planes/:id

⭐ **MEJORADO** - Obtener detalle completo de un plan de tratamiento con contadores de sesiones.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del plan |

**Request:**
```http
GET /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "evaluacion_id": "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
    "objetivo": "Reducir dolor cervical, recuperar movilidad completa",
    "sesiones_plan": 10,
    "sesiones_completadas": 3,
    "estado": "activo",
    "notas": "Iniciar con terapia manual",
    "activo": true,
    "creado_en": "2025-12-04T05:00:00.000Z",
    "actualizado_en": "2025-12-15T10:30:00.000Z",
    "paciente_nombre": "Juan Pérez García",
    "paciente_documento": "12345678",
    "evaluacion_diagnostico": "Síndrome cervical por sedestación",
    "evaluacion_motivo": "Dolor cervical y contracturas",
    "evaluacion_fecha": "2025-12-04T09:00:00.000Z",
    "evaluacion_escala_eva": 7,
    "progreso_porcentaje": 30,
    "total_sesiones": 10,
    "sesiones_programadas": 5,
    "sesiones_pendientes": 2,
    "sesiones_completadas_count": 3,
    "sesiones_canceladas": 0
  }
}
```

**Campos del contador de sesiones:**
| Campo | Descripción |
|-------|-------------|
| `total_sesiones` | Cantidad total de registros de sesión creados para este plan |
| `sesiones_programadas` | Sesiones con estado "programada" (tienen cita asignada) |
| `sesiones_pendientes` | Sesiones con estado "pendiente" (sin cita asignada aún) |
| `sesiones_completadas_count` | Sesiones con estado "completada" |
| `sesiones_canceladas` | Sesiones con estado "cancelada" |
| `sesiones_completadas` | Campo del plan que se incrementa al completar (puede diferir de count si se actualiza manualmente) |
| `progreso_porcentaje` | (sesiones_completadas / sesiones_plan) * 100 |

---

### GET /planes/:id/sesiones

Listar todas las sesiones de un plan con información de citas.

**Request:**
```http
GET /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/sesiones
```

**Response 200:**
```json
[
  {
    "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "cita_id": "550e8400-e29b-41d4-a716-446655440000",
    "fecha_sesion": "2025-12-15T10:00:00.000Z",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "estado": "completada",
    "notas": "Mejoría notable",
    "creado_en": "2025-12-04T05:08:30.303Z",
    "profesional_nombre": "Dr. Carlos Ramírez",
    "cita_inicio": "2025-12-15T10:00:00.000Z",
    "cita_fin": "2025-12-15T10:45:00.000Z",
    "cita_estado": "completada"
  },
  {
    "id": "ebdf3380-7a60-4332-b355-a5d328032cfc",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "cita_id": null,
    "fecha_sesion": null,
    "profesional_id": null,
    "estado": "pendiente",
    "notas": null,
    "creado_en": "2025-12-04T05:08:30.333Z",
    "profesional_nombre": null,
    "cita_inicio": null,
    "cita_fin": null,
    "cita_estado": null
  }
]
```

---

### POST /planes/:id/generar-sesiones

Generar sesiones automáticas CON citas en el calendario.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del plan |

**Request Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fecha_inicio` | YYYY-MM-DD | ✅ Sí | Fecha de inicio |
| `dias_semana` | number[] | ✅ Sí | Días: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb |
| `hora` | HH:mm | ✅ Sí | Hora de las sesiones (24h) |
| `profesional_id` | UUID | ✅ Sí | Profesional asignado |
| `duracion_minutos` | number | No | Duración (default: 45) |

**Request:**
```http
POST /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/generar-sesiones
Content-Type: application/json

{
  "fecha_inicio": "2025-12-16",
  "dias_semana": [1, 3, 5],
  "hora": "15:00",
  "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
  "duracion_minutos": 45
}
```

**Response 201:**
```json
{
  "message": "Sesiones y citas generadas exitosamente",
  "total": 7,
  "sesiones": [
    {
      "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
      "fecha_sesion": "2025-12-16T15:00:00.000Z",
      "estado": "programada",
      "cita_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "citas_creadas": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Response 400:**
```json
{
  "error": "El plan ya tiene todas las sesiones completadas"
}
```

---

### POST /planes/:id/generar-sesiones-pendientes

Generar sesiones SIN citas (estado pendiente). Útil para horarios variables.

**Request Body (opcional):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cantidad_sesiones` | number | Cantidad a generar (default: sesiones restantes del plan) |

**Request:**
```http
POST /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/generar-sesiones-pendientes
Content-Type: application/json

{
  "cantidad_sesiones": 5
}
```

**Response 201:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": null,
      "cita_id": null,
      "fecha_sesion": "2025-12-21T...",
      "estado": "pendiente",
      "notas": null
    }
  ],
  "message": "5 sesiones pendientes creadas exitosamente"
}
```

---

### POST /planes/:id/finalizar

⭐ **NUEVO** - Finalizar un plan de tratamiento.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del plan |

**Request Body (opcional):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `notas_cierre` | string | Notas de cierre del tratamiento |

**Request:**
```http
POST /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/finalizar
Content-Type: application/json

{
  "notas_cierre": "Tratamiento completado con éxito. Paciente recuperado al 100%."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "objetivo": "Reducir dolor cervical",
    "sesiones_plan": 10,
    "sesiones_completadas": 10,
    "estado": "finalizado",
    "notas": "Iniciar con terapia manual\n--- Notas de cierre ---\nTratamiento completado con éxito.",
    "activo": false,
    "creado_en": "2025-12-04T05:00:00.000Z",
    "actualizado_en": "2025-12-21T20:30:00.000Z"
  },
  "message": "Plan finalizado exitosamente"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "El plan ya está finalizado"
}
```

---

### PATCH /planes/:id/estado

⭐ **NUEVO** - Cambiar el estado de un plan de tratamiento.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del plan |

**Request Body:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `estado` | string | ✅ Sí | Nuevo estado: `activo`, `finalizado`, `cancelado` |
| `motivo` | string | No | Motivo del cambio de estado |

**Request:**
```http
PATCH /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/estado
Content-Type: application/json

{
  "estado": "cancelado",
  "motivo": "Paciente solicitó cancelar el tratamiento por viaje"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
    "objetivo": "Reducir dolor cervical",
    "sesiones_plan": 10,
    "sesiones_completadas": 3,
    "estado": "cancelado",
    "notas": "--- CANCELADO ---\nPaciente solicitó cancelar el tratamiento por viaje",
    "activo": false,
    "creado_en": "2025-12-04T05:00:00.000Z",
    "actualizado_en": "2025-12-21T20:30:00.000Z"
  },
  "message": "Estado del plan cambiado de 'activo' a 'cancelado'"
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Estado inválido. Valores permitidos: activo, finalizado, cancelado"
}
```

**Estados del Plan:**
| Estado | Descripción | activo |
|--------|-------------|--------|
| `activo` | Plan en curso | `true` |
| `finalizado` | Plan completado exitosamente | `false` |
| `cancelado` | Plan cancelado | `false` |

---

## 👤 PACIENTES

### GET /pacientes/:id/sesiones-pendientes

⭐ **NUEVO** - Obtener sesiones pendientes de un paciente (sin cita asignada).

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | UUID | ID del paciente |

**Request:**
```http
GET /api/pacientes/123e4567-e89b-12d3-a456-426614174000/sesiones-pendientes
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": null,
      "cita_id": null,
      "fecha_sesion": null,
      "estado": "pendiente",
      "notas": null,
      "plan_objetivo": "Reducir dolor cervical",
      "sesiones_plan": 10,
      "sesiones_completadas": 3,
      "plan_estado": "activo"
    },
    {
      "id": "ebdf3380-7a60-4332-b355-a5d328032cfc",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "123e4567-e89b-12d3-a456-426614174000",
      "profesional_id": null,
      "cita_id": null,
      "fecha_sesion": null,
      "estado": "pendiente",
      "notas": null,
      "plan_objetivo": "Reducir dolor cervical",
      "sesiones_plan": 10,
      "sesiones_completadas": 3,
      "plan_estado": "activo"
    }
  ],
  "total_pendientes": 2
}
```

---

## 🕐 AGENDA

### GET /agenda/disponibilidad

Verificar si un horario está disponible (anti-solapamiento).

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `profesional_id` | UUID | ✅ Sí | ID del profesional |
| `inicio` | ISO DateTime | ✅ Sí | Fecha/hora inicio |
| `fin` | ISO DateTime | ✅ Sí | Fecha/hora fin |
| `cita_id` | UUID | No | Excluir esta cita (para edición) |

**Request:**
```http
GET /api/agenda/disponibilidad?profesional_id=uuid&inicio=2025-12-15T10:00:00&fin=2025-12-15T10:45:00
```

**Response 200 (Disponible):**
```json
{
  "success": true,
  "disponible": true,
  "conflictos": [],
  "message": "Horario disponible"
}
```

**Response 200 (No disponible):**
```json
{
  "success": true,
  "disponible": false,
  "conflictos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "inicio": "2025-12-15T09:30:00.000Z",
      "fin": "2025-12-15T10:15:00.000Z",
      "titulo": "Sesión con otro paciente"
    }
  ],
  "message": "Hay 1 cita(s) que se solapan con este horario"
}
```

---

## 🔄 Flujos de Uso Típicos

### Flujo 1: Crear cita directa

1. Verificar disponibilidad: `GET /api/agenda/disponibilidad?profesional_id=...&inicio=...&fin=...`
2. Si está disponible, crear la cita: `POST /api/citas`

### Flujo 2: Generar sesiones automáticas

1. Crear plan: `POST /api/pacientes/{id}/planes`
2. Generar sesiones con citas: `POST /api/planes/{plan_id}/generar-sesiones`

### Flujo 3: Agenda flexible (sesiones pendientes)

1. Generar sesiones pendientes: `POST /api/planes/{plan_id}/generar-sesiones-pendientes`
2. Más tarde, crear cita desde calendario: `POST /api/citas`
3. Asignar cita a sesión pendiente: `PUT /api/sesiones/{sesion_id}/asignar-cita`

### Flujo 4: Cancelar y reagendar

1. Cancelar cita (sesión vuelve a pendiente): `PUT /api/citas/{cita_id}/cancelar`
2. Crear nueva cita: `POST /api/citas`
3. Asignar la nueva cita a la sesión pendiente: `PUT /api/sesiones/{sesion_id}/asignar-cita`

---

## 🎨 Códigos de Color Sugeridos

| Estado | Color | Hex |
|--------|-------|-----|
| programada | Azul | `#3B82F6` |
| completada | Verde | `#10B981` |
| cancelada | Gris | `#9CA3AF` |
| pendiente | Amarillo | `#F59E0B` |

---

## ⚠️ Códigos de Error HTTP

| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 204 | Eliminado (sin contenido) |
| 400 | Datos inválidos / Validación fallida |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: solapamiento) |
| 500 | Error interno del servidor |

---

**Última actualización:** 21 de diciembre de 2025  
**Versión API:** 1.1.0  
**Swagger:** http://localhost:3001/api/docs
