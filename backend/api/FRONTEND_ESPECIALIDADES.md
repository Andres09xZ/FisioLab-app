# 🏥 Guía de Integración Frontend - Sistema de Especialidades

## 📋 Resumen de Cambios

Se ha implementado un sistema de especialidades para clasificar evaluaciones fisioterapéuticas y planes de tratamiento. Este documento contiene toda la información necesaria para actualizar el frontend.

---

## 🎯 Especialidades Disponibles

El sistema soporta **5 especialidades de fisioterapia**:

| Valor | Descripción | Uso |
|-------|-------------|-----|
| `Traumatologia` | Lesiones musculoesqueléticas, fracturas, esguinces | Lesiones deportivas, accidentes, dolor lumbar |
| `Neurologia` | Rehabilitación neurológica | ACV, parálisis, lesiones medulares |
| `Deportologia` | Medicina deportiva y rehabilitación atlética | Atletas, lesiones deportivas, retorno al deporte |
| `Pediatria` | Fisioterapia infantil | Niños, desarrollo motor, parálisis cerebral |
| `Geriatria` | Cuidado del adulto mayor | Prevención de caídas, movilidad en tercera edad |

⚠️ **IMPORTANTE:** Los valores son **case-sensitive** y deben escribirse exactamente como se muestran (sin tildes).

---

## 🔧 Cambios en la API

### Nuevos Campos en Respuestas

#### Evaluaciones
```typescript
interface Evaluacion {
  id: number;
  paciente_id: number;
  especialidad: string | null; // ⭐ NUEVO CAMPO
  motivo_consulta: string;
  diagnostico: string;
  observaciones: string | null;
  escala_eva: number;
  fecha_evaluacion: string;
  creado_en: string;
  actualizado_en: string;
}
```

#### Planes de Tratamiento
```typescript
interface PlanTratamiento {
  id: number;
  paciente_id: number;
  evaluacion_id: number | null;
  especialidad: string | null; // ⭐ NUEVO CAMPO
  objetivo: string;
  sesiones_plan: number;
  sesiones_completadas: number;
  estado: 'activo' | 'finalizado' | 'cancelado';
  notas: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  // Cuando se incluye evaluación anidada:
  evaluacion?: {
    id: number;
    especialidad: string | null; // ⭐ TAMBIÉN INCLUYE ESPECIALIDAD
    diagnostico: string;
    // ... otros campos
  };
}
```

---

## 📝 Endpoints Modificados

### 1. EVALUACIONES

#### Crear Evaluación
**`POST /api/pacientes/:id/evaluaciones`**

**Body actualizado:**
```json
{
  "motivo_consulta": "Dolor lumbar crónico",
  "diagnostico": "Lumbalgia mecánica",
  "observaciones": "Paciente con dolor de 3 meses",
  "escala_eva": 7,
  "fecha_evaluacion": "2026-01-04",
  "especialidad": "Traumatologia"  // ⭐ NUEVO - OPCIONAL
}
```

#### Actualizar Evaluación
**`PUT /api/evaluaciones/:id`**

**Body actualizado:**
```json
{
  "observaciones": "Mejoría significativa",
  "escala_eva": 4,
  "especialidad": "Deportologia"  // ⭐ NUEVO - OPCIONAL
}
```

#### Listar Evaluaciones
**`GET /api/pacientes/:id/evaluaciones`**

