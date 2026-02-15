# 🎯 REFERENCIA RÁPIDA - Historia Clínica del Doctor

## 🔑 Roles Definidos

```
┌─────────────────────────────────────────────────────────┐
│                    FISIOLAB ROLES                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  👨‍⚕️ DOCTOR                                              │
│  ├─ Crea Historia Clínica                               │
│  ├─ Diagnostica                                         │
│  ├─ Genera reportes                                     │
│  └─ Accede a datos médicos                              │
│                                                          │
│  🏥 FISIOTERAPEUTA                                      │
│  ├─ Ejecuta planes de tratamiento                       │
│  ├─ Realiza sesiones                                    │
│  ├─ Registra evolución                                  │
│  ├─ Carga técnicas y ejercicios                         │
│  └─ Comunica cambios al doctor                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Estructura de Historia Clínica

```
┌─────────────────────────────────────────────────────┐
│         HISTORIA CLÍNICA - 10 SECCIONES             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  A. DATOS DEL ESTABLECIMIENTO Y PACIENTE            │
│     └─ Institución, código HC, nombres, edad, sexo │
│                                                     │
│  B. MOTIVO DE CONSULTA                              │
│     └─ Razón de la consulta, fecha, hora           │
│                                                     │
│  C. ANTECEDENTES PATOLÓGICOS PERSONALES             │
│     └─ Cardiopatía, HTA, Diabetes, etc.            │
│                                                     │
│  E. ENFERMEDAD O PROBLEMA ACTUAL                    │
│     └─ Descripción, cronología, EVA (0-10)         │
│                                                     │
│  F. CONSTANTES VITALES Y ANTROPOMETRÍA              │
│     └─ Temp, PA, Pulso, FR, Peso, Talla, IMC      │
│                                                     │
│  G. REVISIÓN DE ÓRGANOS Y SISTEMAS                  │
│     └─ 10 sistemas (piel, respiratorio, etc.)      │
│                                                     │
│  H. EXAMEN FÍSICO                                   │
│     └─ Regional, Abdomen, Sistemas                 │
│                                                     │
│  I. DIAGNÓSTICO                                     │
│     └─ Principal + 2 secundarios (con códigos)     │
│                                                     │
│  J. PLAN DE TRATAMIENTO                             │
│     └─ Diagnóstico, Terapéutico, Educacional      │
│                                                     │
│  K. DATOS DEL PROFESIONAL RESPONSABLE               │
│     └─ Nombre, documento, firma, fecha             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo del Doctor

```
LOGIN DOCTOR
    │
    ▼
DASHBOARD DOCTOR
    │
    ├─► [VER LISTA PACIENTES] ◄──────┐
    │   │                            │
    │   └─► Buscar/Filtrar           │
    │       │                        │
    │       ▼                        │
    │   DETALLES PACIENTE            │
    │   │                            │
    │   ├─► [CREAR HC NUEVA]         │
    │   │   │                        │
    │   │   ▼                        │
    │   │   FORMULARIO HC            │
    │   │   (Secc. A → K)            │
    │   │   │                        │
    │   │   ▼                        │
    │   │   GUARDAR                  │
    │   │   │                        │
    │   │   ├─► ✅ Éxito             │
    │   │   │   │                    │
    │   │   │   ├─► Ver HC           │
    │   │   │   ├─► Descargar PDF    │
    │   │   │   ├─► Editar HC ────────┘
    │   │   │   └─► Volver Paciente
    │   │   │
    │   │   └─► ❌ Errores
    │   │       └─► Mostrar validaciones
    │   │
    │   ├─► [VER HC ANTERIOR]
    │   │   │
    │   │   ▼
    │   │   HC COMPLETADA
    │   │   ├─► Ver PDF
    │   │   ├─► Descargar
    │   │   └─► Editar
    │   │
    │   └─► [CAMBIAR CONTRASEÑA]
    │
    └─► LOGOUT
```

---

## 🎨 Campos Clave por Sección

### **Sección A: Datos Básicos**
- Institución ✅
- Código HC (auto-generado)
- Apellidos + Nombres Paciente ✅
- Sexo (M/F/O) ✅
- Edad (años) ✅

### **Sección B: Motivo**
- Primera/Subsecuente ✅
- Descripción ✅
- Fecha/Hora ✅

### **Sección C: Antecedentes**
- [ ] Cardiopatía
- [ ] Hipertensión
- [ ] Diabetes
- [ ] Tuberculosis
- [ ] Etc...
- + Datos clínicos adicionales

### **Sección E: Enfermedad Actual**
- Descripción (texto largo) ✅
- Cronología ✅
- Localización ✅
- Intensidad (EVA: 0-10) ✅
- Factores agravantes
- Factores de alivio

### **Sección F: Vitales**
| Vital | Unidad | Rango Normal |
|-------|--------|-------------|
| Temperatura | °C | 36-37.5 |
| PA Sistólica | mmHg | 90-140 |
| PA Diastólica | mmHg | 60-90 |
| Pulso | x/min | 60-100 |
| FR | /min | 12-20 |
| Peso | Kg | - |
| Talla | cm | - |
| IMC | Kg/m² | 18.5-24.9 |

