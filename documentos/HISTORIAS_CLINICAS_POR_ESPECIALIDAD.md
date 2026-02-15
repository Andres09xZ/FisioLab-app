# 📋 Historias de Usuario - Historia Clínica por Especialidad
## FisioLab - Gestión Diferenciada por Rol

---

## 📌 Resumen Ejecutivo

El sistema FisioLab permite a diferentes profesionales crear historias clínicas especializadas según su rol:

- **Fisioterapeuta:** Crea historias clínicas fisioterapéuticas
- **Doctor (Traumatólogo):** Crea historias clínicas traumatológicas

Ambos roles comparten la misma base de datos de pacientes y pueden consultar historias clínicas, pero cada uno ve y edita solo las que ha creado.

---

## 👩‍⚕️ Historias de Usuario - Fisioterapeuta

### **UR-FT-001: Crear Historia Clínica Fisioterapéutica**

**Como** fisioterapeuta  
**Quiero** crear una historia clínica completa para un paciente  
**Para** documentar su evaluación inicial y establecer un plan de tratamiento fisioterapéutico

**Criterios de Aceptación:**

1. **Acceso y Navegación**
   - ✅ El fisioterapeuta puede acceder al módulo "Historias Clínicas" desde el menú principal
   - ✅ Puede ver un botón "Nueva Historia Clínica" en la lista

2. **Selección de Paciente**
   - ✅ Al crear una nueva HC, se muestra un selector con todos los pacientes registrados
   - ✅ Puede buscar pacientes por nombre, apellido o documento
   - ✅ Al seleccionar un paciente, sus datos se cargan automáticamente (nombre, apellido, edad, sexo)

3. **Completar Formulario**
   - ✅ Completar 10 secciones (A-K):
     - **Sección A:** Datos del establecimiento y paciente
     - **Sección B:** Motivo de consulta
     - **Sección C:** Antecedentes
     - **Sección E:** Constantes vitales y antropometría
     - **Sección F:** Sistemas
     - **Sección G:** Examen físico
     - **Sección H:** Diagnóstico
     - **Sección I:** Impresión diagnóstica
     - **Sección J:** Plan de tratamiento
     - **Sección K:** Firma del profesional

4. **Guardar y Auto-guardado**
   - ✅ El formulario se auto-guarda cada 30 segundos (si los campos obligatorios están completos)
   - ✅ El usuario puede guardar manualmente haciendo clic en "Guardar"
   - ✅ Se muestra confirmación de guardado exitoso
   - ✅ Se registra la hora de última actualización

5. **Descargar PDF**
   - ✅ Después de guardar, el fisioterapeuta puede descargar la HC como PDF
   - ✅ El PDF incluye todos los datos completos y formateado profesionalmente

6. **Ver Historial**
   - ✅ El fisioterapeuta puede ver lista de todas sus historias clínicas creadas
   - ✅ Puede filtrar por paciente, fecha o estado
   - ✅ Puede ver, editar o descargar cada HC

**Campos Obligatorios:**
- Institución del sistema
- Establecimiento de salud
- Datos del paciente (nombre, apellido, edad, sexo)
- Motivo de consulta
- Descripción de enfermedad
- Diagnóstico principal
- Plan terapéutico

**Endpoint:** `POST /api/historias-clinicas`  
**Método:** POST  
**Headers:** Authorization: Bearer {token}

---

### **UR-FT-002: Editar Historia Clínica Fisioterapéutica**

**Como** fisioterapeuta  
**Quiero** editar una historia clínica que he creado  
**Para** corregir datos o agregar información adicional

**Criterios de Aceptación:**
- ✅ Solo el fisioterapeuta que creó la HC puede editarla
- ✅ Puede modificar cualquier campo del formulario
- ✅ Los cambios se auto-guardan cada 30 segundos
- ✅ Se muestra la fecha de última modificación
- ✅ Puede descargar el PDF actualizado

**Endpoint:** `PUT /api/historias-clinicas/{id}`

