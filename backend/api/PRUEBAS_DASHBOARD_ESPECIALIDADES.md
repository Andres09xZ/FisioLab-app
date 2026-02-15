# 🧪 Pruebas Rápidas - Dashboard Especialidades

## Configuración Inicial

```bash
# Variables de entorno
BASE_URL=http://localhost:3001/api
TOKEN=tu_token_jwt_aqui
```

---

## 1️⃣ Resumen General de Especialidades

### Request
```bash
curl -X GET "${BASE_URL}/dashboard/especialidades/resumen" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Respuesta Esperada
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
    }
  ]
}
```

### Uso Frontend
- **Dashboard principal:** Mostrar tarjetas con contadores
- **Gráficos:** Crear gráfico de barras o pie chart
- **KPIs:** Mostrar métricas clave

---

## 2️⃣ Evaluaciones por Especialidad

### Request Básico (Todo el histórico)
```bash
curl -X GET "${BASE_URL}/dashboard/especialidades/evaluaciones" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Request con Filtro de Fechas
```bash
# Último mes
curl -X GET "${BASE_URL}/dashboard/especialidades/evaluaciones?fecha_inicio=2025-12-04&fecha_fin=2026-01-04" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Respuesta Esperada
```json
{
  "success": true,
  "data": {
    "por_especialidad": [
      {
        "especialidad": "Traumatologia",
        "total_evaluaciones": 10,
        "total_pacientes": 8,
        "pacientes": [
          {
            "paciente_id": 1,
            "paciente_nombre": "Juan Pérez",
            "paciente_documento": "12345678"
          }
        ],
        "promedio_eva": 6.3,
        "primera_evaluacion": "2025-01-15",
        "ultima_evaluacion": "2026-01-03"
      }
    ],
    "totales": {
      "evaluaciones": 55,
      "pacientes_unicos": 47
    }
  }
}
```

### Uso Frontend
- **Tarjetas por especialidad:** "Traumatología tiene 10 evaluaciones de 8 pacientes"
- **Lista de pacientes:** Mostrar pacientes asociados a cada especialidad
- **Promedio EVA:** "Dolor promedio: 6.3/10"
- **Timeline:** Mostrar primera y última evaluación

---

## 3️⃣ Planes por Especialidad

### Request Básico
```bash
curl -X GET "${BASE_URL}/dashboard/especialidades/planes" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Request con Filtros
```bash
# Solo planes activos
curl -X GET "${BASE_URL}/dashboard/especialidades/planes?estado=activo" \
  -H "Authorization: Bearer ${TOKEN}"

# Planes del último mes activos
curl -X GET "${BASE_URL}/dashboard/especialidades/planes?fecha_inicio=2025-12-04&fecha_fin=2026-01-04&estado=activo" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Respuesta Esperada
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
          }
        ],
        "total_sesiones_planificadas": 150,
        "total_sesiones_completadas": 85,
        "porcentaje_progreso": 56.7
      }
    ],
    "totales": {
      "total_planes": 23,
      "total_pacientes": 20
    }
  }
}
```

### Uso Frontend
- **Cards con progreso:** "Traumatología: 56.7% de progreso (85/150 sesiones)"
- **Filtro de estado:** Botones para "Activos", "Finalizados", "Cancelados"
- **Lista de pacientes:** Mostrar cuántos planes tiene cada paciente
- **Gráfico de progreso:** Progress bar por especialidad

---

## 4️⃣ Detalle de Especialidad Específica

### Request
```bash
# Traumatología
curl -X GET "${BASE_URL}/dashboard/especialidades/Traumatologia/detalle" \
  -H "Authorization: Bearer ${TOKEN}"

# Neurología
curl -X GET "${BASE_URL}/dashboard/especialidades/Neurologia/detalle" \
  -H "Authorization: Bearer ${TOKEN}"

# Sin especialidad (necesita URL encoding)
curl -X GET "${BASE_URL}/dashboard/especialidades/Sin%20especialidad/detalle" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Respuesta Esperada
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
      }
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
      }
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
      }
    ]
  }
}
```

### Uso Frontend
- **Página dedicada:** `/especialidades/Traumatologia`
- **KPIs en header:** Mostrar estadísticas resumidas
- **Tabla de pacientes:** Lista completa con evaluaciones y planes
- **Timeline de evaluaciones:** Mostrar las 50 más recientes
- **Lista de planes:** Mostrar los 50 más recientes con progreso
- **Exportación:** Botón para exportar datos a Excel/PDF

---

## 🎨 Ejemplos de Componentes Frontend

### Dashboard Card
```tsx
<div className="card">
  <div className="card-body">
    <h5>🦴 Traumatología</h5>
    <p>Evaluaciones: <strong>10</strong> (8 pacientes)</p>
    <p>Planes: <strong>6</strong> (5 pacientes)</p>
    <button>Ver detalle →</button>
  </div>
</div>
```

### Gráfico de Barras
```tsx
<BarChart>
  <Bar dataKey="evaluaciones" fill="#4ECDC4" />
  <Bar dataKey="planes" fill="#45B7D1" />
  <XAxis dataKey="especialidad" />
