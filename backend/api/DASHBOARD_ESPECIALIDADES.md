# 📊 API Dashboard - Estadísticas por Especialidad

## 🎯 Nuevas Rutas de Dashboard

Se han agregado **4 nuevos endpoints** para obtener estadísticas detalladas de evaluaciones y planes de tratamiento agrupados por especialidad.

---

## 📋 Endpoints Disponibles

### 1. Evaluaciones por Especialidad

**`GET /api/dashboard/especialidades/evaluaciones`**

Obtiene estadísticas de evaluaciones agrupadas por especialidad con la lista de pacientes asociados.

#### Query Parameters (Opcionales)
```
fecha_inicio: string (YYYY-MM-DD) - Filtrar desde esta fecha
fecha_fin: string (YYYY-MM-DD) - Filtrar hasta esta fecha
```

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "por_especialidad": [
      {
        "especialidad": "Traumatologia",
        "total_evaluaciones": 15,
        "total_pacientes": 12,
        "pacientes": [
          {
            "paciente_id": 1,
            "paciente_nombre": "Juan Pérez",
            "paciente_documento": "12345678"
          },
          {
            "paciente_id": 2,
            "paciente_nombre": "María González",
            "paciente_documento": "87654321"
          }
        ],
        "promedio_eva": 6.3,
        "primera_evaluacion": "2025-01-15",
        "ultima_evaluacion": "2026-01-03"
      },
      {
        "especialidad": "Neurologia",
        "total_evaluaciones": 8,
        "total_pacientes": 7,
        "pacientes": [...],
        "promedio_eva": 7.2,
        "primera_evaluacion": "2025-06-10",
        "ultima_evaluacion": "2026-01-02"
      },
      {
        "especialidad": "Deportologia",
        "total_evaluaciones": 12,
        "total_pacientes": 10,
        "pacientes": [...],
        "promedio_eva": 5.8,
        "primera_evaluacion": "2025-03-20",
        "ultima_evaluacion": "2026-01-04"
      },
      {
        "especialidad": "Pediatria",
        "total_evaluaciones": 6,
        "total_pacientes": 5,
        "pacientes": [...],
        "promedio_eva": 4.5,
        "primera_evaluacion": "2025-08-05",
        "ultima_evaluacion": "2025-12-28"
      },
      {
        "especialidad": "Geriatria",
        "total_evaluaciones": 4,
        "total_pacientes": 4,
        "pacientes": [...],
        "promedio_eva": 6.8,
        "primera_evaluacion": "2025-07-12",
        "ultima_evaluacion": "2025-12-30"
      },
      {
        "especialidad": "Sin especialidad",
        "total_evaluaciones": 10,
        "total_pacientes": 9,
        "pacientes": [...],
        "promedio_eva": 5.5,
        "primera_evaluacion": "2024-11-01",
        "ultima_evaluacion": "2025-12-15"
      }
    ],
    "totales": {
      "evaluaciones": 55,
      "pacientes_unicos": 47
    }
  }
}
```

#### Ejemplo de Uso
```bash
# Todas las evaluaciones (histórico completo)
GET http://localhost:3001/api/dashboard/especialidades/evaluaciones

# Evaluaciones del último mes
GET http://localhost:3001/api/dashboard/especialidades/evaluaciones?fecha_inicio=2025-12-04&fecha_fin=2026-01-04

# Con curl
curl -X GET "http://localhost:3001/api/dashboard/especialidades/evaluaciones" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Planes por Especialidad

**`GET /api/dashboard/especialidades/planes`**

Obtiene estadísticas de planes de tratamiento agrupados por especialidad con lista de pacientes.

