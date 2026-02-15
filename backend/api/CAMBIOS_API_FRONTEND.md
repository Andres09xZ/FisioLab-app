# Cambios en API FisioLab - Diciembre 2025

## 📋 Resumen de Cambios

Se han realizado cambios importantes en la estructura de datos de **Pacientes** y **Evaluaciones Fisioterapéuticas**:

1. **Profesión y tipo de trabajo** ahora son parte de la historia clínica del paciente (no de cada evaluación)
2. **Escala EVA** agregada a las evaluaciones para medir el dolor (0-10)

---

## 🔄 Cambios en el Modelo de Pacientes

### Nuevos Campos Agregados

```typescript
interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  tipo_documento: string; // 'DNI', 'CE', 'PAS', 'RUC'
  documento?: string;
  celular?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string; // ISO date
  sexo?: 'M' | 'F' | 'O';
  edad?: number;
  emergencia_nombre?: string;
  emergencia_telefono?: string;
  antecedentes?: string[]; // Array de antecedentes médicos
  notas?: string;
  
  // ✨ NUEVOS CAMPOS
  profesion?: string;         // ej: "Enfermera", "Ingeniero", "Estudiante"
  tipo_trabajo?: string;      // ej: "Turnos rotativos", "Oficina", "Trabajo físico"
  
  activo: boolean;
}
```

### Endpoints Afectados

#### GET `/api/pacientes`
**Response actualizado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombres": "María",
      "apellidos": "González",
      "tipo_documento": "DNI",
      "documento": "12345678",
      "celular": "987654321",
      "email": "maria@example.com",
      "sexo": "F",
      "edad": 35,
      "emergencia_nombre": "Pedro González",
      "emergencia_telefono": "987654322",
      "antecedentes": ["Diabetes", "Hipertensión"],
      "notas": "Paciente con tratamiento previo",
      "profesion": "Enfermera",           // ✨ NUEVO
      "tipo_trabajo": "Turnos rotativos", // ✨ NUEVO
      "activo": true
    }
  ]
}
```

#### POST `/api/pacientes`
**Request actualizado:**
```json
{
  "nombres": "María",
  "apellidos": "González",
  "tipo_documento": "DNI",
  "documento": "12345678",
  "celular": "987654321",
  "email": "maria@example.com",
  "sexo": "F",
  "edad": 35,
  "antecedentes": ["Diabetes", "Hipertensión"],
  "notas": "Paciente con tratamiento previo",
  "profesion": "Enfermera",           // ✨ NUEVO (opcional)
  "tipo_trabajo": "Turnos rotativos"  // ✨ NUEVO (opcional)
}
```

#### GET `/api/pacientes/{id}` y PUT `/api/pacientes/{id}`
Ahora incluyen los campos `profesion` y `tipo_trabajo` en el response/request.

---

## 🔄 Cambios en el Modelo de Evaluaciones

### Campos Removidos ❌

Los siguientes campos ya **NO existen** en evaluaciones:
- ~~`profesion`~~ → Ahora en `pacientes`
- ~~`tipo_trabajo`~~ → Ahora en `pacientes`
- ~~`sedestacion_prolongada`~~ → Removido
- ~~`esfuerzo_fisico`~~ → Removido

### Nuevo Campo Agregado ✨

```typescript
interface EvaluacionFisioterapeutica {
  id: string;
  paciente_id: string;
  fecha_evaluacion: string; // ISO datetime
  
  // ✨ NUEVO: Escala Visual Analógica de dolor
  escala_eva?: number; // 0-10
  
  // Motivo de consulta
  motivo_consulta?: string;
  desde_cuando?: string;
  
  // Inspección
  asimetria?: string;
  atrofias_musculares?: string;
  inflamacion?: string;
  equimosis?: string;
  edema?: string;
  otros_hallazgos?: string;
  observaciones_inspeccion?: string;
  
  // Palpación y dolor
  contracturas?: string;
  irradiacion?: boolean;
  hacia_donde?: string;
  intensidad?: string;
  sensacion?: string;
  
  // Limitación de movilidad
  limitacion_izquierdo?: string;
  limitacion_derecho?: string;
  crujidos?: string;
  amplitud_movimientos?: string;
  
  // Diagnóstico
  diagnostico?: string;
  tratamientos_anteriores?: string;
  
