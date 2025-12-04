# FisioLab API – Rutas para Frontend

Base URL: `http://localhost:3001/api`

Notas generales
- Auth está presente pero, salvo `/api/auth/me`, las demás rutas no requieren token por ahora.
- CORS permitido para `http://localhost:3000`.
- Respuesta estándar en la mayoría de endpoints: `{ success: boolean, data?: any, message?: string }`.

## Auth
- POST `/auth/register` – Registrar usuario
  - Body: `{ email, password, nombre, apellido, avatar_url? }`
  - 201 → `{ success, data: { user, token } }`
- POST `/auth/login` – Login
  - Body: `{ email, password }`
  - 200 → `{ success, data: { user, token } }`
- GET `/auth/me` – Usuario autenticado (requiere Bearer token)
  - 200 → `{ success, data: { user } }`

## Pacientes
La historia clínica está consolidada con los datos del paciente. Los antecedentes y notas se almacenan directamente en la tabla pacientes.

- GET `/pacientes` – Listar
  - Query: `q?` (busca por nombres/apellidos/documento)
  - 200 → `[{ id, nombres, apellidos, tipo_documento, documento, celular, email, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas, activo }]`
- POST `/pacientes` – Crear paciente con datos personales y antecedentes
  - Body: `{ nombres, apellidos, tipo_documento='DNI', documento?, celular?, email?, direccion?, fecha_nacimiento?, sexo?, edad?, emergencia_nombre?, emergencia_telefono?, antecedentes?, notas? }`
  - Notas: 
    - `sexo` acepta `M|F|O` o palabras `masculino|femenino|otro` (normaliza a `M|F|O`).
    - `tipo_documento` se normaliza a mayúsculas y por defecto es `DNI`.
    - `antecedentes` es un array de strings (se almacena como JSONB). Valores posibles: 'Cáncer', 'Hemopatías', 'Diabetes', 'Insuficiencia Renal', 'Cardiopatías', 'Endocarditis', 'Hipertensión', 'Marcapasos', 'Dispositivos Cardíacos', 'Heridas', 'Enfermedades de la piel', 'Trombosis', 'Hemorragias Activas', 'Epilepsias', 'Implantes Metálicos', 'Alteración de la sensibilidad', 'Tuberculosis', 'Bronquitis'.
    - `notas` es texto libre para información adicional del paciente.
  - 201 → paciente creado con todos sus campos
- GET `/pacientes/{id}` – Obtener por ID
  - 200 → `{ id, nombres, apellidos, tipo_documento, documento, celular, email, direccion, fecha_nacimiento, sexo, edad, emergencia_nombre, emergencia_telefono, antecedentes, notas, activo }`
- PUT `/pacientes/{id}` – Actualizar paciente (incluyendo antecedentes y notas)
  - Body: parciales de los campos del paciente (incluyendo `antecedentes` y `notas`)
  - 200 → paciente actualizado
- GET `/pacientes/{id}/evaluaciones` – Listar evaluaciones fisioterapéuticas del paciente
  - 200 → Array de evaluaciones ordenadas por fecha descendente

## Evaluaciones Fisioterapéuticas
Cada paciente puede tener múltiples evaluaciones a lo largo del tiempo (ej: esguince tobillo 01/12/2025, fractura brazo 09/11/2026).

- GET `/evaluaciones` – Listar todas las evaluaciones
  - Query: `paciente_id?` (filtrar por paciente)
  - 200 → Array de evaluaciones con datos del paciente
- POST `/evaluaciones` – Crear evaluación fisioterapéutica
  - Body: `{ paciente_id, fecha_evaluacion?, profesion?, tipo_trabajo?, sedestacion_prolongada?, esfuerzo_fisico?, motivo_consulta?, desde_cuando?, asimetria?, atrofias_musculares?, inflamacion?, equimosis?, edema?, otros_hallazgos?, observaciones_inspeccion?, contracturas?, irradiacion?, hacia_donde?, intensidad?, sensacion?, limitacion_izquierdo?, limitacion_derecho?, crujidos?, amplitud_movimientos?, diagnostico?, tratamientos_anteriores? }`
  - Notas:
    - `paciente_id` es **requerido**
    - `fecha_evaluacion` por defecto es NOW()
    - Todos los demás campos son opcionales
  - 201 → Evaluación creada
