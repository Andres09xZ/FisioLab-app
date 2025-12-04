# FisioLab - Flujo de Trabajo: Planes de Tratamiento y Sesiones

Base URL: `http://localhost:3001/api`

## 📋 Resumen del Flujo

Este documento describe el flujo completo para gestionar planes de tratamiento desde la evaluación inicial hasta el seguimiento de sesiones:

1. **Ver detalle del paciente** → Obtener información completa
2. **Listar evaluaciones** → Ver historial o crear nueva evaluación
3. **Crear plan de tratamiento** → Desde una evaluación específica
4. **Generar sesiones automáticamente** → Programar 5, 10, 12... sesiones
5. **Ver progreso del plan** → Seguimiento de sesiones completadas

---

## 🔄 Flujo Paso a Paso

### Paso 1: Ver Detalle del Paciente

**Endpoint:** `GET /pacientes/{id}`

**Ejemplo:**
```http
GET http://localhost:3001/api/pacientes/1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc
```

**Respuesta (200):**
```json
{
  "id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "tipo_documento": "DNI",
  "documento": "12345678",
  "celular": "987654321",
  "email": "juan.perez@email.com",
  "fecha_nacimiento": "1985-03-15",
  "sexo": "M",
  "edad": 39,
  "direccion": "Av. Principal 123",
  "emergencia_nombre": "María Pérez",
  "emergencia_telefono": "987123456",
  "antecedentes": ["Diabetes", "Hipertensión"],
  "notas": "Paciente regular, sin alergias conocidas",
  "activo": true
}
```

---

### Paso 2: Ver Todas las Evaluaciones del Paciente

**Endpoint:** `GET /pacientes/{id}/evaluaciones`

**Características:**
- ✅ Evaluaciones ordenadas por fecha **descendente** (más reciente primero)
- ✅ Si no hay evaluaciones, permite crear una nueva
- ✅ Cada evaluación puede generar un plan de tratamiento

**Ejemplo:**
```http
GET http://localhost:3001/api/pacientes/1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc/evaluaciones
```

**Respuesta (200):**
```json
[
  {
    "id": "7c8f9e1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
    "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
    "fecha_evaluacion": "2025-12-03T10:30:00.000Z",
    "motivo_consulta": "Dolor lumbar crónico",
    "desde_cuando": "3 meses",
    "intensidad": "7/10",
    "diagnostico": "Lumbalgia mecánica por sedestación prolongada",
    "observaciones_inspeccion": "Contractura paravertebral bilateral",
    "creado_en": "2025-12-03T10:35:00.000Z"
  },
  {
    "id": "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
    "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
    "fecha_evaluacion": "2025-11-15T14:00:00.000Z",
    "motivo_consulta": "Esguince de tobillo derecho",
    "desde_cuando": "2 semanas",
    "intensidad": "5/10",
    "diagnostico": "Esguince grado II tobillo derecho",
    "creado_en": "2025-11-15T14:10:00.000Z"
  }
]
```

**Si no hay evaluaciones (200):**
```json
[]
```

---

### Paso 2.1: Crear Nueva Evaluación (Si es necesario)

**Endpoint:** `POST /evaluaciones`

**Body:**
```json
{
  "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
  "fecha_evaluacion": "2025-12-04T09:00:00.000Z",
  "profesion": "Desarrollador de software",
  "tipo_trabajo": "Oficina",
  "sedestacion_prolongada": true,
  "esfuerzo_fisico": false,
  "motivo_consulta": "Dolor cervical y contracturas",
  "desde_cuando": "1 mes",
  "intensidad": "6/10",
  "observaciones_inspeccion": "Rectificación cervical, contractura trapecio bilateral",
  "contracturas": true,
  "irradiacion": true,
  "hacia_donde": "Hombros y brazos",
  "limitacion_izquierdo": "Rotación cervical 40%",
  "limitacion_derecho": "Rotación cervical 40%",
  "diagnostico": "Síndrome cervical por sedestación prolongada",
  "tratamientos_anteriores": "Ninguno"
}
```

**Respuesta (201):**
```json
{
  "id": "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
  "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
  "fecha_evaluacion": "2025-12-04T09:00:00.000Z",
  "motivo_consulta": "Dolor cervical y contracturas",
  "diagnostico": "Síndrome cervical por sedestación prolongada",
  "creado_en": "2025-12-04T05:00:00.000Z",
  "actualizado_en": "2025-12-04T05:00:00.000Z"
}
```

---

### Paso 3: Crear Plan de Tratamiento desde una Evaluación

**Endpoint:** `POST /evaluaciones/{evaluacion_id}/planes`

**Características:**
- ✅ Vincula automáticamente el plan con la evaluación y el paciente
- ✅ Define objetivos terapéuticos específicos
- ✅ Establece número total de sesiones planificadas
- ✅ Estado inicial: `'activo'`