  creado_en: string;
  actualizado_en: string;
}
```

### Escala EVA - Rangos y Significado

```typescript
type EscalaEVA = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Interpretación visual:
const escalaEVAInfo = {
  0: { rango: "0-1", nivel: "Sin dolor", emoji: "😊", color: "#10B981" },
  1: { rango: "0-1", nivel: "Sin dolor", emoji: "😊", color: "#10B981" },
  2: { rango: "2-3", nivel: "Poco dolor", emoji: "🙂", color: "#84CC16" },
  3: { rango: "2-3", nivel: "Poco dolor", emoji: "🙂", color: "#84CC16" },
  4: { rango: "4", nivel: "Dolor moderado", emoji: "😐", color: "#FACC15" },
  5: { rango: "5-6", nivel: "Dolor fuerte", emoji: "😟", color: "#F59E0B" },
  6: { rango: "5-6", nivel: "Dolor fuerte", emoji: "😟", color: "#F59E0B" },
  7: { rango: "7-8", nivel: "Dolor muy fuerte", emoji: "😰", color: "#EF4444" },
  8: { rango: "7-8", nivel: "Dolor muy fuerte", emoji: "😰", color: "#EF4444" },
  9: { rango: "9-10", nivel: "Dolor extremo", emoji: "😱", color: "#DC2626" },
  10: { rango: "9-10", nivel: "Dolor extremo", emoji: "😱", color: "#DC2626" }
};
```

### Endpoints Afectados

#### GET `/api/evaluaciones`
**Response actualizado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "paciente_id": "uuid",
      "fecha_evaluacion": "2025-12-15T10:30:00Z",
      "escala_eva": 5,                    // ✨ NUEVO
      "motivo_consulta": "Dolor lumbar crónico",
      "desde_cuando": "3 meses",
      "diagnostico": "Lumbalgia mecánica",
      "nombres": "María",
      "apellidos": "González",
      "documento": "12345678"
    }
  ]
}
```

#### POST `/api/evaluaciones`
**Request actualizado:**
```json
{
  "paciente_id": "uuid",
  "fecha_evaluacion": "2025-12-15T10:30:00Z", // opcional, default NOW()
  "escala_eva": 5,                             // ✨ NUEVO (0-10, opcional)
  "especialidad": "Traumatologia",            // ✨ NUEVO (opcional)
  "motivo_consulta": "Dolor lumbar crónico",
  "desde_cuando": "3 meses",
  "asimetria": "Leve escoliosis",
  "diagnostico": "Lumbalgia mecánica",
  "tratamientos_anteriores": "Fisioterapia hace 1 año"
  // ❌ NO incluir: profesion, tipo_trabajo, sedestacion_prolongada, esfuerzo_fisico
}
```

**Validación:**
- `escala_eva` debe ser un número entero entre 0 y 10
- Si se envía un valor fuera de rango, retornará error 400:
```json
{
  "success": false,
  "message": "escala_eva debe ser un número entre 0 y 10"
}
```

**Especialidades válidas:**
- `Traumatologia`
- `Neurologia`
- `Deportologia`
- `Pediatria`
- `Geriatria`

Si se envía una especialidad no válida, retornará error 400:
```json
{
  "success": false,
  "message": "especialidad debe ser una de: Traumatologia, Neurologia, Deportologia, Pediatria, Geriatria"
}
```

#### PUT `/api/evaluaciones/{id}`
Mismo formato que POST (parcial update).

---

## 🎨 Sugerencias de UI/UX para Frontend

### 1. Formulario de Pacientes

Agregar campos en la sección de "Datos Ocupacionales" o "Historia Clínica":

```jsx
// Ejemplo React
<div className="section-ocupacional">
  <h3>Datos Ocupacionales</h3>
  
  <Input
    label="Profesión u Ocupación"
    name="profesion"
    placeholder="Ej: Enfermera, Ingeniero, Estudiante"
    value={paciente.profesion}
    onChange={handleChange}
  />
  
  <Input
    label="Tipo de Trabajo"
    name="tipo_trabajo"
    placeholder="Ej: Turnos rotativos, Oficina, Trabajo físico"
    value={paciente.tipo_trabajo}
    onChange={handleChange}
  />
</div>
```

### 2. Formulario de Evaluaciones

**Remover campos:**
- ❌ Profesión
- ❌ Tipo de trabajo
- ❌ Sedestación prolongada
- ❌ Esfuerzo físico

**Agregar componente de Escala EVA:**

```jsx
// Ejemplo de componente visual para Escala EVA
<div className="escala-eva-input">
  <label>Escala de Dolor (EVA)</label>
  <p className="text-sm text-gray-600">
    Indica el nivel de dolor del paciente (0 = sin dolor, 10 = dolor extremo)
  </p>
  
  <div className="eva-scale">
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(valor => (
      <button
        key={valor}
        type="button"
        className={`eva-button ${escalaEva === valor ? 'selected' : ''}`}
        onClick={() => setEscalaEva(valor)}
        style={{ backgroundColor: getColorEVA(valor) }}
      >
        {valor}
      </button>
    ))}
  </div>
  
  {escalaEva !== null && (
    <div className="eva-feedback">
      <span className="emoji">{getEmojiEVA(escalaEva)}</span>
      <span className="text">{getNivelEVA(escalaEva)}</span>
    </div>
  )}
</div>
```