#### Query Parameters (Opcionales)
```
fecha_inicio: string (YYYY-MM-DD) - Filtrar desde esta fecha
fecha_fin: string (YYYY-MM-DD) - Filtrar hasta esta fecha
estado: string (activo|finalizado|cancelado) - Filtrar por estado
```

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "por_especialidad": [
      {
        "especialidad": "Traumatologia",
        "total_planes": 10,
        "total_pacientes": 8,
        "planes_activos": 6,
        "planes_finalizados": 3,
        "planes_cancelados": 1,
        "pacientes": [
          {
            "paciente_id": 1,
            "paciente_nombre": "Juan Pérez",
            "paciente_documento": "12345678",
            "planes_count": 2
          },
          {
            "paciente_id": 2,
            "paciente_nombre": "María González",
            "paciente_documento": "87654321",
            "planes_count": 1
          }
        ],
        "total_sesiones_planificadas": 150,
        "total_sesiones_completadas": 85,
        "porcentaje_progreso": 56.7
      },
      {
        "especialidad": "Neurologia",
        "total_planes": 5,
        "total_pacientes": 5,
        "planes_activos": 4,
        "planes_finalizados": 1,
        "planes_cancelados": 0,
        "pacientes": [...],
        "total_sesiones_planificadas": 100,
        "total_sesiones_completadas": 42,
        "porcentaje_progreso": 42.0
      },
      {
        "especialidad": "Sin especialidad",
        "total_planes": 8,
        "total_pacientes": 7,
        "planes_activos": 5,
        "planes_finalizados": 2,
        "planes_cancelados": 1,
        "pacientes": [...],
        "total_sesiones_planificadas": 120,
        "total_sesiones_completadas": 55,
        "porcentaje_progreso": 45.8
      }
    ],
    "totales": {
      "total_planes": 23,
      "total_pacientes": 20
    }
  }
}
```

#### Ejemplo de Uso
```bash
# Todos los planes
GET http://localhost:3001/api/dashboard/especialidades/planes

# Solo planes activos
GET http://localhost:3001/api/dashboard/especialidades/planes?estado=activo

# Planes del último trimestre
GET http://localhost:3001/api/dashboard/especialidades/planes?fecha_inicio=2025-10-01&fecha_fin=2026-01-04

# Con curl
curl -X GET "http://localhost:3001/api/dashboard/especialidades/planes?estado=activo" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Resumen General de Especialidades

**`GET /api/dashboard/especialidades/resumen`**

Obtiene un resumen consolidado de todas las especialidades con evaluaciones y planes.

#### Sin parámetros

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": [
    {
      "especialidad": "Traumatologia",
      "evaluaciones": 15,
      "planes": 10,
      "pacientes_evaluaciones": 12,
      "pacientes_planes": 8
    },
    {
      "especialidad": "Neurologia",
      "evaluaciones": 8,
      "planes": 5,
      "pacientes_evaluaciones": 7,
      "pacientes_planes": 5
    },
    {
      "especialidad": "Deportologia",
      "evaluaciones": 12,
      "planes": 7,
      "pacientes_evaluaciones": 10,
      "pacientes_planes": 6
    },
    {
      "especialidad": "Pediatria",
      "evaluaciones": 6,
      "planes": 3,
      "pacientes_evaluaciones": 5,
      "pacientes_planes": 3
    },
    {
      "especialidad": "Geriatria",
      "evaluaciones": 4,
      "planes": 2,
      "pacientes_evaluaciones": 4,
      "pacientes_planes": 2
    },
    {
      "especialidad": "Sin especialidad",
      "evaluaciones": 10,
      "planes": 8,
      "pacientes_evaluaciones": 9,
      "pacientes_planes": 7
    }
  ]
}
```

#### Ejemplo de Uso
```bash
GET http://localhost:3001/api/dashboard/especialidades/resumen

# Con curl
curl -X GET "http://localhost:3001/api/dashboard/especialidades/resumen" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Detalle de Especialidad Específica

**`GET /api/dashboard/especialidades/:especialidad/detalle`**

Obtiene información detallada de una especialidad específica incluyendo todas las evaluaciones, planes y pacientes asociados.