</BarChart>
```

### Tabla de Pacientes
```tsx
<table>
  <thead>
    <tr>
      <th>Paciente</th>
      <th>Documento</th>
      <th>Evaluaciones</th>
      <th>Planes</th>
    </tr>
  </thead>
  <tbody>
    {pacientes.map(p => (
      <tr key={p.paciente_id}>
        <td>{p.paciente_nombre}</td>
        <td>{p.paciente_documento}</td>
        <td>{p.total_evaluaciones || '-'}</td>
        <td>{p.planes_count || '-'}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 📊 Ejemplos de Visualización

### 1. Cards Dashboard
```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ 🦴 Traumatología    │  │ 🧠 Neurología       │  │ ⚽ Deportología      │
│                     │  │                     │  │                     │
│ 15 Evaluaciones     │  │ 8 Evaluaciones      │  │ 12 Evaluaciones     │
│ 12 Pacientes        │  │ 7 Pacientes         │  │ 10 Pacientes        │
│                     │  │                     │  │                     │
│ 10 Planes           │  │ 5 Planes            │  │ 7 Planes            │
│ 56.7% Progreso      │  │ 42% Progreso        │  │ 68% Progreso        │
│                     │  │                     │  │                     │
│ [Ver detalle →]     │  │ [Ver detalle →]     │  │ [Ver detalle →]     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### 2. Gráfico de Progreso
```
Traumatología    ████████████████░░░░  56.7% (85/150 sesiones)
Neurología       ████████░░░░░░░░░░░░  42.0% (42/100 sesiones)
Deportología     ██████████████░░░░░░  68.0% (68/100 sesiones)
Pediatría        ███████████░░░░░░░░░  55.0% (33/60 sesiones)
Geriatría        █████████████████░░░  75.0% (30/40 sesiones)
```

### 3. Tabla de Pacientes por Especialidad
```
Traumatología - 10 pacientes

Nombre              Documento   Evaluaciones  Planes  Última Evaluación
─────────────────────────────────────────────────────────────────────────
Juan Pérez          12345678    2             1       2026-01-03
María González      87654321    1             1       2026-01-02
Carlos Rodríguez    11223344    3             2       2025-12-28
```

---

## 🧪 Escenarios de Prueba

### Escenario 1: Dashboard Vacío
```bash
# Si no hay datos, la respuesta será:
{
  "success": true,
  "data": []
}
```

### Escenario 2: Una Sola Especialidad
```bash
# Si solo existe Traumatología:
{
  "success": true,
  "data": [
    {
      "especialidad": "Traumatologia",
      "evaluaciones": 5,
      "planes": 3,
      ...
    }
  ]
}
```

### Escenario 3: Especialidad Sin Datos
```bash
# Si consultas detalle de una especialidad sin registros:
{
  "success": true,
  "data": {
    "especialidad": "Pediatria",
    "estadisticas": {
      "total_evaluaciones": 0,
      "total_planes": 0,
      "total_pacientes": 0
    },
    "evaluaciones": [],
    "planes": [],
    "pacientes": []
  }
}
```

### Escenario 4: Especialidad Inválida
```bash
curl -X GET "${BASE_URL}/dashboard/especialidades/Cardiologia/detalle"

# Respuesta:
{
  "success": false,
  "message": "Especialidad inválida"
}
```

---

## 📝 Notas para Testing

### Thunder Client / Postman
1. Crear colección "Dashboard Especialidades"
2. Configurar variable de entorno `{{baseUrl}}` = `http://localhost:3001/api`
3. Configurar variable `{{token}}` con tu JWT
4. Importar las siguientes requests:

```
GET {{baseUrl}}/dashboard/especialidades/resumen
GET {{baseUrl}}/dashboard/especialidades/evaluaciones
GET {{baseUrl}}/dashboard/especialidades/planes?estado=activo
GET {{baseUrl}}/dashboard/especialidades/Traumatologia/detalle
```

### Validaciones a Realizar
- ✅ Resumen devuelve todas las especialidades existentes
- ✅ Evaluaciones agrupa correctamente por especialidad
- ✅ Planes filtra correctamente por estado
- ✅ Detalle devuelve pacientes únicos
- ✅ Promedio EVA se calcula correctamente
- ✅ Porcentaje progreso es preciso
- ✅ Filtros de fecha funcionan
- ✅ "Sin especialidad" aparece en resultados
- ✅ Validación de especialidad inválida funciona

---

## 🚀 Orden de Implementación Recomendado

### Backend ✅ (Completado)
1. ✅ Agregar funciones al controlador
2. ✅ Registrar rutas en router
3. ✅ Probar endpoints con curl

### Frontend (Pendiente)
1. Crear tipos TypeScript
2. Implementar servicio API
3. Crear componente de resumen general
4. Crear componente de cards por especialidad
5. Implementar gráficos
6. Crear página de detalle
7. Agregar filtros
8. Testing completo

---

**Listo para usar** ✅  
Todos los endpoints están funcionando y listos para ser consumidos por el frontend.
