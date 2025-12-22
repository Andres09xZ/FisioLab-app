# Gestión de Citas y Agenda (Calendario)

Este documento explica cómo funciona la lógica de gestión de citas en el backend y cómo deben organizarse en el calendario (FullCalendar u otra librería similar).

## Objetivos
- Aclarar las relaciones entre tablas: `citas`, `sesiones`, `planes_tratamiento`.
- Explicar los endpoints implicados en el flujo de agenda.
- Mostrar cómo mapear cada cita al formato que necesita FullCalendar.
- Señalar validaciones y mejoras recomendadas (anti-solapamiento, reserva de recursos, duración, etc.).

---

## Tablas clave y campos relevantes

- `citas`
  - id (UUID)
  - paciente_id (UUID)
  - profesional_id (UUID)
  - recurso_id (UUID) (opcional)
  - inicio (TIMESTAMPTZ) — fecha/hora de inicio
  - fin (TIMESTAMPTZ) — fecha/hora de fin
  - titulo (text)
  - estado (text) — valores: `programada`, `completada`, `cancelada`
  - notas

- `sesiones`
  - id (UUID)
  - plan_id (UUID) — FK a `planes_tratamiento`
  - cita_id (UUID) — vincula la sesión con la cita creada en `citas`
  - paciente_id (UUID)
  - profesional_id (UUID)
  - fecha_sesion (TIMESTAMPTZ)
  - estado (text) — `programada`, `completada`, `cancelada`
  - notas

- `planes_tratamiento`
  - id (UUID)
  - paciente_id (UUID)
  - evaluacion_id (UUID)
  - sesiones_plan (integer)
  - sesiones_completadas (integer)
  - estado (text) — `activo`, `completado`, `cancelado`

---

## Endpoints principales y responsabilidad

1. GET `/api/citas/calendario`
   - Devuelve eventos (citas) listos para FullCalendar.
   - Query params típicos: `desde`, `hasta`, `profesional_id`.
   - Respuesta: lista de objetos con `id`, `title`, `start`, `end`, `estado`.

2. POST `/api/citas`
   - Crea directamente una cita.
   - Body mínimo requerido: `{ paciente_id, inicio, fin }` (también puede incluir `profesional_id`, `titulo`, `recurso_id`).
   - Nota: actualmente la inserción no valida automáticamente disponibilidad; recomendamos llamar a la verificación antes de insertar.

3. PUT `/api/citas/{id}`
   - Actualiza/ mueve una cita (drag & drop). Body típico `{ inicio, fin }`.
   - Debe validar solapamientos (excluir la misma cita usando su id).

4. GET `/api/agenda/disponibilidad`
   - Verifica anti-solapamiento: retorna `disponible: true/false` y lista de `conflictos` si existen.
   - Query required: `profesional_id`, `inicio`, `fin`.
   - Útil para el frontend antes de crear o mover una cita.

5. POST `/api/planes/{id}/generar-sesiones`
   - Calcula las fechas según `fecha_inicio`, `dias_semana`, `hora`, `duracion_minutos` y el número de sesiones restantes del plan.
   - Para cada sesión genera:
     1) una **cita** en la tabla `citas` (para mostrar en calendario)
     2) una **sesión** en `sesiones` vinculada mediante `cita_id`
   - Respuesta: sesiones creadas + IDs de citas creadas.
   - IMPORTANTE: Si el `profesional_id` no existe, la inserción fallará por FK. También, si hay solapamientos, actualmente no hay verificación previa — la inserción fallará si existen constraints o si tu lógica lo verifica.

6. GET `/api/planes/{id}/sesiones`
   - Lista sesiones del plan. Incluye `cita_id` para asociar con el evento del calendario.

7. PUT `/api/citas/{id}/completar`
   - Marca la cita como completada, marca la sesión asociada como completada y actualiza `sesiones_completadas` en el plan.
   - Si con ello se alcanza `sesiones_plan`, actualiza el plan a `completado`.

---

## Flujo típico (ejemplo)

1. Frontend abre detalle del paciente.
2. Consulta `GET /pacientes/{id}/evaluaciones` y si elige una evaluación crea plan con `POST /evaluaciones/{evaluacion_id}/planes`.
3. Para el plan creado, frontend envía `POST /api/planes/{plan_id}/generar-sesiones` con `{ fecha_inicio, dias_semana, hora, profesional_id, duracion_minutos }`.
4. Backend genera citas y sesiones; frontend obtiene listas de eventos a través de `GET /api/citas/calendario?desde=...&profesional_id=...`.
5. Usuario en calendario puede mover cita (drag & drop) lo que llama `PUT /api/citas/{id}` — backend debe validar disponibilidad (excluir la cita que se está moviendo).
6. Cuando la sesión/cita se realiza, frontend llama `PUT /api/citas/{id}/completar` para marcar la sesión y actualizar el progreso del plan.

---

## Cómo mapear eventos para FullCalendar

FullCalendar (ejemplo) espera objetos con campos como:
- id (string)
- title (string)
- start (ISO datetime)
- end (ISO datetime)
- extendedProps (obj) — puedes pasar `estado`, `profesional_id`, `paciente_id`, `cita_id`, etc.

Ejemplo de transformación en el backend (lo que hace `listCalendario`):
```js
// Cada fila de 'citas' se convierte en:
{
  id: row.id,
  title: row.titulo || 'Sesión',
  start: row.inicio, // ISO
  end: row.fin,      // ISO
  extendedProps: { estado: row.estado }
}
```