---

### **UR-FT-003: Ver Historias Clínicas Creadas**

**Como** fisioterapeuta  
**Quiero** ver un listado de todas mis historias clínicas  
**Para** gestionar y acceder a los registros de mis pacientes

**Criterios de Aceptación:**
- ✅ Ver tabla con todas sus HC creadas
- ✅ Mostrar: código único, paciente, fecha, diagnóstico principal
- ✅ Buscar por nombre de paciente
- ✅ Filtrar por fecha
- ✅ Acciones: Ver, Editar, Descargar PDF, Eliminar
- ✅ Mostrar contador de HC totales

**Endpoint:** `GET /api/historias-clinicas`

---

## 👨‍⚕️ Historias de Usuario - Doctor (Traumatólogo)

### **UR-DOC-001: Crear Historia Clínica Traumatológica**

**Como** doctor especialista en traumatología  
**Quiero** crear una historia clínica traumatológica para un paciente  
**Para** documentar su diagnóstico y plan de tratamiento médico

**Criterios de Aceptación:**

1. **Acceso y Navegación**
   - ✅ El doctor puede acceder al módulo "Historias Clínicas" desde el menú (solo ve este menú y Pacientes)
   - ✅ Puede ver un botón "Nueva Historia Clínica"

2. **Selección de Paciente**
   - ✅ Al crear una nueva HC, se muestra un selector con todos los pacientes registrados
   - ✅ Puede buscar pacientes por nombre, apellido o documento
   - ✅ Al seleccionar un paciente, sus datos se cargan automáticamente

3. **Completar Formulario Traumatológico**
   - ✅ Completar las 10 secciones con enfoque en traumatología
   - ✅ Registrar lesiones, fracturas, patologías traumatológicas
   - ✅ Documentar hallazgos clínicos específicos

4. **Guardar y Auto-guardado**
   - ✅ El formulario se auto-guarda cada 30 segundos
   - ✅ El usuario puede guardar manualmente
   - ✅ Se muestra confirmación de guardado

5. **Descargar PDF**
   - ✅ Después de guardar, el doctor puede descargar la HC como PDF

6. **Ver Historial**
   - ✅ El doctor solo ve sus propias historias clínicas
   - ✅ No puede ver HC creadas por otros doctors o fisioterapeutas
   - ✅ Puede ver, editar o descargar cada HC

**Rol Requerido:** DOCTOR  
**Endpoint:** `POST /api/historias-clinicas`

---

### **UR-DOC-002: Editar Historia Clínica Traumatológica**

**Como** doctor  
**Quiero** editar una historia clínica que he creado  
**Para** actualizar información médica

**Criterios de Aceptación:**
- ✅ Solo el doctor que creó la HC puede editarla
- ✅ Puede modificar cualquier campo
- ✅ Los cambios se auto-guardan cada 30 segundos
- ✅ Se registra la fecha de modificación

**Endpoint:** `PUT /api/historias-clinicas/{id}`

---

### **UR-DOC-003: Ver Historias Clínicas Creadas**

**Como** doctor  
**Quiero** ver solo mis historias clínicas  
**Para** gestionar mis registros médicos

**Criterios de Aceptación:**
- ✅ Ver tabla con solo sus HC (filtradas por doctor_id)
- ✅ Mostrar: código único, paciente, fecha, diagnóstico
- ✅ Buscar por paciente
- ✅ Acciones: Ver, Editar, Descargar PDF, Eliminar
- ✅ Solo ve HC que él mismo creó

**Endpoint:** `GET /api/historias-clinicas` (filtrado por doctor_id)

---

## 🔄 Visibilidad y Permisos

### Comparativa por Rol

