# 🔍 Análisis de Endpoints - Agendamiento de Citas y Sesiones

## Estado Actual de la API

Este documento analiza los endpoints existentes y los que faltan para implementar completamente el sistema de agendamiento de citas y sesiones.

---

## ✅ Endpoints EXISTENTES

### Citas (`/api/citas`)

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| ✅ GET | `/citas` | Existe | Listar citas con filtros |
| ✅ GET | `/citas/calendario` | Existe | Eventos para FullCalendar |
| ✅ POST | `/citas` | Existe | Crear cita |
| ✅ POST | `/citas/bulk` | Existe | Crear múltiples citas |
| ✅ PUT | `/citas/:id` | Existe | Actualizar cita (mover/editar) |
| ✅ DELETE | `/citas/:id` | Existe | Eliminar cita |
| ✅ PUT | `/citas/:id/completar` | Existe | Completar cita + sesión + plan |

### Sesiones (`/api/sesiones`)

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| ✅ POST | `/sesiones` | Existe | Crear sesión individual |
| ✅ GET | `/sesiones/:id` | Existe | Obtener sesión por ID |
| ✅ PUT | `/sesiones/:id` | Existe | Actualizar sesión |
| ✅ POST | `/sesiones/:id/evaluacion` | Existe | Registrar evaluación |
| ✅ PUT | `/sesiones/:id/asignar-cita` | Existe | Asignar cita a sesión pendiente |

### Planes (`/api/planes`)

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| ✅ GET | `/pacientes/:id/planes` | Existe | Listar planes de paciente |
| ✅ POST | `/pacientes/:id/planes` | Existe | Crear plan para paciente |
| ✅ PUT | `/planes/:id` | Existe | Actualizar plan |
| ✅ POST | `/evaluaciones/:id/planes` | Existe | Crear plan desde evaluación |
| ✅ GET | `/planes/:id/sesiones` | Existe | Listar sesiones del plan |
| ✅ POST | `/planes/:id/generar-sesiones` | Existe | Generar sesiones + citas automáticas |
| ✅ POST | `/planes/:id/generar-sesiones-pendientes` | Existe | Generar solo sesiones pendientes |

### Agenda (`/api/agenda`)

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| ✅ GET | `/agenda/disponibilidad` | Existe | Verificar anti-solapamiento |

---

## ❌ Endpoints FALTANTES

### 🔴 Alta Prioridad (Necesarios para flujo básico)

| Método | Endpoint | Prioridad | Descripción | Uso |
|--------|----------|-----------|-------------|-----|
| ❌ GET | `/citas/:id` | **ALTA** | Obtener cita por ID | Ver detalle de cita en modal |
| ❌ GET | `/planes/:id` | **ALTA** | Obtener plan por ID | Ver detalle y progreso del plan |
| ❌ PUT | `/citas/:id/cancelar` | **ALTA** | Cancelar cita | Cambiar estado a 'cancelada' y desvincular sesión |
| ❌ PUT | `/sesiones/:id/cancelar` | **ALTA** | Cancelar sesión | Marcar como cancelada |
| ❌ GET | `/sesiones` | **ALTA** | Listar sesiones (con filtros) | Ver sesiones pendientes de un paciente |

### 🟡 Media Prioridad (Mejoran UX)

| Método | Endpoint | Prioridad | Descripción | Uso |
|--------|----------|-----------|-------------|-----|
| ❌ GET | `/pacientes/:id/sesiones-pendientes` | MEDIA | Sesiones sin cita asignada | Mostrar cuántas sesiones faltan agendar |
| ❌ GET | `/profesionales/:id/disponibilidad` | MEDIA | Horarios libres del profesional | Sugerir horarios al agendar |
| ❌ GET | `/agenda/resumen-dia` | MEDIA | Resumen de citas del día | Dashboard de agenda |
| ❌ PUT | `/citas/:id/reagendar` | MEDIA | Reagendar con validación | Mover cita validando disponibilidad |

### 🟢 Baja Prioridad (Funcionalidades extras)