#### Path Parameters
```
especialidad: string (required) - Una de: Traumatologia, Neurologia, Deportologia, Pediatria, Geriatria, Sin especialidad
```

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "especialidad": "Traumatologia",
    "estadisticas": {
      "total_evaluaciones": 15,
      "total_planes": 10,
      "total_pacientes": 12
    },
    "evaluaciones": [
      {
        "id": 45,
        "paciente_id": 1,
        "paciente_nombre": "Juan Pérez",
        "paciente_documento": "12345678",
        "diagnostico": "Lumbalgia mecánica",
        "motivo_consulta": "Dolor lumbar crónico",
        "escala_eva": 7,
        "fecha_evaluacion": "2026-01-03",
        "creado_en": "2026-01-03T10:30:00.000Z"
      },
      {
        "id": 42,
        "paciente_id": 2,
        "paciente_nombre": "María González",
        "paciente_documento": "87654321",
        "diagnostico": "Esguince de tobillo grado II",
        "motivo_consulta": "Lesión deportiva",
        "escala_eva": 6,
        "fecha_evaluacion": "2026-01-02",
        "creado_en": "2026-01-02T15:20:00.000Z"
      }
      // ... hasta 50 evaluaciones más recientes
    ],
    "planes": [
      {
        "id": 23,
        "paciente_id": 1,
        "paciente_nombre": "Juan Pérez",
        "paciente_documento": "12345678",
        "objetivo": "Recuperar movilidad lumbar",
        "estado": "activo",
        "sesiones_plan": 15,
        "sesiones_completadas": 8,
        "progreso": 53.3,
        "creado_en": "2026-01-03T11:00:00.000Z"
      },
      {
        "id": 21,
        "paciente_id": 2,
        "paciente_nombre": "María González",
        "paciente_documento": "87654321",
        "objetivo": "Rehabilitación post-esguince",
        "estado": "activo",
        "sesiones_plan": 10,
        "sesiones_completadas": 4,
        "progreso": 40.0,
        "creado_en": "2026-01-02T16:00:00.000Z"
      }
      // ... hasta 50 planes más recientes
    ],
    "pacientes": [
      {
        "id": 1,
        "nombre": "Juan Pérez",
        "documento": "12345678",
        "telefono": "555-0101",
        "email": "juan.perez@email.com",
        "total_evaluaciones": 2,
        "total_planes": 1
      },
      {
        "id": 2,
        "nombre": "María González",
        "documento": "87654321",
        "telefono": "555-0102",
        "email": "maria.gonzalez@email.com",
        "total_evaluaciones": 1,
        "total_planes": 1
      }
      // ... todos los pacientes de esta especialidad
    ]
  }
}
```

#### Ejemplo de Uso
```bash
# Detalle de Traumatología
GET http://localhost:3001/api/dashboard/especialidades/Traumatologia/detalle

# Detalle de Neurología
GET http://localhost:3001/api/dashboard/especialidades/Neurologia/detalle

# Registros sin especialidad
GET http://localhost:3001/api/dashboard/especialidades/Sin%20especialidad/detalle

# Con curl
curl -X GET "http://localhost:3001/api/dashboard/especialidades/Traumatologia/detalle" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Error: Especialidad Inválida (400)
```json
{
  "success": false,
  "message": "Especialidad inválida"
}
```

---

## 🎨 Implementación en Frontend

### 1. Tipos TypeScript

```typescript
// types/dashboard.ts
export interface EspecialidadStats {
  especialidad: string;
  total_evaluaciones: number;
  total_pacientes: number;
  pacientes: PacienteResumen[];
  promedio_eva: number;
  primera_evaluacion: string;
  ultima_evaluacion: string;
}

export interface PacienteResumen {
  paciente_id: number;
  paciente_nombre: string;
  paciente_documento: string;
  planes_count?: number;
}

export interface PlanStats {
  especialidad: string;
  total_planes: number;
  total_pacientes: number;
  planes_activos: number;
  planes_finalizados: number;
  planes_cancelados: number;
  pacientes: PacienteResumen[];
  total_sesiones_planificadas: number;
  total_sesiones_completadas: number;
  porcentaje_progreso: number;
}

export interface ResumenEspecialidad {
  especialidad: string;
  evaluaciones: number;
  planes: number;
  pacientes_evaluaciones: number;
  pacientes_planes: number;
}

export interface DetalleEspecialidad {
  especialidad: string;
  estadisticas: {
    total_evaluaciones: number;
    total_planes: number;
    total_pacientes: number;
  };
  evaluaciones: Evaluacion[];
  planes: Plan[];
  pacientes: Paciente[];
}
```

### 2. Servicio API