| Función | Fisioterapeuta | Doctor |
|---------|---|---|
| **Ver Pacientes** | ✅ Todos | ✅ Todos |
| **Crear Historia Clínica** | ✅ Sí (Fisioterapéutica) | ✅ Sí (Traumatológica) |
| **Editar propia HC** | ✅ Sí | ✅ Sí |
| **Editar HC de otros** | ❌ No | ❌ No |
| **Ver propia HC** | ✅ Sí | ✅ Sí |
| **Ver HC de otros** | ❌ No | ❌ No |
| **Descargar PDF** | ✅ Sí | ✅ Sí |
| **Eliminar HC** | ✅ Sí (propia) | ✅ Sí (propia) |
| **Ver menú Agenda** | ✅ Sí | ❌ No |
| **Ver menú Sesiones** | ✅ Sí | ❌ No |
| **Ver menú Profesionales** | ✅ Sí | ❌ No |

---

## 🛡️ Reglas de Seguridad

1. **Autenticación Obligatoria**
   - Todos los endpoints requieren token JWT válido
   - El token incluye el ID y rol del usuario

2. **Control de Acceso**
   - Doctor solo ve sus HC (filtradas por doctor_id)
   - Fisioterapeuta solo ve sus HC (filtradas por fisioterapeuta_id)
   - No pueden editar HC de otros usuarios

3. **Validación de Rol**
   - Endpoint requiere validación de rol DOCTOR o FISIOTERAPEUTA
   - Rechazo si rol no autorizado

4. **Auditoria**
   - Se registra quién crea, modifica y elimina cada HC
   - Se registra fecha y hora de cada operación

---

## 📊 Flujo de Uso

### Flujo del Fisioterapeuta

```
1. Login como Fisioterapeuta
   ↓
2. Navega a "Historias Clínicas"
   ↓
3. Hace clic en "Nueva Historia Clínica"
   ↓
4. Selecciona un paciente del dropdown
   ↓
5. Los datos del paciente se cargan automáticamente
   ↓
6. Completa las 10 secciones del formulario
   ↓
7. El sistema auto-guarda cada 30 segundos
   ↓
8. Guarda manualmente y recibe confirmación
   ↓
9. Descarga PDF de la HC
   ↓
10. Ver en lista de "Mis Historias Clínicas"
```

### Flujo del Doctor

```
1. Login como Doctor
   ↓
2. En el menú solo ve: Pacientes e Historias Clínicas
   ↓
3. Navega a "Historias Clínicas"
   ↓
4. Hace clic en "Nueva Historia Clínica"
   ↓
5. Selecciona un paciente del dropdown
   ↓
6. Los datos del paciente se cargan automáticamente
   ↓
7. Completa las 10 secciones del formulario (enfoque traumatológico)
   ↓
8. El sistema auto-guarda cada 30 segundos
   ↓
9. Guarda manualmente
   ↓
10. Descarga PDF de la HC
   ↓
11. Ver solo en su lista de "Mis Historias Clínicas"
```

---

## 📝 Estados de Historia Clínica

- **BORRADOR:** En creación, no finalizada
- **ACTIVA:** Guardada y completa
- **ARCHIVADA:** Antigua pero disponible para consulta
- **ELIMINADA:** Soft delete, no aparece en listas

---

## 🔗 Endpoints Relacionados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/historias-clinicas` | GET | Listar HC del usuario autenticado |
| `/api/historias-clinicas` | POST | Crear nueva HC |
| `/api/historias-clinicas/{id}` | GET | Ver HC específica |
| `/api/historias-clinicas/{id}` | PUT | Editar HC |
| `/api/historias-clinicas/{id}` | DELETE | Eliminar HC (soft delete) |
| `/api/historias-clinicas/{id}/pdf` | GET | Descargar PDF |

---

## ✅ Checklist de Implementación

- ✅ Selector de pacientes en formulario
- ✅ Auto-carga de datos del paciente
- ✅ Auto-guardado cada 30 segundos
- ✅ Filtro de HC por doctor_id (Doctor)
- ✅ Menú diferenciado por rol
- ✅ Validación de permisos en backend
- ✅ Descarga PDF
- ✅ Edición de HC propias
- ✅ Soft delete