| Método | Endpoint | Prioridad | Descripción | Uso |
|--------|----------|-----------|-------------|-----|
| ❌ GET | `/agenda/horarios-sugeridos` | BAJA | Sugerir próximos horarios | Auto-sugerir fechas disponibles |
| ❌ POST | `/citas/:id/duplicar` | BAJA | Duplicar cita | Crear cita similar rápidamente |
| ❌ GET | `/reportes/ocupacion-semanal` | BAJA | Ocupación por semana | Gráficas de carga |

---

## 📝 Implementación de Endpoints Faltantes

### 1. GET `/citas/:id` - Obtener Cita por ID

**Controlador a agregar en `citas.controller.js`:**

```javascript
export const getCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT c.*, 
              p.nombres as paciente_nombres, 
              p.apellidos as paciente_apellidos,
              pr.nombre as profesional_nombre,
              pr.apellido as profesional_apellido
       FROM citas c
       LEFT JOIN pacientes p ON c.paciente_id = p.id
       LEFT JOIN profesionales pr ON c.profesional_id = pr.id
       WHERE c.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getCita error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener cita' });
  }
};
```

---

### 2. GET `/planes/:id` - Obtener Plan por ID

**Controlador a agregar en `planes.controller.js`:**

```javascript
export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT pt.*,
              p.nombres || ' ' || p.apellidos as paciente_nombre,
              e.diagnostico as evaluacion_diagnostico,
              e.fecha_evaluacion as evaluacion_fecha,
              ROUND((pt.sesiones_completadas::decimal / pt.sesiones_plan) * 100) as progreso_porcentaje
       FROM planes_tratamiento pt
       LEFT JOIN pacientes p ON pt.paciente_id = p.id
       LEFT JOIN evaluaciones_fisioterapeuticas e ON pt.evaluacion_id = e.id
       WHERE pt.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getPlan error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener plan' });
  }
};
```

---

### 3. PUT `/citas/:id/cancelar` - Cancelar Cita

**Controlador a agregar en `citas.controller.js`:**

```javascript
export const cancelarCita = async (req, res) => {
  const client = await getClient();
  
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    await client.query('BEGIN');

    // Actualizar estado de la cita a 'cancelada'
    const citaResult = await client.query(
      `UPDATE citas 
       SET estado = 'cancelada', 
           notas = COALESCE(notas || ' | Cancelada: ', '') || COALESCE($2, 'Sin motivo'),
           actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, paciente_id`,
      [id, motivo || null]
    );

    if (citaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    // Buscar si hay una sesión asociada y desvinculrla
    const sesionResult = await client.query(
      `UPDATE sesiones 
       SET cita_id = NULL,
           estado = 'pendiente',
           fecha_sesion = NULL,
           actualizado_en = NOW()
       WHERE cita_id = $1
       RETURNING id, plan_id`,
      [id]
    );

    await client.query('COMMIT');
    client.release();

    return res.json({ 
      success: true, 
      data: {
        cita_cancelada: citaResult.rows[0],
        sesion_desvinculada: sesionResult.rows[0] || null
      },
      message: sesionResult.rows.length > 0 
        ? 'Cita cancelada y sesión devuelta a pendiente'
        : 'Cita cancelada'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('cancelarCita error', err);
    return res.status(500).json({ success: false, message: 'Error al cancelar cita' });
  }
};
```

---

### 4. GET `/sesiones` - Listar Sesiones con Filtros

**Controlador a agregar en `sesiones.controller.js`:**

```javascript
export const listSesiones = async (req, res) => {
  try {
    const { paciente_id, plan_id, estado, sin_cita } = req.query;
    const params = [];
    let sql = `
      SELECT s.*,
             p.nombres || ' ' || p.apellidos as paciente_nombre,
             pr.nombre || ' ' || pr.apellido as profesional_nombre,
             c.inicio as cita_inicio,
             c.fin as cita_fin
      FROM sesiones s
      LEFT JOIN pacientes p ON s.paciente_id = p.id
      LEFT JOIN profesionales pr ON s.profesional_id = pr.id
      LEFT JOIN citas c ON s.cita_id = c.id
      WHERE 1=1
    `;
    
    if (paciente_id) { 
      params.push(paciente_id); 
      sql += ` AND s.paciente_id = $${params.length}`; 
    }
    if (plan_id) { 
      params.push(plan_id); 
      sql += ` AND s.plan_id = $${params.length}`; 
    }
    if (estado) { 
      params.push(estado); 
      sql += ` AND s.estado = $${params.length}`; 
    }
    if (sin_cita === 'true') {
      sql += ` AND s.cita_id IS NULL`;
    }
    
    sql += ' ORDER BY s.fecha_sesion ASC NULLS LAST';
    
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listSesiones error', err);
    return res.status(500).json({ success: false, message: 'Error al listar sesiones' });
  }
};
```

