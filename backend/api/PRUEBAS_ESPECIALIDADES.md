# Pruebas de Especialidades - API FisioLab

## Especialidades Disponibles
- `Traumatologia`
- `Neurologia`
- `Deportologia`
- `Pediatria`
- `Geriatria`

---

## 1. EVALUACIONES CON ESPECIALIDAD

### 1.1. Crear Evaluación con Especialidad (POST)
```bash
POST http://localhost:3001/api/pacientes/:paciente_id/evaluaciones
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "motivo_consulta": "Dolor lumbar crónico",
  "diagnostico": "Lumbalgia mecánica",
  "observaciones": "Paciente con dolor de 3 meses de evolución",
  "escala_eva": 7,
  "fecha_evaluacion": "2026-01-04",
  "especialidad": "Traumatologia"
}
```

### 1.2. Actualizar Evaluación - Cambiar Especialidad (PUT)
```bash
PUT http://localhost:3001/api/evaluaciones/:evaluacion_id
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "observaciones": "Actualización: dolor ha disminuido",
  "escala_eva": 5,
  "especialidad": "Deportologia"
}
```

### 1.3. Listar Evaluaciones de un Paciente (GET)
```bash
GET http://localhost:3001/api/pacientes/:paciente_id/evaluaciones
Authorization: Bearer <tu_token>
```
**Respuesta incluirá:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paciente_id": 123,
      "especialidad": "Traumatologia",
      "motivo_consulta": "Dolor lumbar crónico",
      "diagnostico": "Lumbalgia mecánica",
      ...
    }
  ]
}
```

---

## 2. PLANES DE TRATAMIENTO CON ESPECIALIDAD

### 2.1. Crear Plan con Especialidad (POST)
```bash
POST http://localhost:3001/api/pacientes/:paciente_id/planes
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "evaluacion_id": 5,
  "especialidad": "Neurologia",
  "objetivo": "Recuperar movilidad después de ACV",
  "sesiones_plan": 20,
  "notas": "Paciente requiere ejercicios de rehabilitación neurológica"
}
```

### 2.2. Crear Plan desde Evaluación (Hereda Especialidad)
```bash
POST http://localhost:3001/api/evaluaciones/:evaluacion_id/plan
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "objetivo": "Mejorar rango de movimiento",
  "sesiones_plan": 15,
  "notas": "Plan inicial de 15 sesiones"
}
```
**Nota:** Si no se especifica `especialidad`, se hereda de la evaluación asociada.

### 2.3. Actualizar Plan - Cambiar Especialidad (PUT)
```bash
PUT http://localhost:3001/api/planes/:plan_id
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "especialidad": "Pediatria",
  "objetivo": "Mejorar coordinación motora en niño",
  "sesiones_plan": 12
}
```

### 2.4. Listar Planes de un Paciente (GET)
```bash
GET http://localhost:3001/api/pacientes/:paciente_id/planes
Authorization: Bearer <tu_token>
```
**Respuesta incluirá:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paciente_id": 123,
      "especialidad": "Neurologia",
      "objetivo": "Recuperar movilidad después de ACV",
      "sesiones_plan": 20,
      "evaluacion": {
        "id": 5,
        "especialidad": "Neurologia",
        "diagnostico": "Hemiparesia post-ACV",
        ...
      }
    }
  ]
}
```

---

## 3. VALIDACIONES

### 3.1. Especialidad Inválida (Error 400)
```bash
POST http://localhost:3001/api/pacientes/1/evaluaciones
Content-Type: application/json
Authorization: Bearer <tu_token>

{
  "motivo_consulta": "Dolor",
  "diagnostico": "Test",
  "especialidad": "Cardiologia"
}
```
**Respuesta:**
```json
{
  "success": false,
  "message": "especialidad debe ser una de: Traumatologia, Neurologia, Deportologia, Pediatria, Geriatria"
}
```

### 3.2. Especialidad Case-Sensitive
⚠️ **Importante:** Las especialidades son sensibles a mayúsculas/minúsculas.
- ✅ Correcto: `"Traumatologia"`
- ❌ Incorrecto: `"traumatologia"`, `"TRAUMATOLOGIA"`, `"Traumatología"` (con tilde)

---

## 4. EJEMPLOS CURL COMPLETOS