```typescript
// services/dashboardApi.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const dashboardApi = {
  // Evaluaciones por especialidad
  getEvaluacionesPorEspecialidad: async (params?: { 
    fecha_inicio?: string; 
    fecha_fin?: string;
  }) => {
    const response = await axios.get(`${API_BASE}/dashboard/especialidades/evaluaciones`, {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // Planes por especialidad
  getPlanesPorEspecialidad: async (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: 'activo' | 'finalizado' | 'cancelado';
  }) => {
    const response = await axios.get(`${API_BASE}/dashboard/especialidades/planes`, {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // Resumen general
  getResumenEspecialidades: async () => {
    const response = await axios.get(`${API_BASE}/dashboard/especialidades/resumen`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // Detalle de especialidad
  getDetalleEspecialidad: async (especialidad: string) => {
    const response = await axios.get(
      `${API_BASE}/dashboard/especialidades/${encodeURIComponent(especialidad)}/detalle`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );
    return response.data;
  }
};
```

### 3. Componente Dashboard de Especialidades (React)

```tsx
// components/DashboardEspecialidades.tsx
import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/dashboardApi';
import { ResumenEspecialidad } from '../types/dashboard';
import { ESPECIALIDADES } from '../constants/especialidades';

export const DashboardEspecialidades: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenEspecialidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumen();
  }, []);

  const loadResumen = async () => {
    try {
      const response = await dashboardApi.getResumenEspecialidades();
      setResumen(response.data);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="dashboard-especialidades">
      <h2>📊 Resumen por Especialidades</h2>
      
      <div className="row">
        {resumen.map((item) => {
          const esp = ESPECIALIDADES.find(e => e.value === item.especialidad);
          
          return (
            <div key={item.especialidad} className="col-md-4 mb-3">
              <div className="card" style={{ borderLeft: `4px solid ${esp?.color || '#ccc'}` }}>
                <div className="card-body">
                  <h5 className="card-title">
                    {esp?.icon} {esp?.label || item.especialidad}
                  </h5>
                  
                  <div className="stats">
                    <div className="stat-item">
                      <strong>Evaluaciones:</strong> {item.evaluaciones}
                      <small className="text-muted">
                        ({item.pacientes_evaluaciones} pacientes)
                      </small>
                    </div>
                    
                    <div className="stat-item">
                      <strong>Planes:</strong> {item.planes}
                      <small className="text-muted">
                        ({item.pacientes_planes} pacientes)
                      </small>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-sm btn-primary mt-2"
                    onClick={() => window.location.href = `/especialidades/${item.especialidad}`}
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### 4. Gráfico de Barras (Chart.js)

```tsx
// components/GraficoEspecialidades.tsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { dashboardApi } from '../services/dashboardApi';
import { ESPECIALIDADES } from '../constants/especialidades';

export const GraficoEspecialidades: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await dashboardApi.getResumenEspecialidades();
      
      const chartData = {
        labels: response.data.map((item: any) => {
          const esp = ESPECIALIDADES.find(e => e.value === item.especialidad);
          return esp?.label || item.especialidad;
        }),
        datasets: [
          {
            label: 'Evaluaciones',
            data: response.data.map((item: any) => item.evaluaciones),
            backgroundColor: '#4ECDC4'
          },
          {
            label: 'Planes',
            data: response.data.map((item: any) => item.planes),
            backgroundColor: '#45B7D1'
          }
        ]
      };
      
      setData(chartData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  if (!data) return <div>Cargando gráfico...</div>;

  return (
    <div className="grafico-especialidades">
      <h3>Evaluaciones y Planes por Especialidad</h3>
      <Bar 
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Distribución por Especialidad' }
          }
        }}
      />
    </div>
  );
};
```

### 5. Vista de Detalle de Especialidad

```tsx
// pages/DetalleEspecialidad.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardApi } from '../services/dashboardApi';
import { DetalleEspecialidad } from '../types/dashboard';