**Ejemplo:**
```http
POST http://localhost:3001/api/evaluaciones/9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f/planes
Content-Type: application/json
```

**Body:**
```json
{
  "objetivo": "Reducir dolor cervical, recuperar movilidad completa y fortalecer musculatura cervical",
  "sesiones_plan": 10,
  "notas": "Paciente con buena adherencia. Iniciar con terapia manual y progresar a ejercicios de fortalecimiento."
}
```

**Respuesta (201):**
```json
{
  "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
  "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
  "evaluacion_id": "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
  "objetivo": "Reducir dolor cervical, recuperar movilidad completa y fortalecer musculatura cervical",
  "sesiones_plan": 10,
  "sesiones_completadas": 0,
  "estado": "activo",
  "notas": "Paciente con buena adherencia. Iniciar con terapia manual y progresar a ejercicios de fortalecimiento.",
  "activo": true,
  "creado_en": "2025-12-04T05:00:00.000Z",
  "actualizado_en": "2025-12-04T05:00:00.000Z"
}
```

**Validaciones:**
- ❌ 400: Si falta `objetivo` o `sesiones_plan`
- ❌ 404: Si la evaluación no existe

---

### Paso 4: Generar Sesiones Automáticamente

**Endpoint:** `POST /planes/{plan_id}/generar-sesiones`

**Características:**
- ✅ Genera sesiones automáticamente según días de la semana
- ✅ Asigna profesional responsable
- ✅ Programa fechas y horarios específicos
- ✅ Calcula solo sesiones restantes: `sesiones_plan - sesiones_completadas`
- ✅ Estado inicial de cada sesión: `'programada'`

**Ejemplo:**
```http
POST http://localhost:3001/api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/generar-sesiones
Content-Type: application/json
```

**Body:**
```json
{
  "fecha_inicio": "2025-12-04",
  "dias_semana": [1, 3, 5],
  "hora": "15:00",
  "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6"
}
```

**Parámetros:**
- `fecha_inicio`: Fecha de inicio (formato: `YYYY-MM-DD`)
- `dias_semana`: Array de días (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)
  - Ejemplo: `[1, 3, 5]` = Lunes, Miércoles, Viernes
  - Ejemplo: `[2, 4]` = Martes, Jueves
- `hora`: Hora de las sesiones (formato: `HH:MM`, 24 horas)
- `profesional_id`: UUID del profesional que realizará las sesiones

**Respuesta (201):**
```json
{
  "message": "Sesiones generadas exitosamente",
  "sesiones": [
    {
      "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
      "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
      "fecha_sesion": "2025-12-03T15:00:00.000Z",
      "estado": "programada",
      "notas": null,
      "creado_en": "2025-12-04T05:08:30.303Z",
      "actualizado_en": "2025-12-04T05:08:30.303Z"
    },
    {
      "id": "ebdf3380-7a60-4332-b355-a5d328032cfc",
      "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
      "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
      "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
      "fecha_sesion": "2025-12-05T15:00:00.000Z",
      "estado": "programada",
      "notas": null,
      "creado_en": "2025-12-04T05:08:30.333Z",
      "actualizado_en": "2025-12-04T05:08:30.333Z"
    }
  ]
}
```

**Validaciones:**
- ❌ 400: Si `dias_semana` no es un array o está vacío
- ❌ 400: Si el plan ya tiene todas las sesiones completadas
- ❌ 404: Si el plan no existe
- ❌ 23503 (DB Error): Si el `profesional_id` no existe

**Notas importantes:**
- 📌 **Debes crear un profesional primero** usando `POST /profesionales` antes de generar sesiones
- 📌 Solo se generan las sesiones **restantes** del plan
- 📌 Las fechas se calculan automáticamente según los días de la semana seleccionados

---

### Paso 5: Ver Sesiones del Plan

**Endpoint:** `GET /planes/{plan_id}/sesiones`

**Características:**
- ✅ Lista todas las sesiones del plan
- ✅ Muestra nombre completo del profesional asignado
- ✅ Ordenadas por fecha de sesión ascendente
- ✅ Incluye estado: `'programada'`, `'completada'`, `'cancelada'`

**Ejemplo:**
```http
GET http://localhost:3001/api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/sesiones
```