**Respuesta actualizada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paciente_id": 123,
      "especialidad": "Traumatologia",  // ⭐ NUEVO CAMPO
      "motivo_consulta": "Dolor lumbar crónico",
      "diagnostico": "Lumbalgia mecánica",
      "observaciones": "Paciente con dolor de 3 meses",
      "escala_eva": 7,
      "fecha_evaluacion": "2026-01-04T00:00:00.000Z",
      "creado_en": "2026-01-04T10:30:00.000Z",
      "actualizado_en": "2026-01-04T10:30:00.000Z"
    }
  ]
}
```

---

### 2. PLANES DE TRATAMIENTO

#### Crear Plan
**`POST /api/pacientes/:id/planes`**

**Body actualizado:**
```json
{
  "evaluacion_id": 5,
  "especialidad": "Neurologia",  // ⭐ NUEVO - OPCIONAL
  "objetivo": "Recuperar movilidad después de ACV",
  "sesiones_plan": 20,
  "notas": "Requiere ejercicios de rehabilitación neurológica"
}
```

#### Crear Plan desde Evaluación
**`POST /api/evaluaciones/:id/plan`**

**Body actualizado:**
```json
{
  "objetivo": "Mejorar rango de movimiento",
  "sesiones_plan": 15,
  "especialidad": "Pediatria",  // ⭐ NUEVO - OPCIONAL
  "notas": "Plan inicial de 15 sesiones"
}
```

⚠️ **NOTA:** Si no se especifica `especialidad`, el plan **heredará automáticamente** la especialidad de la evaluación asociada.

#### Actualizar Plan
**`PUT /api/planes/:id`**

**Body actualizado:**
```json
{
  "especialidad": "Geriatria",  // ⭐ NUEVO - OPCIONAL
  "objetivo": "Mejorar equilibrio y prevenir caídas",
  "sesiones_plan": 12
}
```

#### Listar Planes
**`GET /api/pacientes/:id/planes`**

**Respuesta actualizada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paciente_id": 123,
      "evaluacion_id": 5,
      "especialidad": "Neurologia",  // ⭐ NUEVO CAMPO
      "objetivo": "Recuperar movilidad después de ACV",
      "sesiones_plan": 20,
      "sesiones_completadas": 5,
      "estado": "activo",
      "notas": "Requiere ejercicios de rehabilitación neurológica",
      "activo": true,
      "creado_en": "2026-01-04T10:30:00.000Z",
      "actualizado_en": "2026-01-04T10:30:00.000Z",
      "evaluacion": {
        "id": 5,
        "especialidad": "Neurologia",  // ⭐ TAMBIÉN EN EVALUACIÓN ANIDADA
        "diagnostico": "Hemiparesia post-ACV",
        "motivo_consulta": "Pérdida de movilidad lado derecho",
        "fecha_evaluacion": "2026-01-03T00:00:00.000Z",
        "escala_eva": 8
      },
      "progreso_porcentaje": 25,
      "total_sesiones": 5
    }
  ]
}
```

---

## 🎨 Implementación en Frontend

### 1. Constantes de Especialidades

```typescript
// constants/especialidades.ts
export const ESPECIALIDADES = [
  { value: 'Traumatologia', label: 'Traumatología', icon: '🦴', color: '#FF6B6B' },
  { value: 'Neurologia', label: 'Neurología', icon: '🧠', color: '#4ECDC4' },
  { value: 'Deportologia', label: 'Deportología', icon: '⚽', color: '#45B7D1' },
  { value: 'Pediatria', label: 'Pediatría', icon: '👶', color: '#FFA07A' },
  { value: 'Geriatria', label: 'Geriatría', icon: '👴', color: '#98D8C8' }
] as const;

export type EspecialidadValue = typeof ESPECIALIDADES[number]['value'];
```

### 2. Componente Select de Especialidad (React)

```tsx
// components/EspecialidadSelect.tsx
import React from 'react';
import { ESPECIALIDADES } from '../constants/especialidades';

interface EspecialidadSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export const EspecialidadSelect: React.FC<EspecialidadSelectProps> = ({
  value,
  onChange,
  required = false,
  disabled = false
}) => {
  return (
    <div className="form-group">
      <label htmlFor="especialidad">
        Especialidad {!required && <span className="text-muted">(Opcional)</span>}
      </label>
      <select
        id="especialidad"
        className="form-control"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        required={required}
        disabled={disabled}
      >
        <option value="">Sin especialidad</option>
        {ESPECIALIDADES.map((esp) => (
          <option key={esp.value} value={esp.value}>
            {esp.icon} {esp.label}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### 3. Badge de Especialidad

```tsx
// components/EspecialidadBadge.tsx
import React from 'react';
import { ESPECIALIDADES } from '../constants/especialidades';