### **Sección G: Sistemas (10)**
1. Piel - Anexos
2. Órganos Sentidos
3. Respiratorio
4. Cardiovascular
5. Digestivo
6. Genito-Urinario
7. Músculo-Esquelético
8. Endocrino
9. Hemo-Linfático
10. Nervioso

### **Sección H: Examen Físico (8 sistemas)**
- Respiratorio
- Cardiovascular
- Digestivo
- Genito-Urinario
- Músculo-Esquelético
- Neurológico
- Vascular
- Hemo-Linfático

### **Sección I: Diagnóstico**
- Diagnóstico principal ✅
- Código (CIE-10)
- Clasificación (CK/FME/IMF)
- Hasta 2 diagnósticos secundarios

### **Sección J: Plan**
- Plan Diagnóstico ✅
- Plan Terapéutico ✅
- Plan Educacional

### **Sección K: Profesional**
- Nombre ✅
- Apellidos ✅
- Documento ✅
- Firma/Sello
- Fecha/Hora ✅

---

## 📊 Matriz de Acceso

```
┌──────────────────────────────────────────┐
│ FUNCIONALIDAD     │ DOCTOR │ FISIO │ ADM │
├──────────────────────────────────────────┤
│ Ver Pacientes     │   ✅   │  ❌  │  -  │
│ Crear HC          │   ✅   │  ❌  │  -  │
│ Editar HC         │   ✅   │  ❌  │  -  │
│ Ver HC            │   ✅   │  ❌  │  -  │
│ Descargar PDF HC  │   ✅   │  ❌  │  -  │
│ Realizar Sesión   │   ❌   │  ✅  │  -  │
│ Registrar Notas   │   ✅   │  ✅  │  -  │
│ Ver Calendario    │   ❌   │  ✅  │  -  │
│ Cambiar Pass      │   ✅   │  ✅  │  -  │
└──────────────────────────────────────────┘
```

---

## 🔌 Endpoints Principales

### **Historia Clínica**
```
POST   /historias-clinicas
GET    /historias-clinicas
GET    /historias-clinicas/{id}
PUT    /historias-clinicas/{id}
GET    /historias-clinicas/{id}/pdf
DELETE /historias-clinicas/{id}
```

### **Pacientes (Doctor)**
```
GET    /pacientes?rol=doctor
GET    /pacientes/{id}?rol=doctor
```

### **Auth Doctor**
```
POST   /auth/register-doctor
POST   /auth/login (con rol=DOCTOR)
POST   /auth/change-password-first-login
```

---

## ✅ Validaciones Críticas

| Campo | Validación |
|-------|-----------|
| Email | Único, formato válido |
| Documento | Único, no vacío |
| EVA | 0-10, número entero |
| Edad | >= 0, número entero |
| PA | Sistólica >= Diastólica |
| Constantes | Rangos razonables |
| Diagnóstico | No vacío |
| Doctor | Debe estar activo |

---

## 📱 Mockup Rápido - Crear HC

```
╔════════════════════════════════════╗
║     CREAR HISTORIA CLÍNICA         ║
╠════════════════════════════════════╣
║                                    ║
║  SECCIÓN A: DATOS BÁSICOS         ║
║  ┌──────────────────────────────┐ ║
║  │ Institución: [Clínica...]    │ ║
║  │ Código: HC-2025-001 (auto)   │ ║
║  │ Apellido 1: [___________]    │ ║
║  │ Apellido 2: [___________]    │ ║
║  │ Nombre 1: [__________]       │ ║
║  │ Nombre 2: [__________]       │ ║
║  │ Sexo: ⊙ M  ○ F  ○ O          │ ║
║  │ Edad: [__] años              │ ║
║  └──────────────────────────────┘ ║
║                                    ║
║  SECCIÓN B: MOTIVO               ║
║  ┌──────────────────────────────┐ ║
║  │ ⊙ Primera  ○ Subsecuente    │ ║
║  │ Motivo: [______________]    │ ║
║  │ Fecha: [__/__/____]          │ ║
║  │ Hora: [__:__]               │ ║
║  └──────────────────────────────┘ ║
║                                    ║
║  [◄ Anterior]  [Siguiente ►]     ║
║  [Guardar]     [Cancelar]        ║
║                                    ║
╚════════════════════════════════════╝
```

---

## 🎯 Requisitos Cumplidos

- ✅ Solo 2 roles: DOCTOR y FISIOTERAPEUTA
- ✅ Doctor puede ver lista de pacientes
- ✅ Doctor puede crear historia clínica
- ✅ Historia clínica con formato oficial (10 secciones)
- ✅ Todos los datos del formulario incluidos
- ✅ Validaciones de datos
- ✅ Endpoints definidos
- ✅ Flujos claros
- ✅ No se agregaron funcionalidades extra

---

**Última Actualización:** 2025-02-05  
**Autor:** Andres Rodriguez @ MagicCorp  
**Estado:** ✅ LISTO PARA DESARROLLO