Sugerencias de UI:
- Usar color por `estado` (programada=azul, completada=verde, cancelada=gris).
- Si tu tabla `profesionales` tiene `color_agenda`, añadir `backgroundColor`/`borderColor` por evento.
- Mostrar `paciente` y `profesional` en la `tooltip` o `eventRender`.

---

## Reglas anti-solapamiento (disponibilidad)

La función `checkDisponibilidad` implementa la regla clave: una cita A `(inicioA, finA)` se solapa con B `(inicioB, finB)` si:
```
inicioA < finB AND finA > inicioB
```
Por eso la consulta usa:
```
WHERE profesional_id = $1
AND ((inicio < $fin AND fin > $inicio))
AND estado != 'cancelada'
```

Puntos a tener en cuenta:
- Al mover una cita, debes excluir la misma cita por id (`AND id != $cita_id`).
- También deberías considerar el `recurso_id` (sala/camilla) si lo usan: bloquear por `recurso_id` también.
- Validar solapamiento antes de insertar evita errores e intentar hacer rollbacks después.

---

## Errores comunes y por qué ocurren

1. `violates foreign key constraint "citas_profesional_id_fkey"`
   - Ocurre cuando `profesional_id` pasado no existe en `profesionales`. Crear el profesional o usar un id válido.

2. Inserciones que fallan por solapamiento
   - Si tu lógica inserta sin verificar disponibilidad y hay una restricción/business rule, la base puede rechazar o terminar con conflictos.

3. Generación de sesiones genera muchas columnas antiguas/nuevas en la respuesta
   - Sucede si la tabla `sesiones` conserva columnas de versiones previas; migraciones deben unificar el esquema.

---

## Recomendaciones y mejoras

1. Antes de crear una cita (o antes de `INSERT` en `generar-sesiones`) llamar a `checkDisponibilidad` para validar y evitar errores en bloqueos por FK o conflictos.

2. En `POST /api/planes/{id}/generar-sesiones`:
   - Validar `profesional_id` existe.
   - Validar disponibilidad para cada `fecha_inicio` calculada; si hay conflicto devolver `conflictos` y no insertar nada (transacción).
   - Permitir `modo: "force"` para sobreescribir/agendar igualmente (solo si tu negocio lo requiere).

3. Mantener `sesiones` y `citas` en transacción: si falla la creación de cita o sesión, hacer ROLLBACK para no dejar datos incoherentes.

4. Añadir índices en `citas` sobre `(profesional_id, inicio, fin)` para acelerar consultas de disponibilidad.

5. Soporte de zona horaria: almacenar todo en UTC (TIMESTAMPTZ) y convertir en frontend según zona del usuario.

---

## Ejemplos rápidos (cURL)

- Comprobar disponibilidad:
```bash
curl "http://localhost:3001/api/agenda/disponibilidad?profesional_id=PROF_ID&inicio=2025-12-15T10:00:00&fin=2025-12-15T10:45:00"
```

- Crear cita:
```bash
curl -X POST http://localhost:3001/api/citas \
  -H 'Content-Type: application/json' \
  -d '{"paciente_id":"PAC_ID","profesional_id":"PROF_ID","inicio":"2025-12-15T10:00:00","fin":"2025-12-15T10:45:00","titulo":"Sesión"}'
```

- Mover cita (drag & drop):
```bash
curl -X PUT http://localhost:3001/api/citas/CITA_ID \
  -H 'Content-Type: application/json' \
  -d '{"inicio":"2025-12-15T11:00:00","fin":"2025-12-15T11:45:00"}'
```

- Generar sesiones y citas para un plan:
```bash
curl -X POST http://localhost:3001/api/planes/PLAN_ID/generar-sesiones \
  -H 'Content-Type: application/json' \
  -d '{"fecha_inicio":"2025-12-04","dias_semana":[1,3,5],"hora":"10:00","profesional_id":"PROF_ID","duracion_minutos":45}'
```

- Completar cita:
```bash
curl -X PUT http://localhost:3001/api/citas/CITA_ID/completar \
  -H 'Content-Type: application/json' \
  -d '{"notas":"Sesion realizada correctamente"}'
```

---

## Checklist técnico para el equipo
- [x] `GET /api/citas/calendario` devuelve eventos listos para FullCalendar.
- [x] `POST /api/planes/{id}/generar-sesiones` crea citas + sesiones vinculadas (cita_id).
- [x] `GET /api/planes/{id}/sesiones` incluye `cita_id` para asociar con eventos.
- [x] `PUT /api/citas/{id}/completar` actualiza cita, sesión y progreso del plan.
- [ ] Mejorar `generar-sesiones` para validar disponibilidad antes de insertar (recomendado).
- [ ] Agregar pruebas unitarias que cubran generación de sesiones y validación de solapamiento.

---

## Dónde está el código relevante
- Controlador de citas: `src/controllers/citas.controller.js`
- Rutas de citas: `src/routes/citas.routes.js`
- Controlador de planes (generación de sesiones): `src/controllers/planes.controller.js`
- Migraciones / esquema relacionado: `src/db/migrations.js`

---

Si quieres, puedo:
- Implementar la validación de disponibilidad dentro de `generar-sesiones` (hacerlo transaccional y devolver conflictos si existen), o
- Añadir ejemplos de pruebas automatizadas para estos endpoints.

Dime cuál prefieres y lo implemento a continuación.