interface EspecialidadBadgeProps {
  especialidad: string | null;
}

export const EspecialidadBadge: React.FC<EspecialidadBadgeProps> = ({ especialidad }) => {
  if (!especialidad) {
    return <span className="badge badge-secondary">Sin especialidad</span>;
  }

  const esp = ESPECIALIDADES.find(e => e.value === especialidad);
  
  if (!esp) {
    return <span className="badge badge-secondary">{especialidad}</span>;
  }

  return (
    <span 
      className="badge" 
      style={{ backgroundColor: esp.color, color: '#fff' }}
    >
      {esp.icon} {esp.label}
    </span>
  );
};
```

### 4. Tipos TypeScript Actualizados

```typescript
// types/api.ts
export interface Evaluacion {
  id: number;
  paciente_id: number;
  especialidad: string | null; // ⭐ NUEVO
  motivo_consulta: string;
  diagnostico: string;
  observaciones: string | null;
  escala_eva: number;
  fecha_evaluacion: string;
  creado_en: string;
  actualizado_en: string;
}

export interface PlanTratamiento {
  id: number;
  paciente_id: number;
  evaluacion_id: number | null;
  especialidad: string | null; // ⭐ NUEVO
  objetivo: string;
  sesiones_plan: number;
  sesiones_completadas: number;
  estado: 'activo' | 'finalizado' | 'cancelado';
  notas: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  evaluacion?: {
    id: number;
    especialidad: string | null; // ⭐ NUEVO
    diagnostico: string;
    motivo_consulta: string;
    fecha_evaluacion: string;
    escala_eva: number;
  };
  progreso_porcentaje?: number;
  total_sesiones?: number;
}

export interface CreateEvaluacionDTO {
  motivo_consulta: string;
  diagnostico: string;
  observaciones?: string | null;
  escala_eva: number;
  fecha_evaluacion: string;
  especialidad?: string | null; // ⭐ NUEVO
}

export interface UpdateEvaluacionDTO {
  motivo_consulta?: string;
  diagnostico?: string;
  observaciones?: string | null;
  escala_eva?: number;
  fecha_evaluacion?: string;
  especialidad?: string | null; // ⭐ NUEVO
}

export interface CreatePlanDTO {
  evaluacion_id?: number | null;
  especialidad?: string | null; // ⭐ NUEVO
  objetivo: string;
  sesiones_plan: number;
  notas?: string | null;
}

export interface UpdatePlanDTO {
  objetivo?: string;
  sesiones_plan?: number;
  notas?: string | null;
  activo?: boolean;
  estado?: 'activo' | 'finalizado' | 'cancelado';
  evaluacion_id?: number | null;
  especialidad?: string | null; // ⭐ NUEVO
}
```

### 5. Ejemplo de Formulario de Evaluación

```tsx
// components/EvaluacionForm.tsx
import React, { useState } from 'react';
import { EspecialidadSelect } from './EspecialidadSelect';
import { CreateEvaluacionDTO } from '../types/api';

export const EvaluacionForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateEvaluacionDTO>({
    motivo_consulta: '',
    diagnostico: '',
    observaciones: '',
    escala_eva: 0,
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    especialidad: null // ⭐ NUEVO CAMPO
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/pacientes/${pacienteId}/evaluaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Evaluación creada:', result.data);
        // Manejar éxito
      }
    } catch (error) {
      console.error('Error al crear evaluación:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Otros campos del formulario */}
      
      <EspecialidadSelect
        value={formData.especialidad}
        onChange={(value) => setFormData({ ...formData, especialidad: value })}
      />
      
      <button type="submit" className="btn btn-primary">
        Crear Evaluación
      </button>
    </form>
  );
};
```

### 6. Ejemplo de Formulario de Plan

```tsx
// components/PlanForm.tsx
import React, { useState } from 'react';
import { EspecialidadSelect } from './EspecialidadSelect';
import { CreatePlanDTO } from '../types/api';