**Respuesta (200):**
```json
[
  {
    "id": "64b88775-24e1-4f4a-a7bd-3cca350bf457",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "fecha_sesion": "2025-12-03T15:00:00.000Z",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "profesional_nombre": "Dr. Carlos Ramírez",
    "estado": "completada",
    "notas": "Sesión inicial - Evaluación y terapia manual",
    "creado_en": "2025-12-04T05:08:30.303Z"
  },
  {
    "id": "ebdf3380-7a60-4332-b355-a5d328032cfc",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "fecha_sesion": "2025-12-05T15:00:00.000Z",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "profesional_nombre": "Dr. Carlos Ramírez",
    "estado": "completada",
    "notas": "Mejoría notable en movilidad cervical",
    "creado_en": "2025-12-04T05:08:30.333Z"
  },
  {
    "id": "2d897068-5bb4-4e3d-8348-051ab01c6828",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "fecha_sesion": "2025-12-08T15:00:00.000Z",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "profesional_nombre": "Dr. Carlos Ramírez",
    "estado": "completada",
    "notas": null,
    "creado_en": "2025-12-04T05:08:30.332Z"
  },
  {
    "id": "9f70cff8-ecf6-4050-b188-86374e706a99",
    "plan_id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
    "fecha_sesion": "2025-12-10T15:00:00.000Z",
    "profesional_id": "66b958e1-106a-4956-81a4-e578f8c03fb6",
    "profesional_nombre": "Dr. Carlos Ramírez",
    "estado": "programada",
    "notas": null,
    "creado_en": "2025-12-04T05:08:30.333Z"
  }
]
```

**Si no hay sesiones generadas (200):**
```json
[]
```

---

### Paso 6: Ver Progreso del Plan de Tratamiento

**Endpoint:** `GET /planes/{plan_id}`

**Características:**
- ✅ Muestra sesiones completadas vs. sesiones planificadas
- ✅ Calcula porcentaje de progreso
- ✅ Incluye objetivo y estado del plan
- ✅ Información del paciente y evaluación asociada

**Ejemplo:**
```http
GET http://localhost:3001/api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2
```

**Respuesta (200):**
```json
{
  "id": "a8fe733a-49b3-41e2-b886-55b8b8e49ea2",
  "paciente_id": "1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc",
  "evaluacion_id": "9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
  "objetivo": "Reducir dolor cervical, recuperar movilidad completa y fortalecer musculatura cervical",
  "sesiones_plan": 10,
  "sesiones_completadas": 3,
  "progreso": "30%",
  "estado": "activo",
  "notas": "Paciente con buena adherencia. Iniciar con terapia manual y progresar a ejercicios de fortalecimiento.",
  "activo": true,
  "paciente_nombre": "Juan Pérez García",
  "evaluacion_fecha": "2025-12-04T09:00:00.000Z",
  "evaluacion_diagnostico": "Síndrome cervical por sedestación prolongada",
  "creado_en": "2025-12-04T05:00:00.000Z",
  "actualizado_en": "2025-12-04T05:30:00.000Z"
}
```

**Cálculo del progreso:**
```
Progreso = (sesiones_completadas / sesiones_plan) × 100
Ejemplo: (3 / 10) × 100 = 30%
```

---

## 📊 Ejemplo Completo del Flujo

### Escenario: Paciente nuevo con dolor lumbar

#### 1️⃣ Ver paciente
```http
GET /api/pacientes/1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc
```
Respuesta: Datos completos del paciente Juan Pérez

#### 2️⃣ Ver evaluaciones (vacío)
```http
GET /api/pacientes/1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc/evaluaciones
```
Respuesta: `[]` (sin evaluaciones previas)

#### 3️⃣ Crear evaluación
```http
POST /api/evaluaciones
Body: { paciente_id, fecha_evaluacion, motivo_consulta, diagnostico, ... }
```
Respuesta: Evaluación creada con ID `9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f`

#### 4️⃣ Crear plan de tratamiento
```http
POST /api/evaluaciones/9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f/planes
Body: { objetivo, sesiones_plan: 10, notas }
```
Respuesta: Plan creado con ID `a8fe733a-49b3-41e2-b886-55b8b8e49ea2`

#### 5️⃣ Generar 10 sesiones (Lunes, Miércoles, Viernes a las 15:00)
```http
POST /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/generar-sesiones
Body: {
  fecha_inicio: "2025-12-04",
  dias_semana: [1, 3, 5],
  hora: "15:00",
  profesional_id: "66b958e1-106a-4956-81a4-e578f8c03fb6"
}
```
Respuesta: 10 sesiones creadas programadas

#### 6️⃣ Ver sesiones generadas
```http
GET /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2/sesiones
```
Respuesta: Lista de 10 sesiones ordenadas por fecha

#### 7️⃣ Ver progreso del plan
```http
GET /api/planes/a8fe733a-49b3-41e2-b886-55b8b8e49ea2
```
Respuesta: Progreso `0/10 sesiones completadas (0%)`

---

## 🔍 Endpoints Adicionales Útiles

### Listar todos los planes de un paciente
```http
GET /api/planes?paciente_id=1b1e4d7a-c8bc-42d9-a1a9-f553c15a32cc
```