### Crear Evaluación con Especialidad
```bash
curl -X POST http://localhost:3001/api/pacientes/1/evaluaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "motivo_consulta": "Lesión deportiva en rodilla",
    "diagnostico": "Esguince de ligamento cruzado anterior",
    "observaciones": "Paciente atleta, requiere rehabilitación intensiva",
    "escala_eva": 6,
    "fecha_evaluacion": "2026-01-04",
    "especialidad": "Deportologia"
  }'
```

### Crear Plan con Especialidad
```bash
curl -X POST http://localhost:3001/api/pacientes/1/planes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "evaluacion_id": 2,
    "especialidad": "Geriatria",
    "objetivo": "Mejorar equilibrio y prevenir caídas",
    "sesiones_plan": 10,
    "notas": "Paciente de 75 años con historial de caídas"
  }'
```

### Actualizar Especialidad de un Plan
```bash
curl -X PUT http://localhost:3001/api/planes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "especialidad": "Pediatria"
  }'
```

---

## 5. CASOS DE USO COMUNES

### Caso 1: Paciente con Lesión Deportiva
1. Crear evaluación con especialidad "Deportologia"
2. Crear plan desde la evaluación (hereda "Deportologia")
3. Programar sesiones específicas para rehabilitación deportiva

### Caso 2: Paciente Pediátrico
1. Crear evaluación con especialidad "Pediatria"
2. Crear plan con enfoque en desarrollo motor infantil
3. Ajustar número de sesiones según progreso del niño

### Caso 3: Paciente Neurológico
1. Crear evaluación con especialidad "Neurologia"
2. Crear plan de rehabilitación post-ACV o lesión neurológica
3. Monitorear progreso con escalas específicas

### Caso 4: Paciente Geriátrico
1. Crear evaluación con especialidad "Geriatria"
2. Crear plan enfocado en prevención de caídas y mantenimiento funcional
3. Adaptar ejercicios a limitaciones de edad

### Caso 5: Cambio de Especialidad durante Tratamiento
1. Paciente inicia con "Traumatologia" por lesión aguda
2. Después de recuperación, cambiar a "Deportologia" para retorno al deporte
3. Actualizar plan con PUT incluyendo nueva especialidad

---

## 6. NOTAS IMPORTANTES

- ✅ El campo `especialidad` es **opcional** en todos los endpoints
- ✅ Si no se especifica especialidad, el valor será `NULL` en la base de datos
- ✅ Al crear plan desde evaluación, se hereda la especialidad si no se especifica
- ✅ Las especialidades son validadas en el backend antes de guardar
- ✅ El enum en PostgreSQL garantiza integridad de datos
- ⚠️ Las especialidades deben escribirse exactamente como se muestran (case-sensitive)
- ⚠️ No usar tildes: "Traumatologia" (no "Traumatología")

---

## 7. ENDPOINTS AFECTADOS

### Evaluaciones
- `POST /api/pacientes/:id/evaluaciones` - Acepta `especialidad`
- `PUT /api/evaluaciones/:id` - Acepta `especialidad`
- `GET /api/pacientes/:id/evaluaciones` - Devuelve `especialidad`

### Planes de Tratamiento
- `POST /api/pacientes/:id/planes` - Acepta `especialidad`
- `POST /api/evaluaciones/:id/plan` - Acepta `especialidad` (o hereda de evaluación)
- `PUT /api/planes/:id` - Acepta `especialidad`
- `GET /api/pacientes/:id/planes` - Devuelve `especialidad` en plan y evaluación

---

## 8. TESTING CON POSTMAN/THUNDER CLIENT

### Colección de Pruebas Sugerida:

1. **Auth** - Obtener token JWT
2. **Evaluaciones - Crear con cada especialidad** (5 requests)
3. **Evaluaciones - Actualizar especialidad** (1 request)
4. **Planes - Crear con especialidad** (1 request)
5. **Planes - Crear heredando de evaluación** (1 request)
6. **Planes - Actualizar especialidad** (1 request)
7. **Validaciones - Especialidad inválida** (2 requests - evaluación y plan)

### Variables de Entorno Recomendadas:
```
baseUrl: http://localhost:3001/api
token: <tu_token_jwt>
paciente_id: <id_paciente_prueba>
evaluacion_id: <id_evaluacion_prueba>
plan_id: <id_plan_prueba>
```