- GET `/evaluaciones/{id}` – Obtener evaluación por ID
  - 200 → Evaluación con datos del paciente
- PUT `/evaluaciones/{id}` – Actualizar evaluación
  - Body: parciales de los campos de la evaluación
  - 200 → Evaluación actualizada
- DELETE `/evaluaciones/{id}` – Eliminar evaluación
  - 204 → Evaluación eliminada

## Profesionales
- GET `/profesionales` – Listar
  - Query: `activo?`, `q?`
- POST `/profesionales` – Crear
  - Body: `{ nombre, apellido, documento?, telefono?, especialidad?, color_agenda?, comision_porcentaje? }`
- GET `/profesionales/{id}` – Obtener por ID
- PUT `/profesionales/{id}` – Actualizar
- DELETE `/profesionales/{id}` – Desactivar (soft delete)

## Recursos
- GET `/recursos` – Listar
  - Query: `tipo?` (sala, camilla, equipo)
- POST `/recursos` – Crear
  - Body: `{ nombre, tipo, descripcion? }`
- PUT `/recursos/{id}` – Actualizar

## Citas
- GET `/citas` – Listar
  - Query: `desde?`, `hasta?` (date-time ISO), `profesional_id?`, `paciente_id?`
- GET `/citas/calendario` – Eventos para calendario
- POST `/citas` – Crear
  - Body: `Cita` `{ paciente_id, inicio, fin, titulo?, estado?, profesional_id?, recurso_id? }`
- POST `/citas/bulk` – Crear varias citas
  - Body: `{ items: Cita[] }`
- PUT `/citas/{id}` – Actualizar
- DELETE `/citas/{id}` – Eliminar

## Planes de tratamiento
- GET `/pacientes/{id}/planes` – Listar planes de un paciente
- POST `/pacientes/{id}/planes` – Crear plan para paciente
  - Body: `{ objetivo, sesiones_plan, notas?, activo? }`
- PUT `/planes/{id}` – Actualizar plan

## Sesiones
- POST `/sesiones` – Crear sesión
  - Body: `{ cita_id?, paciente_id, profesional_id, fecha, notas?, estado }`
- GET `/sesiones/{id}` – Obtener sesión
- PUT `/sesiones/{id}` – Actualizar sesión
- POST `/sesiones/{id}/evaluacion` – Registrar evaluación fisioterapéutica
  - Body: objeto libre con evaluación

## Archivos
- POST `/pacientes/{id}/archivos` – Subir archivo (multipart/form-data)
  - Campo: `file` (binary)
- DELETE `/archivos/{id}` – Eliminar archivo

## Pagos
- GET `/pacientes/{id}/pagos` – Listar pagos
- POST `/pagos` – Registrar pago
  - Body: `{ paciente_id, concepto, monto, moneda, fecha, medio? }`

## Certificados
- GET `/pacientes/{id}/certificados` – Listar certificados del paciente
- POST `/certificados` – Crear certificado
  - Body: `{ paciente_id, tipo, emitido_en? }`
- GET `/certificados/{id}/pdf` – Descargar PDF

## Dashboard
- GET `/dashboard/resumen` – KPIs (citas, pacientes, ingresos)
- GET `/dashboard/ingresos-mes` – Serie de ingresos
  - Query: `year?`

## Reportes
- GET `/reportes/ocupacion` – Ocupación de recursos/profesionales
  - Query: `desde?`, `hasta?` (date-time ISO)

---

Para contratos completos (esquemas y ejemplos), consulta Swagger en `http://localhost:3001/api/docs`. Si necesitas ejemplos de payload específicos o cambios de contrato, dímelo y los agrego aquí.