### Actualizar estado de una sesión (marcar como completada)
```http
PUT /api/sesiones/64b88775-24e1-4f4a-a7bd-3cca350bf457
Body: {
  "estado": "completada",
  "notas": "Sesión realizada con éxito. Paciente sin dolor."
}
```

### Crear un profesional (prerequisito)
```http
POST /api/profesionales
Body: {
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "especialidad": "Fisioterapeuta",
  "documento": "45678912",
  "telefono": "987654321",
  "email": "carlos.ramirez@fisiolab.com"
}
```

---

## ⚠️ Notas Importantes

### Estados de Sesión
- `programada`: Sesión agendada, aún no realizada
- `completada`: Sesión realizada exitosamente
- `cancelada`: Sesión cancelada por el paciente o profesional

### Estados de Plan
- `activo`: Plan en curso
- `completado`: Todas las sesiones completadas
- `cancelado`: Plan cancelado antes de completarse

### Validaciones
1. **Profesional debe existir** antes de generar sesiones
2. **No se pueden generar sesiones** si el plan ya está completo
3. **dias_semana** debe ser array con valores 0-6
4. **hora** debe estar en formato 24 horas (HH:MM)

### Recomendaciones
- Crear el profesional antes del primer plan de tratamiento
- Revisar evaluaciones previas antes de crear una nueva
- Actualizar `sesiones_completadas` al marcar sesiones como completadas
- Guardar notas detalladas en cada sesión para seguimiento

---

## 📱 Integración Frontend

### Componente: Detalle del Paciente
```javascript
// 1. Cargar paciente y evaluaciones
const paciente = await fetch(`/api/pacientes/${pacienteId}`).then(r => r.json());
const evaluaciones = await fetch(`/api/pacientes/${pacienteId}/evaluaciones`).then(r => r.json());

// 2. Mostrar botón "Nueva Evaluación" si está vacío o siempre visible
if (evaluaciones.length === 0) {
  showButton("Crear Primera Evaluación");
}
```

### Componente: Crear Plan desde Evaluación
```javascript
// Al seleccionar una evaluación, mostrar botón "Crear Plan de Tratamiento"
const crearPlan = async (evaluacionId) => {
  const response = await fetch(`/api/evaluaciones/${evaluacionId}/planes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objetivo: "Reducir dolor y mejorar movilidad",
      sesiones_plan: 10,
      notas: "Plan inicial"
    })
  });
  const plan = await response.json();
  return plan.id;
};
```

### Componente: Generar Sesiones
```javascript
// Formulario para generar sesiones
const generarSesiones = async (planId, formData) => {
  const response = await fetch(`/api/planes/${planId}/generar-sesiones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fecha_inicio: formData.fechaInicio,
      dias_semana: formData.diasSemana, // [1, 3, 5]
      hora: formData.hora, // "15:00"
      profesional_id: formData.profesionalId
    })
  });
  const { sesiones } = await response.json();
  alert(`${sesiones.length} sesiones creadas exitosamente`);
};
```

### Componente: Vista de Progreso
```javascript
// Card mostrando progreso del plan
const ProgressCard = ({ planId }) => {
  const [plan, setPlan] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  
  useEffect(() => {
    fetch(`/api/planes/${planId}`).then(r => r.json()).then(setPlan);
    fetch(`/api/planes/${planId}/sesiones`).then(r => r.json()).then(setSesiones);
  }, [planId]);
  
  const progreso = (plan.sesiones_completadas / plan.sesiones_plan) * 100;
  const completadas = sesiones.filter(s => s.estado === 'completada').length;
  
  return (
    <div>
      <h3>Progreso: {completadas}/{plan.sesiones_plan} sesiones</h3>
      <ProgressBar value={progreso} />
      <p>{progreso.toFixed(0)}% completado</p>
    </div>
  );
};
```

---

## 🎯 Resumen de Endpoints del Flujo

| Paso | Método | Endpoint | Propósito |
|------|--------|----------|-----------|
| 1 | GET | `/pacientes/{id}` | Ver detalle del paciente |
| 2 | GET | `/pacientes/{id}/evaluaciones` | Listar evaluaciones ordenadas |
| 2.1 | POST | `/evaluaciones` | Crear nueva evaluación |
| 3 | POST | `/evaluaciones/{id}/planes` | Crear plan desde evaluación |
| 4 | POST | `/planes/{id}/generar-sesiones` | Generar sesiones automáticamente |
| 5 | GET | `/planes/{id}/sesiones` | Ver sesiones del plan |
| 6 | GET | `/planes/{id}` | Ver progreso del plan |
| * | POST | `/profesionales` | Crear profesional (prerequisito) |
| * | PUT | `/sesiones/{id}` | Actualizar estado de sesión |

---

**Última actualización:** 4 de diciembre de 2025  
**Versión de la API:** 1.0.0  
**Documentación Swagger:** http://localhost:3001/api/docs
