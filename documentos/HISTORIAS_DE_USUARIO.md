# 📚 Historias de Usuario - FisioLab

## 📋 Índice de Contenidos

1. [Historias de Autenticación](#-historias-de-autenticación)
2. [Historias de Gestión de Pacientes](#-historias-de-gestión-de-pacientes)
3. [Historias de Evaluaciones](#-historias-de-evaluaciones)
4. [Historias de Planes de Tratamiento](#-historias-de-planes-de-tratamiento)
5. [Historias de Sesiones](#-historias-de-sesiones)
6. [Historias de Agenda y Citas](#-historias-de-agenda-y-citas)
7. [Historias de Profesionales](#-historias-de-profesionales)
8. [Historias de Recursos](#-historias-de-recursos)
9. [Historias de Pagos y Facturación](#-historias-de-pagos-y-facturación)
10. [Historias de Reportes y Dashboard](#-historias-de-reportes-y-dashboard)
11. [Historias de Certificados](#-historias-de-certificados)
12. [Historias de Notificaciones](#-historias-de-notificaciones)

---

## 🔐 Historias de Autenticación

### US001: Registro de Usuario
**Como** un nuevo usuario (administrador, profesional o recepcionista)  
**Quiero** crear una cuenta en el sistema  
**Para** acceder a FisioLab con mis credenciales

**Criterios de Aceptación:**
- ✅ Poder registrar usuario con email y contraseña
- ✅ Validar que el email no esté registrado previamente
- ✅ Encriptar la contraseña antes de guardar
- ✅ Incluir datos personales (nombre, apellido, avatar)
- ✅ Recibir token JWT tras el registro exitoso

**Endpoint:** `POST /auth/register`

---

### US002: Inicio de Sesión
**Como** usuario registrado  
**Quiero** iniciar sesión con mis credenciales  
**Para** acceder a mi cuenta en el sistema

**Criterios de Aceptación:**
- ✅ Validar credenciales correctas (email y contraseña)
- ✅ Generar token JWT válido
- ✅ Mostrar datos de usuario autenticado
- ✅ Redirigir a dashboard tras login exitoso
- ✅ Mantener sesión activa mientras el token sea válido

**Endpoint:** `POST /auth/login`

---

### US003: Validar Sesión Activa
**Como** usuario autenticado  
**Quiero** verificar que mi sesión sigue activa  
**Para** mantener la seguridad y validez de mis acciones

**Criterios de Aceptación:**
- ✅ Validar token JWT en cada solicitud
- ✅ Retornar datos del usuario autenticado
- ✅ Rechazar solicitudes sin token válido
- ✅ Permitir logout seguro

**Endpoint:** `GET /auth/me`

---

## 👥 Historias de Gestión de Pacientes

### US004: Crear Nuevo Paciente
**Como** recepcionista o administrador  
**Quiero** registrar un nuevo paciente en el sistema  
**Para** iniciar el seguimiento de su atención médica

**Criterios de Aceptación:**
- ✅ Registrar datos personales completos (nombre, apellido, documento, contacto)
- ✅ Registrar información médica (antecedentes, alergias, condiciones)
- ✅ Registrar datos de emergencia (contacto de emergencia, teléfono)
- ✅ Registrar información ocupacional (profesión, tipo de trabajo)
- ✅ Validar documento único por paciente
- ✅ Almacenar género y fecha de nacimiento
- ✅ Cálculo automático de edad

**Endpoint:** `POST /pacientes`

---

### US005: Listar Pacientes
**Como** profesional de salud o recepcionista  
**Quiero** ver la lista de pacientes del sistema  
**Para** buscar y seleccionar al paciente a atender

**Criterios de Aceptación:**
- ✅ Mostrar lista completa de pacientes activos
- ✅ Buscar por nombres, apellidos o documento
- ✅ Mostrar solo pacientes activos por defecto
- ✅ Paginación de resultados (si aplica)
- ✅ Ordenar alfabéticamente

**Endpoint:** `GET /pacientes?q=busqueda`

---

### US006: Ver Detalle de Paciente
**Como** profesional de salud  
**Quiero** ver todos los detalles de un paciente específico  
**Para** conocer su historial médico y personal completo

**Criterios de Aceptación:**
- ✅ Mostrar todos los datos personales del paciente
- ✅ Mostrar antecedentes médicos
- ✅ Mostrar datos de contacto y emergencia
- ✅ Mostrar información ocupacional
- ✅ Mostrar historial de evaluaciones
- ✅ Mostrar planes de tratamiento activos
- ✅ Mostrar sesiones realizadas y pendientes

**Endpoint:** `GET /pacientes/{id}`

---

### US007: Actualizar Datos de Paciente
**Como** recepcionista o profesional  
**Quiero** actualizar la información de un paciente  
**Para** mantener sus datos actualizados en el sistema

**Criterios de Aceptación:**
- ✅ Poder actualizar datos personales
- ✅ Poder actualizar antecedentes médicos
- ✅ Poder actualizar notas clínicas
- ✅ Poder actualizar información de contacto
- ✅ Validar cambios en documento (debe ser único)

**Endpoint:** `PUT /pacientes/{id}`

---

### US008: Desactivar Paciente
**Como** administrador  
**Quiero** desactivar el registro de un paciente  
**Para** mantener el historial pero indicar que no está activo

**Criterios de Aceptación:**
- ✅ Poder marcar un paciente como inactivo
- ✅ Los pacientes inactivos no aparecen en la lista por defecto
- ✅ Poder reactivar un paciente si es necesario
- ✅ Mantener el historial del paciente

**Endpoint:** `PUT /pacientes/{id}` (activo: false)

---

## 📋 Historias de Evaluaciones

### US009: Crear Evaluación Fisioterapéutica
**Como** fisioterapeuta  
**Quiero** crear una evaluación completa para un paciente  
**Para** documentar su estado inicial y establecer diagnóstico

**Criterios de Aceptación:**
- ✅ Registrar motivo de consulta
- ✅ Registrar tiempo de evolución del problema
- ✅ Evaluar dolor con escala EVA (0-10)
- ✅ Registrar hallazgos clínicos (contracturas, edema, inflamación, etc.)
- ✅ Evaluar amplitud de movimiento (ROM)
- ✅ Registrar limitaciones funcionales
- ✅ Documentar diagnóstico fisioterapéutico
- ✅ Registrar tratamientos anteriores
- ✅ Crear evaluación con fecha automática

**Endpoint:** `POST /evaluaciones`

---

### US010: Ver Historial de Evaluaciones
**Como** fisioterapeuta  
**Quiero** ver todas las evaluaciones de un paciente  
**Para** seguir su progreso a lo largo del tiempo

**Criterios de Aceptación:**
- ✅ Listar evaluaciones ordenadas por fecha (más reciente primero)
- ✅ Mostrar motivo de consulta y diagnóstico
- ✅ Mostrar escala EVA (dolor)
- ✅ Poder filtrar por paciente específico
- ✅ Mostrar fecha de cada evaluación

**Endpoint:** `GET /pacientes/{id}/evaluaciones` o `GET /evaluaciones?paciente_id={id}`

---

### US011: Actualizar Evaluación
**Como** fisioterapeuta  
**Quiero** modificar una evaluación realizada  
**Para** corregir datos o agregar información faltante

**Criterios de Aceptación:**
- ✅ Poder editar cualquier campo de la evaluación
- ✅ Conservar la fecha original de evaluación
- ✅ Registrar cambios realizados
- ✅ Validar integridad de datos

**Endpoint:** `PUT /evaluaciones/{id}`

---

### US012: Eliminar Evaluación
**Como** administrador o fisioterapeuta  
**Quiero** eliminar una evaluación errónea  
**Para** mantener la integridad del historial

**Criterios de Aceptación:**
- ✅ Poder eliminar evaluación con confirmación
- ✅ Registrar auditoría de eliminación
- ✅ Impedir eliminación si hay plan asociado

**Endpoint:** `DELETE /evaluaciones/{id}`

---

## 🎯 Historias de Planes de Tratamiento

### US013: Crear Plan de Tratamiento
**Como** fisioterapeuta  
**Quiero** crear un plan de tratamiento personalizado para un paciente  
**Para** establecer objetivos y duración del tratamiento

**Criterios de Aceptación:**
- ✅ Vincular el plan a una evaluación específica
- ✅ Definir objetivos terapéuticos claros
- ✅ Especificar número total de sesiones (5, 10, 12, etc.)
- ✅ Indicar frecuencia de sesiones (1-3 veces por semana)
- ✅ Establecer estado inicial (activo, pausado, completado)
- ✅ Registrar observaciones sobre el plan
- ✅ Generar automáticamente las sesiones

**Endpoint:** `POST /evaluaciones/{evaluacion_id}/planes` o `POST /pacientes/{id}/planes`

---

### US014: Ver Planes de Tratamiento del Paciente
**Como** fisioterapeuta  
**Quiero** ver todos los planes de un paciente  
**Para** revisar su historial de tratamientos

**Criterios de Aceptación:**
- ✅ Listar planes activos y completados
- ✅ Mostrar objetivos y duración
- ✅ Mostrar progreso (sesiones completadas/total)
- ✅ Mostrar fechas de inicio y fin
- ✅ Ordenar por fecha de creación

**Endpoint:** `GET /pacientes/{id}/planes`

---

### US015: Actualizar Plan de Tratamiento
**Como** fisioterapeuta  
**Quiero** modificar un plan de tratamiento en curso  
**Para** adaptar el tratamiento según el progreso

**Criterios de Aceptación:**
- ✅ Poder cambiar objetivos del plan
- ✅ Poder extender o reducir número de sesiones
- ✅ Poder cambiar estado (activo, pausado, completado)
- ✅ Poder agregar observaciones
- ✅ Registrar historial de cambios

**Endpoint:** `PUT /planes/{id}`

---

### US016: Ver Detalles de Plan Específico
**Como** fisioterapeuta  
**Quiero** ver el detalle completo de un plan de tratamiento  
**Para** revisar objetivos, sesiones y progreso

**Criterios de Aceptación:**
- ✅ Mostrar información completa del plan
- ✅ Mostrar evaluación asociada
- ✅ Mostrar lista de sesiones (realizadas y pendientes)
- ✅ Mostrar progreso en porcentaje
- ✅ Permitir agregar ejercicios al plan

**Endpoint:** `GET /planes/{id}`

---

### US017: Generar Sesiones Automáticamente
**Como** sistema  
**Quiero** crear automáticamente las sesiones de un plan  
**Para** facilitar la agenda del tratamiento

**Criterios de Aceptación:**
- ✅ Generar N sesiones según lo planificado
- ✅ Distribuir sesiones según frecuencia especificada
- ✅ Crear sesiones en estado "pendiente"
- ✅ Permitir generación manual de sesiones faltantes
- ✅ Evitar duplicados de sesiones

**Endpoint:** `POST /planes/{id}/generar-sesiones`

---

## 🏥 Historias de Sesiones

### US018: Crear Sesión de Tratamiento
**Como** fisioterapeuta  
**Quiero** crear una sesión de tratamiento para un paciente  
**Para** documentar el trabajo realizado en cada sesión

**Criterios de Aceptación:**
- ✅ Vincular sesión a plan de tratamiento
- ✅ Registrar fecha y hora de sesión
- ✅ Registrar ejercicios realizados
- ✅ Registrar técnicas aplicadas (masaje, estiramiento, etc.)
- ✅ Registrar evolución del paciente
- ✅ Permitir cargar archivos (fotos, videos)
- ✅ Calcular duración de la sesión
- ✅ Marcar como completada

**Endpoint:** `POST /sesiones`

---

### US019: Ver Sesiones de Tratamiento
**Como** fisioterapeuta  
**Quiero** ver todas las sesiones de un paciente o plan  
**Para** revisar el historial de tratamiento

**Criterios de Aceptación:**
- ✅ Listar sesiones por paciente
- ✅ Listar sesiones por plan
- ✅ Mostrar estado (pendiente, realizada, cancelada)
- ✅ Mostrar fecha y profesional responsable
- ✅ Filtrar por rango de fechas
- ✅ Mostrar resumen de actividades

**Endpoint:** `GET /sesiones` o `GET /planes/{id}/sesiones`

---

### US020: Registrar Evolución en Sesión
**Como** fisioterapeuta  
**Quiero** registrar notas de evolución durante la sesión  
**Para** documentar el progreso del paciente

**Criterios de Aceptación:**
- ✅ Agregar notas sobre el estado del paciente
- ✅ Registrar dolor actual (escala EVA)
- ✅ Documentar cambios en amplitud de movimiento
- ✅ Registrar adherencia del paciente
- ✅ Registrar ejercicios realizados
- ✅ Poder adjuntar documentos o evidencia

**Endpoint:** `PUT /sesiones/{id}` o `POST /sesiones/{id}/notas`

---

### US021: Ver Sesiones Pendientes
**Como** paciente  
**Quiero** ver mis sesiones pendientes  
**Para** saber cuáles son los próximos tratamientos

**Criterios de Aceptación:**
- ✅ Mostrar solo sesiones del paciente autenticado
- ✅ Mostrar fecha, hora y profesional
- ✅ Mostrar duración estimada
- ✅ Mostrar plan asociado
- ✅ Permitir acceso con token público

**Endpoint:** `GET /sesiones/pendientes/{paciente_id}`

---

### US022: Asignar Cita a Sesión
**Como** sistema  
**Quiero** vincular una cita programada a una sesión  
**Para** mantener consistencia entre agenda y sesiones

**Criterios de Aceptación:**
- ✅ Validar que la cita corresponda al mismo paciente
- ✅ Validar que la cita no esté asignada a otra sesión
- ✅ Actualizar estado de sesión
- ✅ Registrar horario confirmado
- ✅ Permitir desasignación si es necesario

**Endpoint:** `POST /sesiones/{id}/asignar-cita`

---

## 📅 Historias de Agenda y Citas

### US023: Crear Cita
**Como** recepcionista o profesional  
**Quiero** agendar una cita para un paciente  
**Para** coordinar la atención con el profesional y paciente

**Criterios de Aceptación:**
- ✅ Registrar paciente, profesional y recurso (sala)
- ✅ Especificar fecha, hora de inicio y fin
- ✅ Validar que no haya conflictos de horarios
- ✅ Validar disponibilidad del profesional
- ✅ Validar disponibilidad del recurso
- ✅ Permitir agregar título/descripción
- ✅ Crear cita en estado "confirmada"

**Endpoint:** `POST /citas`

---

### US024: Ver Calendario
**Como** profesional o recepcionista  
**Quiero** ver el calendario de citas  
**Para** visualizar la agenda de atención

**Criterios de Aceptación:**
- ✅ Mostrar calendario visual (mes, semana, día)
- ✅ Mostrar citas codificadas por color según profesional
- ✅ Filtrar por profesional, recurso o paciente
- ✅ Mostrar detalles en popover/modal
- ✅ Permitir cambiar vista (semana, mes)
- ✅ Indicar disponibilidad de recursos

**Endpoint:** `GET /citas/calendario?desde=&hasta=`

---

### US025: Listar Citas
**Como** profesional o recepcionista  
**Quiero** listar las citas en formato tabla  
**Para** tener una vista rápida y filtrable

**Criterios de Aceptación:**
- ✅ Mostrar todas las citas en rango de fechas
- ✅ Filtrar por profesional
- ✅ Filtrar por paciente
- ✅ Filtrar por estado
- ✅ Ordenar por fecha/hora
- ✅ Mostrar columnas relevantes (paciente, profesional, hora, estado)

**Endpoint:** `GET /citas?desde=&hasta=&profesional_id=`

---

### US026: Modificar Cita
**Como** recepcionista o profesional  
**Quiero** cambiar fecha u hora de una cita  
**Para** ajustar horarios según disponibilidad

**Criterios de Aceptación:**
- ✅ Poder cambiar fecha y hora
- ✅ Validar conflictos en nueva fecha/hora
- ✅ Actualizar estado si aplica
- ✅ Registrar cambios realizados
- ✅ Enviar notificación al paciente

**Endpoint:** `PUT /citas/{id}`

---

### US027: Cancelar Cita
**Como** recepcionista o profesional  
**Quiero** cancelar una cita agendada  
**Para** liberar horarios si el paciente cancela

**Criterios de Aceptación:**
- ✅ Cambiar estado a "cancelada"
- ✅ Registrar motivo de cancelación
- ✅ Liberar recurso y disponibilidad del profesional
- ✅ Notificar al paciente
- ✅ Mantener historial

**Endpoint:** `DELETE /citas/{id}` o `PUT /citas/{id}` (estado: cancelada)

---

### US028: Crear Múltiples Citas (Bulk)
**Como** recepcionista  
**Quiero** crear varias citas a la vez  
**Para** ahorrar tiempo en agenda de planes con múltiples sesiones

**Criterios de Aceptación:**
- ✅ Crear varias citas en una sola solicitud
- ✅ Validar conflictos para todas las citas
- ✅ Usar profesional y recurso comunes
- ✅ Retornar listado de citas creadas
- ✅ Mantener transacción (todo o nada)

**Endpoint:** `POST /citas/bulk`

---

## 👨‍⚕️ Historias de Profesionales

### US029: Crear Profesional
**Como** administrador  
**Quiero** registrar un nuevo profesional en el sistema  
**Para** que pueda comenzar a atender pacientes

**Criterios de Aceptación:**
- ✅ Registrar datos personales (nombre, apellido, documento)
- ✅ Especificar especialidad (fisioterapia general, deporte, etc.)
- ✅ Registrar teléfono de contacto
- ✅ Asignar color para identificación en agenda
- ✅ Definir porcentaje de comisión
- ✅ Crear estado activo inicialmente

**Endpoint:** `POST /profesionales`

---

### US030: Listar Profesionales
**Como** recepcionista  
**Quiero** ver la lista de profesionales disponibles  
**Para** asignar citas

**Criterios de Aceptación:**
- ✅ Mostrar profesionales activos
- ✅ Mostrar especialidad y contacto
- ✅ Filtrar por especialidad
- ✅ Búsqueda por nombre
- ✅ Mostrar disponibilidad actual

**Endpoint:** `GET /profesionales?q=&especialidad=`

---

### US031: Ver Detalles de Profesional
**Como** administrador  
**Quiero** ver información completa de un profesional  
**Para** revisar datos y desempeño

**Criterios de Aceptación:**
- ✅ Mostrar datos personales
- ✅ Mostrar especialidad y comisión
- ✅ Mostrar citas programadas
- ✅ Mostrar sesiones realizadas
- ✅ Mostrar estadísticas de pacientes atendidos

**Endpoint:** `GET /profesionales/{id}`

---

### US032: Actualizar Datos de Profesional
**Como** administrador  
**Quiero** modificar información de un profesional  
**Para** mantener datos actualizados

**Criterios de Aceptación:**
- ✅ Poder actualizar datos personales
- ✅ Poder cambiar especialidad
- ✅ Poder ajustar comisión
- ✅ Poder cambiar disponibilidad

**Endpoint:** `PUT /profesionales/{id}`

---

### US033: Desactivar Profesional
**Como** administrador  
**Quiero** desactivar a un profesional  
**Para** indicar que ya no trabaja en la clínica

**Criterios de Aceptación:**
- ✅ Cambiar estado a inactivo
- ✅ Reasignar o pausar citas pendientes
- ✅ Mantener historial
- ✅ Poder reactivar si es necesario

**Endpoint:** `DELETE /profesionales/{id}` o `PUT /profesionales/{id}` (activo: false)

---

## 🏥 Historias de Recursos

### US034: Crear Recurso (Sala, Camilla, Equipo)
**Como** administrador  
**Quiero** registrar un nuevo recurso en la clínica  
**Para** poder asignarlo a las citas

**Criterios de Aceptación:**
- ✅ Especificar tipo de recurso (sala, camilla, equipo)
- ✅ Asignar nombre descriptivo
- ✅ Agregar descripción detallada
- ✅ Indicar disponibilidad
- ✅ Crear estado activo

**Endpoint:** `POST /recursos`

---

### US035: Listar Recursos
**Como** recepcionista  
**Quiero** ver recursos disponibles  
**Para** asignarlos a citas

**Criterios de Aceptación:**
- ✅ Mostrar recursos disponibles
- ✅ Filtrar por tipo
- ✅ Mostrar disponibilidad actual
- ✅ Mostrar conflictos de horario

**Endpoint:** `GET /recursos?tipo=sala`

---

### US036: Actualizar Recurso
**Como** administrador  
**Quiero** modificar información de un recurso  
**Para** mantener datos actualizados

**Criterios de Aceptación:**
- ✅ Poder cambiar nombre y descripción
- ✅ Poder marcar como disponible/no disponible
- ✅ Registrar cambios

**Endpoint:** `PUT /recursos/{id}`

---

## 💰 Historias de Pagos y Facturación

### US037: Registrar Pago
**Como** recepcionista  
**Quiero** registrar un pago de un paciente  
**Para** actualizar el estado financiero

**Criterios de Aceptación:**
- ✅ Asociar pago a sesión o plan
- ✅ Especificar monto pagado
- ✅ Registrar método de pago (efectivo, tarjeta, transferencia)
- ✅ Registrar fecha de pago
- ✅ Generar comprobante
- ✅ Calcular automáticamente comisión del profesional

**Endpoint:** `POST /pagos`

---

### US038: Listar Pagos
**Como** administrador o contable  
**Quiero** ver todos los pagos registrados  
**Para** gestionar ingresos y comisiones

**Criterios de Aceptación:**
- ✅ Mostrar pagos por rango de fechas
- ✅ Filtrar por paciente o profesional
- ✅ Mostrar monto total de ingresos
- ✅ Mostrar desglose por método de pago
- ✅ Exportar listado

**Endpoint:** `GET /pagos?desde=&hasta=`

---

### US039: Generar Factura
**Como** recepcionista  
**Quiero** generar una factura para un pago  
**Para** proporcionar comprobante fiscal

**Criterios de Aceptación:**
- ✅ Crear factura automatizada
- ✅ Incluir datos del paciente y clínica
- ✅ Detallar servicios prestados
- ✅ Mostrar monto total
- ✅ Exportar como PDF

**Endpoint:** `GET /pagos/{id}/factura`

---

## 📊 Historias de Reportes y Dashboard

### US040: Ver Dashboard Principal
**Como** administrador o gestor  
**Quiero** ver un dashboard con métricas principales  
**Para** tener una visión general de la clínica

**Criterios de Aceptación:**
- ✅ Mostrar cantidad de pacientes activos
- ✅ Mostrar ingresos del mes
- ✅ Mostrar ocupación de profesionales
- ✅ Mostrar citas próximas
- ✅ Mostrar gráficos de ingresos
- ✅ Mostrar tareas pendientes
- ✅ Datos en tiempo real

**Endpoint:** `GET /dashboard/metricas`

---

### US041: Reporte de Ocupación
**Como** administrador  
**Quiero** ver el reporte de ocupación de salas y profesionales  
**Para** optimizar el uso de recursos

**Criterios de Aceptación:**
- ✅ Mostrar porcentaje de ocupación
- ✅ Mostrar horas disponibles vs utilizadas
- ✅ Filtrar por rango de fechas
- ✅ Comparar ocupación entre profesionales
- ✅ Identificar franjas horarias con bajo uso

**Endpoint:** `GET /reportes/ocupacion?desde=&hasta=`

---

### US042: Reporte de Ingresos
**Como** administrador o contable  
**Quiero** ver un reporte detallado de ingresos  
**Para** hacer seguimiento financiero

**Criterios de Aceptación:**
- ✅ Mostrar ingresos totales por período
- ✅ Desglose por profesional
- ✅ Desglose por método de pago
- ✅ Mostrar gráficos de tendencias
- ✅ Comparar períodos
- ✅ Exportar datos

**Endpoint:** `GET /reportes/ingresos?desde=&hasta=`

---

### US043: Reporte de Pacientes Atendidos
**Como** administrador  
**Quiero** ver cuántos pacientes fueron atendidos  
**Para** evaluar actividad de la clínica

**Criterios de Aceptación:**
- ✅ Mostrar cantidad de pacientes nuevos
- ✅ Mostrar cantidad de pacientes por sesión completada
- ✅ Filtrar por profesional
- ✅ Mostrar por período
- ✅ Visualizar tendencias

**Endpoint:** `GET /reportes/pacientes-atendidos?desde=&hasta=`

---

### US044: Reporte de Rendimiento de Profesionales
**Como** administrador  
**Quiero** ver el rendimiento de cada profesional  
**Para** evaluar desempeño y productividad

**Criterios de Aceptación:**
- ✅ Mostrar cantidad de sesiones realizadas
- ✅ Mostrar ingresos generados
- ✅ Mostrar comisiones calculadas
- ✅ Mostrar pacientes atendidos
- ✅ Mostrar tasa de asistencia

**Endpoint:** `GET /reportes/rendimiento-profesionales`

---

### US045: Reporte de Progreso de Planes
**Como** administrador o profesional  
**Quiero** ver el progreso de planes de tratamiento  
**Para** evaluar evolución de pacientes

**Criterios de Aceptación:**
- ✅ Mostrar planes en curso vs completados
- ✅ Mostrar porcentaje de sesiones realizadas
- ✅ Mostrar tiempo promedio de planes
- ✅ Identificar planes en riesgo
- ✅ Mostrar mejora en escala EVA

**Endpoint:** `GET /reportes/progreso-planes`

---

### US046: Reporte de Asistencia
**Como** administrador  
**Quiero** ver reporte de asistencia de pacientes  
**Para** identificar patrones de abandono

**Criterios de Aceptación:**
- ✅ Mostrar citas asistidas vs no asistidas
- ✅ Mostrar pacientes con alta tasa de inasistencia
- ✅ Mostrar cancelaciones
- ✅ Filtrar por período
- ✅ Alertar sobre patrones preocupantes

**Endpoint:** `GET /reportes/asistencia`

---

## 📜 Historias de Certificados

### US047: Registrar Certificado Profesional
**Como** administrador  
**Quiero** registrar los certificados de un profesional  
**Para** mantener documentación de credenciales

**Criterios de Aceptación:**
- ✅ Registrar tipo de certificado (licencia, especialización)
- ✅ Registrar número de certificado
- ✅ Registrar fecha de emisión y vencimiento
- ✅ Poder adjuntar documento
- ✅ Generar alertas de certificados próximos a vencer

**Endpoint:** `POST /certificados`

---

### US048: Ver Certificados
**Como** administrador  
**Quiero** ver los certificados registrados  
**Para** revisar credenciales actuales

**Criterios de Aceptación:**
- ✅ Listar certificados de profesionales
- ✅ Filtrar por profesional
- ✅ Mostrar estado (vigente, vencido, próximo a vencer)
- ✅ Mostrar documento asociado

**Endpoint:** `GET /certificados`

---

## 🔔 Historias de Notificaciones

### US049: Crear Notificación
**Como** sistema  
**Quiero** enviar notificaciones a usuarios  
**Para** mantenerlos informados de eventos importantes

**Criterios de Aceptación:**
- ✅ Notificar citas programadas
- ✅ Notificar cambios en citas
- ✅ Notificar recordatorios de sesiones
- ✅ Notificar nuevos planes
- ✅ Permitir configurar preferencias de notificación

**Endpoint:** `POST /notifications`

---

### US050: Enviar Notificaciones por Twilio
**Como** sistema  
**Quiero** enviar recordatorios por SMS y WhatsApp  
**Para** mejorar la asistencia a citas

**Criterios de Aceptación:**
- ✅ Enviar SMS de recordatorio 24h antes
- ✅ Enviar SMS de recordatorio 1h antes
- ✅ Enviar notificación de cambio de cita
- ✅ Registrar estado de envío
- ✅ Permitir reenvío manual
- ✅ Respetar horarios de envío

**Endpoint:** `POST /notifications/enviar-sms`

---

### US051: Ver Notificaciones del Usuario
**Como** usuario  
**Quiero** ver mis notificaciones  
**Para** revisar eventos importantes

**Criterios de Aceptación:**
- ✅ Mostrar notificaciones relevantes
- ✅ Marcar como leída
- ✅ Eliminar notificación
- ✅ Mostrar fecha y hora
- ✅ Filtrar por tipo

**Endpoint:** `GET /notifications`

---

## 📚 Historias de Ejercicios (Biblioteca)

### US052: Crear Ejercicio
**Como** fisioterapeuta  
**Quiero** crear un ejercicio en la biblioteca  
**Para** reutilizarlo en múltiples planes

**Criterios de Aceptación:**
- ✅ Registrar nombre del ejercicio
- ✅ Registrar descripción detallada
- ✅ Poder adjuntar imágenes o videos
- ✅ Especificar series, repeticiones
- ✅ Indicar grupos musculares trabajados
- ✅ Marcar como público o privado

**Endpoint:** `POST /ejercicios`

---

### US053: Listar Ejercicios
**Como** fisioterapeuta  
**Quiero** ver la biblioteca de ejercicios  
**Para** asignarlos a planes

**Criterios de Aceptación:**
- ✅ Mostrar ejercicios disponibles
- ✅ Buscar por nombre o músculo
- ✅ Filtrar por categoría
- ✅ Ver detalles y multimedia
- ✅ Ver planes que usan el ejercicio

**Endpoint:** `GET /ejercicios`

---

### US054: Asignar Ejercicio a Plan
**Como** fisioterapeuta  
**Quiero** asignar ejercicios a un plan de tratamiento  
**Para** documentar las actividades del paciente

**Criterios de Aceptación:**
- ✅ Agregar ejercicio al plan
- ✅ Especificar series y repeticiones para el plan
- ✅ Indicar frecuencia (diaria, 3x semana, etc.)
- ✅ Permitir agregar notas específicas
- ✅ Documentar progreso del ejercicio

**Endpoint:** `POST /planes/{id}/ejercicios`

---

## 🎯 Resumen de Funcionalidades

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| **Autenticación** | 3 | ✅ Implementado |
| **Gestión de Pacientes** | 5 | ✅ Implementado |
| **Evaluaciones** | 4 | ✅ Implementado |
| **Planes de Tratamiento** | 5 | ✅ Implementado |
| **Sesiones** | 5 | ✅ Implementado |
| **Agenda y Citas** | 6 | ✅ Implementado |
| **Profesionales** | 5 | ✅ Implementado |
| **Recursos** | 3 | ✅ Implementado |
| **Pagos y Facturación** | 3 | ✅ Implementado |
| **Reportes y Dashboard** | 7 | ✅ Implementado |
| **Certificados** | 2 | ✅ Implementado |
| **Notificaciones** | 3 | ✅ Implementado |
| **Ejercicios** | 3 | ✅ Implementado |
| **TOTAL** | **54 Historias de Usuario** | ✅ Completo |

---

## 📌 Notas Importantes

### Convenciones de Nombres
- Todas las historias siguen el formato: **Como** [rol] **Quiero** [acción] **Para** [beneficio]
- IDs de historias: US001-US054

### Criterios de Aceptación
- Cada historia incluye criterios claros y verificables
- Están ordenados por prioridad
- Incluyen endpoints de API asociados

### Estados de Implementación
- ✅ **Implementado**: Funcionalidad completamente desarrollada
- 🔄 **En Progreso**: Actualmente en desarrollo
- ⏳ **Planeado**: Pendiente de desarrollo

---

## 🔗 Referencias Relacionadas

- [API Routes](backend/api/API_ROUTES.md)
- [Workflow Planes de Tratamiento](backend/api/WORKFLOW_PLANES_TRATAMIENTO.md)
- [Documentación de Agendamiento](backend/api/docs/LOGICA_AGENDAR_CITAS_SESIONES.md)

---

**Versión:** 1.0  
**Última actualización:** 2025-02-05  
**Autor:** Andres Rodriguez @ MagicCorp
