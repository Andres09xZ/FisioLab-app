# ✅ Actualización de Historias de Usuario - Resumen

## 📝 Cambios Realizados

Se han actualizado las historias de usuario para reflejar que:

### **Fisioterapeuta 👩‍⚕️**
- ✅ Puede crear **Historia Clínica Fisioterapéutica**
- ✅ Enfoque: Evaluación y tratamiento fisioterapéutico
- ✅ Acceso a menú completo (Agenda, Sesiones, etc.)

### **Doctor 👨‍⚕️**
- ✅ Puede crear **Historia Clínica Traumatológica**
- ✅ Enfoque: Diagnóstico médico especializado
- ✅ Acceso limitado a: **Pacientes** e **Historias Clínicas**

---

## 📁 Archivos Modificados

### 1. **HISTORIA_CLINICA_DOCTOR.md**
- Agregado: Sección de historias de usuario diferenciadas
- Tabla comparativa entre fisioterapeuta y doctor
- Descripción de diferencias por especialidad

### 2. **HISTORIAS_CLINICAS_POR_ESPECIALIDAD.md** (NUEVO)
- 📋 Documento completo con:
  - Historias de usuario del fisioterapeuta
  - Historias de usuario del doctor
  - Matriz de permisos
  - Flujos de uso
  - Estados de HC
  - Endpoints relacionados
  - Checklist de implementación

### 3. **HISTORIAS_USUARIO_ROLES.md**
- Incluye nueva sección de historias clínicas
- Detalles técnicos de endpoints
- Especificaciones JSON

---

## 🎯 Historias de Usuario Creadas

### Fisioterapeuta (UR-FT-001 a UR-FT-003)
1. **UR-FT-001:** Crear Historia Clínica Fisioterapéutica
2. **UR-FT-002:** Editar Historia Clínica Fisioterapéutica  
3. **UR-FT-003:** Ver Historias Clínicas Creadas

### Doctor (UR-DOC-001 a UR-DOC-003)
1. **UR-DOC-001:** Crear Historia Clínica Traumatológica
2. **UR-DOC-002:** Editar Historia Clínica Traumatológica
3. **UR-DOC-003:** Ver Historias Clínicas Creadas

---

## 🔄 Diferencias Clave

| Aspecto | Fisioterapeuta | Doctor |
|--------|---|---|
| **Tipo de HC** | Fisioterapéutica | Traumatológica |
| **Menú Principal** | Completo (6+ opciones) | Limitado (Pacientes + HC) |
| **Pacientes** | Ve todos | Ve todos |
| **HC Propias** | Ve y edita las que creó | Ve y edita las que creó |
| **HC de Otros** | No ve | No ve |
| **Plan de Tratamiento** | Terapéutico + Educacional | Diagnóstico + Terapéutico |

---

## ✨ Características Implementadas

✅ Selector de pacientes en formulario  
✅ Auto-carga de datos del paciente  
✅ Auto-guardado cada 30 segundos  
✅ Filtro de HC por usuario (doctor_id / fisioterapeuta_id)  
✅ Menú diferenciado por rol  
✅ Validación de permisos en backend  
✅ Descarga PDF  
✅ Edición de HC propias  
✅ Soft delete  
✅ Vistas especializadas por rol

---

## 📖 Ubicación de Documentos

Todos los archivos se encuentran en: `documentos/`

- `HISTORIAS_CLINICAS_POR_ESPECIALIDAD.md` ← **Documento Nuevo Principal**
- `HISTORIA_CLINICA_DOCTOR.md` ← Actualizado
- `HISTORIAS_USUARIO_ROLES.md` ← Actualizado
