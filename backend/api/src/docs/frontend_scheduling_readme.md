# Frontend: Implementación del Flujo de Agendamiento de Citas

Este README describe un prompt y guía práctica para implementar en el frontend (React) el flujo de agendamiento de citas integrado con el backend de FisioLab.

Propósito: proporcionar al equipo frontend un plan claro, componentes, ejemplos de requests/responses, y cómo integrar con FullCalendar para crear/mover/completar citas vinculadas a sesiones y planes.

---

## 1) Objetivo del flujo

- Ver calendario con las citas del profesional (FullCalendar).
- Crear una cita manualmente desde el calendario o desde el detalle del paciente.
- Crear un plan y generar sesiones (backend crea citas + sesiones).
- Mover (drag & drop) citas y validar disponibilidad.
- Marcar una cita como completada y reflejar progreso del plan.

---

## 2) Endpoints que vamos a usar (resumen)

- GET `/api/citas/calendario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&profesional_id=UUID`
- POST `/api/citas`  — crear cita
- PUT `/api/citas/{id}` — actualizar/mover cita
- GET `/api/agenda/disponibilidad?profesional_id=UUID&inicio=ISO&fin=ISO` — verificar disponibilidad
- POST `/api/planes/{id}/generar-sesiones` — genera sesiones + citas
- GET `/api/planes/{id}/sesiones` — obtener sesiones (con `cita_id`)
- PUT `/api/citas/{id}/completar` — marcar como completada

---

## 3) Prompt / Story para el desarrollador frontend

"Implementa la vista de Agenda usando FullCalendar que permita:
1) Cargar eventos del backend y mostrarlos con colores por profesional/estado.
2) Al arrastrar (drag) o extender un evento (resize), validar disponibilidad con `GET /api/agenda/disponibilidad` antes de confirmar.
3) Al crear un nuevo evento, validar disponibilidad y llamar a `POST /api/citas`.
4) Mostrar un modal para crear cita desde el detalle del paciente con campos: `profesional_id`, `inicio`, `fin`, `titulo`.
5) Proveer un botón en el detalle del plan: "Generar sesiones" que llame a `POST /api/planes/{id}/generar-sesiones` y muestre un resumen de citas creadas.
6) Permitir marcar una sesión como completada desde el modal del evento (llamando `PUT /api/citas/{id}/completar`) y actualizar el progreso del plan en la vista del paciente."

---

## 4) Estructura de componentes sugerida (React)

- `AgendaPage` (page)
  - carga profesionales (opcional)
  - guarda `profesionalSeleccionado` en estado
  - renderiza `FullCalendar` con eventos y handlers
- `CitaModal` (component)
  - inputs: `paciente_id`, `profesional_id`, `fecha_inicio`, `fecha_fin`, `titulo`
  - acciones: validar disponibilidad, crear cita
- `PlanDetail` (component)
  - muestra progreso del plan
  - botón: `Generar sesiones` → abre modal con `fecha_inicio`, `dias_semana`, `hora`, `duracion_minutos`, `profesional_id`
- `EventPopup` (component)
  - muestra detalles de evento cuando se hace click
  - acciones: mover (abre editor), completar sesión (PUT /citas/{id}/completar)

---

## 5) Snippets clave (React + fetch)

### 5.1 Cargar eventos para FullCalendar
```js
// AgendaPage.jsx
useEffect(() => {
  const fetchEvents = async () => {
    const desde = format(startDate, 'yyyy-MM-dd');
    const hasta = format(endDate, 'yyyy-MM-dd');
    const res = await fetch(`/api/citas/calendario?desde=${desde}&hasta=${hasta}&profesional_id=${profesionalId}`);
    const json = await res.json();
    if (json.success) {
      setEvents(json.data.map(e => ({
        id: e.id,
        title: e.title || e.titulo || 'Sesión',
        start: e.start || e.inicio,
        end: e.end || e.fin,
        extendedProps: { estado: e.estado }
      })));
    }
  };
  fetchEvents();
}, [startDate, endDate, profesionalId]);
```

### 5.2 Validar disponibilidad antes de crear/mover
```js
const checkDisponibilidad = async (profesional_id, inicioISO, finISO, cita_id = null) => {
  const url = new URL('/api/agenda/disponibilidad', window.location.origin);
  url.searchParams.append('profesional_id', profesional_id);
  url.searchParams.append('inicio', inicioISO);
  url.searchParams.append('fin', finISO);
  if (cita_id) url.searchParams.append('cita_id', cita_id);
  const res = await fetch(url);
  const json = await res.json();
  return json; // { success, disponible, conflictos }
};
```

### 5.3 Crear cita (POST)
```js
const crearCita = async (payload) => {
  const res = await fetch('/api/citas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
};
```

### 5.4 Mover cita (PUT)
```js
const moverCita = async (id, inicioISO, finISO) => {
  const res = await fetch(`/api/citas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inicio: inicioISO, fin: finISO })
  });
  return await res.json();
};
```

### 5.5 Generar sesiones desde plan
```js
const generarSesiones = async (planId, body) => {
  const res = await fetch(`/api/planes/${planId}/generar-sesiones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
};
```

### 5.6 Completar cita
```js
const completarCita = async (id, notas) => {
  const res = await fetch(`/api/citas/${id}/completar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notas })
  });
  return await res.json();
};
```

---

## 6) Manejo de errores y UX

- Mostrar mensajes claros cuando `checkDisponibilidad` devuelve `disponible: false` y listar `conflictos`.
- En `generar-sesiones`, mostrar un modal con el resumen: `X citas creadas` y `Y conflictos` (si implementas verificación previa).
- Mientras se crea una cita, deshabilitar controles para evitar doble envío.
- Mostrar loading states y toasts de éxito/error.

---

## 7) Consideraciones de zona horaria

- El backend usa `TIMESTAMPTZ` (UTC). El frontend debe convertir a la zona del usuario para mostrar en el calendario.
- Enviar siempre ISO strings con offset o en UTC. Ejemplo: `2025-12-15T10:00:00Z` o local con `new Date().toISOString()`.

---

## 8) Preguntas frecuentes

Q: ¿Por qué recibo error `violates foreign key constraint "citas_profesional_id_fkey"`?
A: Porque el `profesional_id` que envías no existe en la tabla `profesionales`. Debes crear el profesional primero.

Q: ¿Cómo evito solapamientos al generar sesiones automáticamente?
A: Implementa en el frontend la verificación de disponibilidad por fecha/hora o solicita al backend que lo haga dentro de una transacción (recomendado).

---

## 9) Checklist de implementación frontend (rápida)
- [ ] Integrar FullCalendar y mapear evento con `GET /api/citas/calendario`
- [ ] Implementar `checkDisponibilidad` antes de crear o mover una cita
- [ ] Implementar `CitaModal` para crear cita desde detalle del paciente
- [ ] Añadir `Generar sesiones` en `PlanDetail` y mostrar resumen de citas creadas
- [ ] Implementar `Completar cita` y actualizar vista de progreso del plan

---

Si quieres, puedo:
- Generar componentes React más detallados (ficheros) usando esta guía
- Añadir validación automática en `generar-sesiones` en el backend (verificar disponibilidad y devolver conflictos)

Dime cuál quieres que priorice y lo implemento.