export const PlanForm: React.FC = () => {
  const [formData, setFormData] = useState<CreatePlanDTO>({
    evaluacion_id: null,
    especialidad: null, // ⭐ NUEVO CAMPO
    objetivo: '',
    sesiones_plan: 10,
    notas: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/pacientes/${pacienteId}/planes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Plan creado:', result.data);
        // Manejar éxito
      }
    } catch (error) {
      console.error('Error al crear plan:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Otros campos del formulario */}
      
      <EspecialidadSelect
        value={formData.especialidad}
        onChange={(value) => setFormData({ ...formData, especialidad: value })}
      />
      
      <div className="alert alert-info">
        💡 Si no seleccionas especialidad y el plan está asociado a una evaluación, 
        se heredará automáticamente la especialidad de la evaluación.
      </div>
      
      <button type="submit" className="btn btn-primary">
        Crear Plan
      </button>
    </form>
  );
};
```

### 7. Mostrar Especialidad en Listas

```tsx
// components/EvaluacionList.tsx
import React from 'react';
import { EspecialidadBadge } from './EspecialidadBadge';
import { Evaluacion } from '../types/api';

interface EvaluacionListProps {
  evaluaciones: Evaluacion[];
}

export const EvaluacionList: React.FC<EvaluacionListProps> = ({ evaluaciones }) => {
  return (
    <div className="evaluaciones-list">
      {evaluaciones.map((evaluacion) => (
        <div key={evaluacion.id} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>{evaluacion.diagnostico}</h5>
            <EspecialidadBadge especialidad={evaluacion.especialidad} />
          </div>
          <div className="card-body">
            <p><strong>Motivo:</strong> {evaluacion.motivo_consulta}</p>
            <p><strong>Escala EVA:</strong> {evaluacion.escala_eva}/10</p>
            <p><strong>Fecha:</strong> {new Date(evaluacion.fecha_evaluacion).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🚨 Validaciones y Manejo de Errores

### Error: Especialidad Inválida (400)

```json
{
  "success": false,
  "message": "especialidad debe ser una de: Traumatologia, Neurologia, Deportologia, Pediatria, Geriatria"
}
```

**Manejo en Frontend:**
```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 400 && error.response?.data?.message?.includes('especialidad')) {
    alert('⚠️ La especialidad seleccionada no es válida. Por favor, selecciona una de las opciones disponibles.');
  }
};
```

### Validación en Cliente

```typescript
const validarEspecialidad = (especialidad: string | null): boolean => {
  if (!especialidad) return true; // Es opcional
  
  const especialidadesValidas = ['Traumatologia', 'Neurologia', 'Deportologia', 'Pediatria', 'Geriatria'];
  return especialidadesValidas.includes(especialidad);
};
```

---

## 📊 Filtros y Búsquedas

### Filtrar por Especialidad

```tsx
// components/EvaluacionesFilter.tsx
const [filtroEspecialidad, setFiltroEspecialidad] = useState<string | null>(null);

const evaluacionesFiltradas = evaluaciones.filter(ev => 
  !filtroEspecialidad || ev.especialidad === filtroEspecialidad
);

return (
  <div>
    <EspecialidadSelect
      value={filtroEspecialidad}
      onChange={setFiltroEspecialidad}
    />
    <EvaluacionList evaluaciones={evaluacionesFiltradas} />
  </div>
);
```

### Agrupar por Especialidad

```typescript
const agruparPorEspecialidad = (planes: PlanTratamiento[]) => {
  return planes.reduce((acc, plan) => {
    const esp = plan.especialidad || 'Sin especialidad';
    if (!acc[esp]) acc[esp] = [];
    acc[esp].push(plan);
    return acc;
  }, {} as Record<string, PlanTratamiento[]>);
};
```

---

## 📈 Estadísticas y Dashboard

### Contador por Especialidad

```typescript
const contarPorEspecialidad = (items: (Evaluacion | PlanTratamiento)[]) => {
  return ESPECIALIDADES.map(esp => ({
    ...esp,
    count: items.filter(item => item.especialidad === esp.value).length
  }));
};

// Resultado:
// [
//   { value: 'Traumatologia', label: 'Traumatología', icon: '🦴', color: '#FF6B6B', count: 15 },
//   { value: 'Neurologia', label: 'Neurología', icon: '🧠', color: '#4ECDC4', count: 8 },
//   ...
// ]
```

### Gráfico de Especialidades

```tsx
// Ejemplo con Chart.js o cualquier librería de gráficos
const especialidadesData = {
  labels: ESPECIALIDADES.map(e => e.label),
  datasets: [{
    data: ESPECIALIDADES.map(esp => 
      planes.filter(p => p.especialidad === esp.value).length
    ),
    backgroundColor: ESPECIALIDADES.map(e => e.color)
  }]
};
```

---

## ✅ Checklist de Implementación

### Frontend

- [ ] Agregar constantes de especialidades
- [ ] Crear componente `EspecialidadSelect`
- [ ] Crear componente `EspecialidadBadge`
- [ ] Actualizar tipos TypeScript
- [ ] Actualizar formulario de evaluaciones (agregar campo especialidad)
- [ ] Actualizar formulario de planes (agregar campo especialidad)
- [ ] Actualizar listado de evaluaciones (mostrar badge)
- [ ] Actualizar listado de planes (mostrar badge)
- [ ] Agregar filtros por especialidad
- [ ] Actualizar estadísticas/dashboard (agregar contadores por especialidad)
- [ ] Agregar validación de especialidad en cliente
- [ ] Probar flujo completo (crear/editar/listar)

### Testing

- [ ] Crear evaluación sin especialidad (null) ✅
- [ ] Crear evaluación con especialidad válida ✅
- [ ] Intentar crear con especialidad inválida (debe fallar) ✅
- [ ] Actualizar especialidad de evaluación existente ✅
- [ ] Crear plan sin especialidad (null) ✅
- [ ] Crear plan con especialidad válida ✅
- [ ] Crear plan desde evaluación (debe heredar especialidad) ✅
- [ ] Actualizar especialidad de plan existente ✅
- [ ] Verificar que especialidad aparece en listados ✅
- [ ] Filtrar por especialidad ✅

---

## 🔍 Notas Importantes

1. **Campo Opcional:** La especialidad es completamente opcional. Los formularios deben permitir `null`.

2. **Case-Sensitive:** Los valores deben enviarse exactamente como: `Traumatologia`, `Neurologia`, etc. (sin tildes, primera letra mayúscula).

3. **Herencia:** Al crear un plan desde una evaluación sin especificar especialidad, se hereda automáticamente.

4. **Retrocompatibilidad:** Los registros existentes tendrán `especialidad: null`. El frontend debe manejar esto correctamente.

5. **Validación Backend:** La validación se hace en el backend, pero agregar validación en frontend mejora la UX.

6. **Colores y Íconos:** Los colores e íconos sugeridos son solo ejemplos. Ajústalos según el diseño de tu aplicación.

---

## 📞 Contacto y Soporte

Si tienes dudas durante la implementación:
- Consulta `NUEVAS_RUTAS_README.md` para detalles técnicos completos
- Revisa `PRUEBAS_ESPECIALIDADES.md` para ejemplos de requests/responses
- Usa las constantes proporcionadas para mantener consistencia

---

**Fecha de actualización:** 4 de Enero de 2026  
**Versión de API:** 1.1.0  
**Cambios:** Sistema de especialidades implementado