---

### 5. GET `/pacientes/:id/sesiones-pendientes` - Sesiones Pendientes de un Paciente

**Controlador a agregar en `sesiones.controller.js`:**

```javascript
export const getSesionesPendientesPaciente = async (req, res) => {
  try {
    const { id: paciente_id } = req.params;
    
    const { rows } = await query(
      `SELECT s.*,
              pt.objetivo as plan_objetivo,
              pt.sesiones_plan,
              pt.sesiones_completadas
       FROM sesiones s
       JOIN planes_tratamiento pt ON s.plan_id = pt.id
       WHERE s.paciente_id = $1 
         AND s.estado = 'pendiente'
         AND s.cita_id IS NULL
       ORDER BY s.creado_en ASC`,
      [paciente_id]
    );
    
    return res.json({ 
      success: true, 
      data: rows,
      total_pendientes: rows.length
    });
  } catch (err) {
    console.error('getSesionesPendientesPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener sesiones pendientes' });
  }
};
```

---

## 🛠️ Rutas a Agregar

### En `citas.routes.js`:

```javascript
import { getCita, cancelarCita } from '../controllers/citas.controller.js';

// Agregar ANTES de router.put('/:id', updateCita);
router.get('/:id', getCita);

// Agregar después de router.put('/:id/completar', completarCita);
router.put('/:id/cancelar', cancelarCita);
```

### En `planes.routes.js`:

```javascript
import { getPlan } from '../controllers/planes.controller.js';

// Agregar nuevo endpoint
router.get('/planes/:id', getPlan);
```

### En `sesiones.routes.js`:

```javascript
import { listSesiones } from '../controllers/sesiones.controller.js';

// Agregar al inicio (antes de las rutas con :id)
router.get('/', listSesiones);
```

### En `pacientes.routes.js`:

```javascript
import { getSesionesPendientesPaciente } from '../controllers/sesiones.controller.js';

// Agregar nueva ruta
router.get('/:id/sesiones-pendientes', getSesionesPendientesPaciente);
```

---

## 📊 Resumen de Cambios Necesarios

| Archivo | Cambios |
|---------|---------|
| `citas.controller.js` | +2 funciones: `getCita`, `cancelarCita` |
| `citas.routes.js` | +2 rutas: `GET /:id`, `PUT /:id/cancelar` |
| `planes.controller.js` | +1 función: `getPlan` |
| `planes.routes.js` | +1 ruta: `GET /planes/:id` |
| `sesiones.controller.js` | +2 funciones: `listSesiones`, `getSesionesPendientesPaciente` |
| `sesiones.routes.js` | +1 ruta: `GET /` |
| `pacientes.routes.js` | +1 ruta: `GET /:id/sesiones-pendientes` |

---

## ✅ Checklist de Implementación

### Fase 1: Endpoints Críticos
- [ ] `GET /citas/:id` - Obtener cita
- [ ] `GET /planes/:id` - Obtener plan
- [ ] `PUT /citas/:id/cancelar` - Cancelar cita
- [ ] `GET /sesiones` - Listar sesiones

### Fase 2: Endpoints de Mejora
- [ ] `GET /pacientes/:id/sesiones-pendientes`
- [ ] `PUT /sesiones/:id/cancelar`

### Fase 3: Tests
- [ ] Test unitarios para nuevos endpoints
- [ ] Test de integración para flujos completos

---

## 🚀 ¿Implementar ahora?

Si deseas, puedo implementar todos los endpoints faltantes de **Fase 1** directamente en los archivos del proyecto.

Solo confirma y procedo con:
1. Agregar funciones en controladores
2. Agregar rutas
3. Agregar documentación Swagger

---

**Última actualización:** 21 de diciembre de 2025