export const DetalleEspecialidadPage: React.FC = () => {
  const { especialidad } = useParams<{ especialidad: string }>();
  const [detalle, setDetalle] = useState<DetalleEspecialidad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetalle();
  }, [especialidad]);

  const loadDetalle = async () => {
    if (!especialidad) return;
    
    try {
      const response = await dashboardApi.getDetalleEspecialidad(especialidad);
      setDetalle(response.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!detalle) return <div>No se encontró información</div>;

  return (
    <div className="detalle-especialidad">
      <h1>{detalle.especialidad}</h1>
      
      <div className="estadisticas-resumen">
        <div className="stat-card">
          <h3>{detalle.estadisticas.total_evaluaciones}</h3>
          <p>Evaluaciones</p>
        </div>
        <div className="stat-card">
          <h3>{detalle.estadisticas.total_planes}</h3>
          <p>Planes</p>
        </div>
        <div className="stat-card">
          <h3>{detalle.estadisticas.total_pacientes}</h3>
          <p>Pacientes</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h3>Pacientes ({detalle.pacientes.length})</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Evaluaciones</th>
                <th>Planes</th>
              </tr>
            </thead>
            <tbody>
              {detalle.pacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.nombre}</td>
                  <td>{paciente.documento}</td>
                  <td>{paciente.total_evaluaciones}</td>
                  <td>{paciente.total_planes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="col-md-6">
          <h3>Evaluaciones Recientes</h3>
          {detalle.evaluaciones.slice(0, 5).map((evaluacion) => (
            <div key={evaluacion.id} className="card mb-2">
              <div className="card-body">
                <h6>{evaluacion.paciente_nombre}</h6>
                <p><strong>Diagnóstico:</strong> {evaluacion.diagnostico}</p>
                <p><strong>EVA:</strong> {evaluacion.escala_eva}/10</p>
                <small>{new Date(evaluacion.fecha_evaluacion).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 📈 Casos de Uso

### 1. Dashboard Principal con Estadísticas
```typescript
// Cargar resumen para mostrar tarjetas de especialidades
const resumen = await dashboardApi.getResumenEspecialidades();
// Mostrar: "Traumatología: 15 evaluaciones, 10 planes"
```

### 2. Gráficos de Distribución
```typescript
// Obtener datos para gráfico de barras o pie chart
const evaluaciones = await dashboardApi.getEvaluacionesPorEspecialidad();
// Crear gráfico con total_evaluaciones por especialidad
```

### 3. Reporte Mensual
```typescript
// Filtrar por período específico
const stats = await dashboardApi.getPlanesPorEspecialidad({
  fecha_inicio: '2025-12-01',
  fecha_fin: '2025-12-31'
});
// Generar reporte del mes
```

### 4. Vista de Pacientes por Especialidad
```typescript
// Obtener lista completa de pacientes de una especialidad
const detalle = await dashboardApi.getDetalleEspecialidad('Traumatologia');
// Mostrar tabla con pacientes y sus evaluaciones/planes
```

### 5. Monitoreo de Progreso
```typescript
// Ver porcentaje de progreso por especialidad
const planes = await dashboardApi.getPlanesPorEspecialidad({ estado: 'activo' });
// Mostrar: "Traumatología: 56.7% de progreso"
```

---

## ✅ Checklist de Implementación Frontend

- [ ] Crear tipos TypeScript para las respuestas
- [ ] Implementar servicio API con axios
- [ ] Crear componente de dashboard general
- [ ] Crear componente de tarjetas por especialidad
- [ ] Implementar gráficos (Chart.js, Recharts, etc.)
- [ ] Crear página de detalle de especialidad
- [ ] Agregar filtros de fecha
- [ ] Agregar filtros de estado (planes)
- [ ] Implementar tabla de pacientes
- [ ] Agregar exportación a PDF/Excel (opcional)
- [ ] Probar con datos reales

---

## 🔍 Notas Importantes

1. **Límite de Resultados:** El endpoint de detalle devuelve máximo 50 evaluaciones y 50 planes (las más recientes).

2. **Filtros Opcionales:** Todos los filtros son opcionales. Sin filtros, se obtiene todo el histórico.

3. **Especialidad "Sin especialidad":** Los registros sin especialidad asignada se agrupan bajo "Sin especialidad".

4. **URL Encoding:** Al llamar al endpoint de detalle con "Sin especialidad", usar `encodeURIComponent()`.

5. **Pacientes Únicos:** Un mismo paciente puede aparecer en múltiples especialidades.

6. **Performance:** Las consultas están optimizadas con índices en las columnas de especialidad.

7. **Promedio EVA:** Se calcula solo para evaluaciones (escala de dolor 0-10).

8. **Porcentaje Progreso:** Se calcula como (sesiones_completadas / sesiones_plan) * 100.

---

**Fecha de creación:** 4 de Enero de 2026  
**Versión de API:** 1.2.0  
**Nuevos endpoints:** 4 rutas de dashboard de especialidades