### 3. Visualización de Evaluaciones

Mostrar la escala EVA con indicador visual:

```jsx
// Componente de badge para mostrar EVA
function EVABadge({ valor }) {
  const info = getEVAInfo(valor);
  
  return (
    <div className="eva-badge" style={{ backgroundColor: info.color }}>
      <span className="emoji">{info.emoji}</span>
      <span className="valor">{valor}/10</span>
      <span className="nivel">{info.nivel}</span>
    </div>
  );
}

// Uso en tabla de evaluaciones
<TableRow>
  <TableCell>{evaluacion.fecha_evaluacion}</TableCell>
  <TableCell>
    {evaluacion.escala_eva !== null ? (
      <EVABadge valor={evaluacion.escala_eva} />
    ) : (
      <span className="text-gray-400">No registrada</span>
    )}
  </TableCell>
  <TableCell>{evaluacion.diagnostico}</TableCell>
</TableRow>
```

---

## 📝 Tareas para Frontend

### Alta Prioridad ⚡

- [ ] **Actualizar TypeScript interfaces** para `Paciente` y `EvaluacionFisioterapeutica`
- [ ] **Modificar formulario de pacientes**: agregar campos `profesion` y `tipo_trabajo`
- [ ] **Modificar formulario de evaluaciones**:
  - [ ] Remover: `profesion`, `tipo_trabajo`, `sedestacion_prolongada`, `esfuerzo_fisico`
  - [ ] Agregar: componente de `escala_eva` (selector 0-10)
- [ ] **Actualizar validaciones de formularios**
- [ ] **Revisar llamadas API** que usen los campos removidos

### Media Prioridad 📊

- [ ] **Crear componente visual para Escala EVA** (recomendado)
- [ ] **Actualizar tablas/listas** que muestren evaluaciones (mostrar EVA)
- [ ] **Agregar filtros** por rango de dolor EVA (opcional)
- [ ] **Mostrar profesión/tipo_trabajo** en la ficha del paciente

### Baja Prioridad 🎨

- [ ] **Dashboard**: agregar gráficas de distribución de dolor (EVA)
- [ ] **Reportes**: incluir estadísticas de EVA promedio por paciente
- [ ] **Exportar datos**: incluir nuevos campos en exports CSV/PDF

---

## 🧪 Endpoints para Testing

### Base URL
```
http://localhost:3001/api
```

### Ejemplos de Prueba

#### 1. Crear paciente con profesión
```bash
curl -X POST http://localhost:3001/api/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "tipo_documento": "DNI",
    "documento": "87654321",
    "profesion": "Ingeniero Civil",
    "tipo_trabajo": "Oficina - 8 horas diarias"
  }'
```

#### 2. Crear evaluación con escala EVA
```bash
curl -X POST http://localhost:3001/api/evaluaciones \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "uuid-del-paciente",
    "escala_eva": 7,
    "motivo_consulta": "Dolor de espalda",
    "desde_cuando": "2 semanas",
    "diagnostico": "Contractura muscular"
  }'
```

#### 3. Validar error de EVA fuera de rango
```bash
curl -X POST http://localhost:3001/api/evaluaciones \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "uuid-del-paciente",
    "escala_eva": 15
  }'
# Esperado: { "success": false, "message": "escala_eva debe ser un número entre 0 y 10" }
```

---

## 🔗 Recursos Adicionales

- **Documentación Swagger**: http://localhost:3001/api/docs
- **API Routes completas**: Ver archivo `API_ROUTES.md` en el repositorio

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa con las evaluaciones antiguas que tienen profesión?
Las columnas se eliminarán de la base de datos. Si necesitas migrar datos existentes, consulta con el equipo de backend.

### ¿La escala EVA es obligatoria?
No, es opcional. Puede ser `null` o no enviarse en el request.

### ¿Puedo enviar escala EVA como decimal (ej: 5.5)?
No, solo se aceptan números enteros del 0 al 10.

### ¿Debo mostrar profesión en el listado de evaluaciones?
No, ahora la profesión es del paciente. Si necesitas mostrarla en una evaluación, haz JOIN con los datos del paciente o muéstrala desde el contexto del paciente seleccionado.

---

## 📞 Contacto

Si tienes dudas sobre estos cambios, contacta al equipo de backend.

**Última actualización:** 15 de diciembre de 2025
