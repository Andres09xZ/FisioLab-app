# 📋 Historia de Usuario - Historia Clínica del Doctor
## FisioLab - Gestión de Historia Clínica por Médico/Fisiatra

---

## 📌 Referencia Rápida

| Aspecto | Detalle |
|--------|---------|
| **Actor Principal** | Doctor / Médico / Fisiatra |
| **Funcionalidad** | Crear, Editar, Ver y Descargar Historia Clínica |
| **Rol Requerido** | DOCTOR |
| **Acceso** | Solo a pacientes del sistema |
| **Formato de Datos** | Basado en formulario oficial de historia clínica |

---

## 🎯 Historias de Usuario - Historia Clínica por Especialidad

### **UR005A: Crear Historia Clínica Fisioterapéutica**

**Como** fisioterapeuta  
**Quiero** crear una historia clínica fisioterapéutica completa para un paciente  
**Para** documentar su evaluación inicial y plan de tratamiento fisioterapéutico

**Criterios de Aceptación:**
- ✅ Acceder al módulo de historias clínicas
- ✅ Seleccionar un paciente registrado del sistema
- ✅ Los datos del paciente se cargan automáticamente
- ✅ Completar formulario con 10 secciones (A-K)
- ✅ Registrar evaluación inicial (antecedentes, movilidad, dolor, etc.)
- ✅ Establecer diagnóstico fisioterapéutico
- ✅ Crear plan de tratamiento (terapéutico y educacional)
- ✅ Guardar y descargar como PDF
- ✅ Auto-guardado cada 30 segundos
- ✅ Solo el fisioterapeuta que crea la HC puede editarla

**Rol Requerido:** FISIOTERAPEUTA  
**Endpoint:** `POST /api/historias-clinicas`

---

### **UR005B: Crear Historia Clínica Traumatológica**

**Como** doctor (especialista en traumatología)  
**Quiero** crear una historia clínica traumatológica completa para un paciente  
**Para** documentar su evaluación médica inicial con todos los datos traumatológicos necesarios

**Criterios de Aceptación:**
- ✅ Acceder al módulo de historias clínicas
- ✅ Seleccionar un paciente registrado del sistema
- ✅ Los datos del paciente se cargan automáticamente
- ✅ Completar formulario con 10 secciones (A-K) enfocadas en traumatología
- ✅ Registrar hallazgos traumatológicos específicos
- ✅ Documentar lesiones, fracturas o patologías
- ✅ Establecer diagnóstico traumatológico
- ✅ Crear plan diagnóstico y terapéutico
- ✅ Guardar y descargar como PDF
- ✅ Auto-guardado cada 30 segundos
- ✅ Solo el doctor que crea la HC puede editarla

**Rol Requerido:** DOCTOR  
**Endpoint:** `POST /api/historias-clinicas`

---

## ✨ Diferencias entre Historias Clínicas

| Aspecto | Fisioterapeuta | Doctor |
|--------|---|---|
| **Rol** | FISIOTERAPEUTA | DOCTOR |
| **Enfoque** | Evaluación y tratamiento fisioterapéutico | Diagnóstico médico traumatológico |
| **Secciones** | A-K (Generales) | A-K (Especializadas) |
| **Plan de Tratamiento** | Plan terapéutico y educacional | Plan diagnóstico y terapéutico |
| **Acceso a Datos** | Ve todas las HC del paciente | Ve solo sus HC |
| **Edición** | Puede editar las que creó | Puede editar las que creó |

---

## 🎯 Historia de Usuario Original - Historia Clínica del Doctor

## 📊 Estructura de Datos Completa

### **A. DATOS DEL ESTABLECIMIENTO Y USUARIO/PACIENTE**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `institución_del_sistema` | Text | ✅ | Nombre de la institución/clínica |
| `código_único` | UUID | ✅ | Código único de historia clínica (auto-generado) |
| `establecimiento_de_salud` | Text | ✅ | Nombre del establecimiento |
| `número_historia_clínica_única` | Integer | ✅ | Número secuencial de HC (auto-incremento) |
| `número_archivo` | Text | ✅ | Número de archivo para registro |
| `número_hoja` | Integer | ✅ | Número de hoja actual |
| `primer_apellido_paciente` | Text | ✅ | Primer apellido del paciente |
| `segundo_apellido_paciente` | Text | ⭕ | Segundo apellido del paciente |
| `primer_nombre_paciente` | Text | ✅ | Primer nombre del paciente |
| `segundo_nombre_paciente` | Text | ⭕ | Segundo nombre del paciente |
| `sexo_paciente` | ENUM | ✅ | M / F / O (Masculino/Femenino/Otro) |
| `edad_años` | Integer | ✅ | Edad en años |

---

### **B. MOTIVO DE CONSULTA**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `motivo_consulta_primera` | Text | ✅ | Motivo de la primera consulta (principal) |
| `motivo_consulta_subsecuente` | Text | ⭕ | Motivo si es consulta subsecuente |
| `fecha_consulta` | Date | ✅ | Fecha de la consulta |
| `hora_consulta` | Time | ✅ | Hora de la consulta |

---

### **C. ANTECEDENTES PATOLÓGICOS PERSONALES**

Selección múltiple de antecedentes médicos previos:

| Opción | Campo BD | Tipo |
|--------|----------|------|
| Cardiopatía | `antecedente_cardiopatia` | Boolean |
| Hipertensión | `antecedente_hipertension` | Boolean |
| Enfermedad Cardiovascular | `antecedente_enf_cardiovascular` | Boolean |
| Endocrino (Diabetes) | `antecedente_endocrino` | Boolean |
| Cáncer | `antecedente_cancer` | Boolean |
| Tuberculosis | `antecedente_tuberculosis` | Boolean |
| Enfermedad Infecciosa | `antecedente_enf_infecciosa` | Boolean |
| Mal de Formación | `antecedente_mal_formacion` | Boolean |
| Otro | `antecedente_otro` | Text |

**Adicionales:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `datos_clinico_quirurgicos` | Text | Datos clínico-quirúrgicos relevantes |
| `datos_obstetricos` | Text | Datos obstétricos (si aplica) |
| `datos_alergicos_relevantes` | Text | Alergias y reacciones adversas |

---

### **E. ENFERMEDAD O PROBLEMA ACTUAL**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `descripcion_enfermedad` | Text | ✅ | Descripción completa de la enfermedad |
| `cronologia` | Text | ✅ | Tiempo de evolución y aparición |
| `localizacion` | Text | ✅ | Ubicación anatómica del problema |
| `caracteristicas` | Text | ✅ | Características del problema (intensidad, tipo, etc.) |
| `intensidad_eva` | Integer (0-10) | ✅ | Escala de Dolor EVA (0-10) |
| `factores_agravantes` | Text | ⭕ | Factores que empeoran el problema |
| `factores_alivio` | Text | ⭕ | Factores que mejoran el problema |

---

### **F. CONSTANTES VITALES Y ANTROPOMETRÍA**

| Campo | Tipo | Unidad | Requerido | Rango Normal |
|-------|------|--------|-----------|-------------|
| `fecha_constantes` | Date | - | ✅ | - |
| `hora_constantes` | Time | - | ✅ | - |
| `temperatura` | Float | °C | ✅ | 36.0 - 37.5 |
| `presion_arterial_sistolica` | Integer | mmHg | ✅ | 90 - 140 |
| `presion_arterial_diastolica` | Integer | mmHg | ✅ | 60 - 90 |
| `pulso` | Integer | x/min | ✅ | 60 - 100 |
| `frecuencia_respiratoria` | Integer | /min | ✅ | 12 - 20 |
| `peso` | Float | Kg | ✅ | - |
| `talla` | Float | cm | ✅ | - |
| `imc` | Float | Kg/m² | ✅ | 18.5 - 24.9 |
| `perimetro_abdominal` | Float | cm | ✅ | < 102 (H), < 88 (M) |
| `hemoglobina` | Float | g/dl | ⭕ | 13.5 - 17.5 (H), 12 - 15.5 (M) |
| `glucosa_capilar` | Float | g/dl | ⭕ | 70 - 100 |
| `pleusovolumerico` | Float | % | ⭕ | > 80 |

---

### **G. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS**

Checkbox para cada sistema con campo de descripción:

| Sistema | Campo | Patología Presente |
|---------|-------|------------------|
| **1. Piel - Anexos** | `sistema_piel_anexos` | Checkbox |
| **2. Órganos de los Sentidos** | `sistema_organos_sentidos` | Checkbox |
| **3. Respiratorio** | `sistema_respiratorio` | Checkbox |
| **4. Cárdio-Vascular** | `sistema_cardiovascular` | Checkbox |
| **5. Digestivo** | `sistema_digestivo` | Checkbox |
| **6. Genito-Urinario** | `sistema_genito_urinario` | Checkbox |
| **7. Músculo-Esquelético** | `sistema_musculo_esqueletico` | Checkbox |
| **8. Endocrino** | `sistema_endocrino` | Checkbox |
| **9. Hemo-Linfático** | `sistema_hemo_linfatico` | Checkbox |
| **10. Nervioso** | `sistema_nervioso` | Checkbox |

**Campo adicional:**
- `hallazgos_sistemas`: Text - Descripción de hallazgos relevantes

---

### **H. EXAMEN FÍSICO**

#### **H.1 Examen Regional:**

| Región | Campo | Descripción |
|--------|-------|-------------|
| **Piel-Panéreas** | `examen_piel_panecas` | Text |
| **Cabeza** | `examen_cabeza` | Text |
| **Ojos** | `examen_ojos` | Text |
| **Oídos** | `examen_oidos` | Text |
| **Nariz** | `examen_nariz` | Text |
| **Cuello** | `examen_cuello` | Text |

#### **H.2 Examen de Abdomen y Estructuras:**

| Estructura | Campo | Descripción |
|-----------|-------|-------------|
| **Boca** | `examen_boca` | Text |
| **Garganta** | `examen_garganta` | Text |
| **Abdomen** | `examen_abdomen` | Text |
| **Axlas-Mamas** | `examen_axlas_mamas` | Text |
| **Supereores** | `examen_supereores` | Text |

#### **H.3 Examen de Sistemas:**

| Sistema | Campo | Descripción |
|--------|-------|-------------|
| **Abdomen Completo** | `examen_abdomen_completo` | Text |
| **Urogenital** | `examen_urogenital` | Text |
| **Respiratorio** | `examen_respiratorio` | Text |
| **Vascular** | `examen_vascular` | Text |
| **Digestivo** | `examen_digestivo` | Text |
| **Hemo-Linfático** | `examen_hemo_linfatico` | Text |
| **Esquelético** | `examen_esqueletico` | Text |
| **Neurológico** | `examen_neurologico` | Text |

---

### **I. DIAGNÓSTICO**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `diagnostico_principal` | Text | ✅ | Diagnóstico principal del paciente |
| `codigo_diagnostico_principal` | Text | ⭕ | Código CIE-10 si aplica |
| `clasificacion_principal` | ENUM | ⭕ | CK / FME / IMF |
| `diagnostico_secundario_1` | Text | ⭕ | Primer diagnóstico secundario |
| `codigo_diagnostico_secundario_1` | Text | ⭕ | Código CIE-10 si aplica |
| `clasificacion_secundario_1` | ENUM | ⭕ | CK / FME / IMF |
| `diagnostico_secundario_2` | Text | ⭕ | Segundo diagnóstico secundario |
| `codigo_diagnostico_secundario_2` | Text | ⭕ | Código CIE-10 si aplica |
| `clasificacion_secundario_2` | ENUM | ⭕ | CK / FME / IMF |

---

### **J. PLAN DE TRATAMIENTO**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `plan_diagnostico` | Text | ✅ | Plan diagnóstico y estudios solicitados |
| `plan_terapeutico` | Text | ✅ | Plan terapéutico a seguir |
| `plan_educacional` | Text | ⭕ | Plan educacional para el paciente |

---

### **K. DATOS DEL PROFESIONAL RESPONSABLE**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fecha_consulta_registro` | Date | ✅ | Fecha de la consulta (repetida) |
| `hora_consulta_registro` | Time | ✅ | Hora de la consulta (repetida) |
| `nombre_doctor` | Text | ✅ | Nombre del doctor |
| `primer_apellido_doctor` | Text | ✅ | Primer apellido del doctor |
| `segundo_apellido_doctor` | Text | ⭕ | Segundo apellido del doctor |
| `numero_documento_doctor` | Text | ✅ | Cédula/Documento del doctor |
| `firma_doctor` | Image/Base64 | ⭕ | Firma digital o escaneada |
| `sello_doctor` | Image/Base64 | ⭕ | Sello profesional del doctor |

---

## 🔄 Flujo de Creación de Historia Clínica

```
┌─────────────────────────────────┐
│   Doctor accede al sistema      │
│      (rol = DOCTOR)             │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │  Seleccionar paciente  │
    │  o crear nuevo         │
    └────────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │  Formulario de Historia Clínica│
    │  (secciones A-K)               │
    └────────────┬───────────────────┘
                 │
    ┌────────────┴────────────┐
    │ Validar datos           │
    └────────────┬────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ✅ VÁLIDO        ❌ ERRORES
        │                 │
        │          ┌──────┘
        │          │
        │          ▼
        │    Mostrar errores
        │          │
        │          └──────┐
        │                 │
        ▼                 ▼
   ┌─────────────────────────┐
   │ Guardar Historia Clínica│
   │ en la BD                │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ Generar código único HC │
   │ Asignar número archivo  │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ Mostrar confirmación    │
   │ y opciones:             │
   │ - Ver documento         │
   │ - Descargar PDF         │
   │ - Editar HC             │
   │ - Volver a paciente     │
   └─────────────────────────┘
```

---

## 📱 Interfaz de Usuario (UX/UI)

### **Sección A: Datos Básicos**

```
┌─────────────────────────────────────────┐
│ DATOS DEL ESTABLECIMIENTO Y PACIENTE    │
├─────────────────────────────────────────┤
│                                         │
│ Institución: [Clínica FisioLab      ]  │
│ Código HC: [HC-2025-00001] (auto)   │  │ (auto-generado)
│ Número Archivo: [ARH-001]           │  │ (auto-generado)
│                                         │
│ Paciente:                               │
│ ┌─────────────────────────────────────┐ │
│ │ 1er Apellido: [_____________]        │ │
│ │ 2do Apellido: [_____________]        │ │
│ │ 1er Nombre:   [_____________]        │ │
│ │ 2do Nombre:   [_____________]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Sexo: (●) M  ( ) F  ( ) O              │
│ Edad: [__] años                         │
│                                         │
└─────────────────────────────────────────┘
```

### **Sección B: Motivo de Consulta**

```
┌─────────────────────────────────────────┐
│ MOTIVO DE CONSULTA                      │
├─────────────────────────────────────────┤
│                                         │
│ ( ) Primera Consulta                    │
│ (●) Consulta Subsecuente                │
│                                         │
│ Motivo:                                 │
│ ┌─────────────────────────────────────┐ │
│ │ ____________                          │ │
│ │ ____________                          │ │
│ │ ____________                          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Fecha: [__/__/____]  Hora: [__:__]     │
│                                         │
└─────────────────────────────────────────┘
```

### **Sección C: Antecedentes**

```
┌─────────────────────────────────────────┐
│ ANTECEDENTES PATOLÓGICOS PERSONALES     │
├─────────────────────────────────────────┤
│                                         │
│ [✓] Cardiopatía     [ ] Tuberculosis    │
│ [✓] Hipertensión    [✓] Diabetes        │
│ [ ] Enf. Cardiovascular [ ] Cáncer      │
│ [ ] Mal de Formación [ ] Enf. Infecciosa│
│                                         │
│ Otros: [________________________]        │
│                                         │
│ Datos clínico-quirúrgicos:              │
│ ┌─────────────────────────────────────┐ │
│ │ ____________                          │ │
│ │ ____________                          │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### **Sección E: Enfermedad Actual**

```
┌─────────────────────────────────────────┐
│ ENFERMEDAD O PROBLEMA ACTUAL            │
├─────────────────────────────────────────┤
│                                         │
│ Descripción:                            │
│ ┌─────────────────────────────────────┐ │
│ │                                       │ │
│ │                                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Cronología: ________________________     │
│ Localización: ____________________      │
│ Características: __________________     │
│                                         │
│ Intensidad (EVA): [1][2][3][4][5]...   │
│                                         │
│ Factores Agravantes: ______________     │
│ Factores de Alivio: ________________    │
│                                         │
└─────────────────────────────────────────┘
```

### **Sección F: Constantes Vitales**

```
┌─────────────────────────────────────────┐
│ CONSTANTES VITALES Y ANTROPOMETRÍA      │
├─────────────────────────────────────────┤
│                                         │
│ Fecha: [__/__/____]  Hora: [__:__]     │
│                                         │
│ Temperatura:    [36.5] °C               │
│ Presión Arterial: [130]/[85] mmHg       │
│ Pulso:          [72] x/min              │
│ Frecuencia Resp: [18] /min              │
│                                         │
│ Peso:           [78] Kg                 │
│ Talla:          [175] cm                │
│ IMC:            [25.4] Kg/m² (Auto)     │
│ Perímetro Abdominal: [95] cm            │
│                                         │
│ Hemoglobina:    [14.5] g/dl             │
│ Glucosa Capilar: [105] g/dl             │
│ Pleusovolumétrico: [98] %               │
│                                         │
└─────────────────────────────────────────┘
```

### **Sección I: Diagnóstico**

```
┌─────────────────────────────────────────┐
│ DIAGNÓSTICO                             │
├─────────────────────────────────────────┤
│                                         │
│ Diagnóstico Principal:                  │
│ [Lumbalgia mecánica        ] Código: M54.5
│ Clasificación: (●) CK  ( ) FME  ( ) IMF│
│                                         │
│ Diagnóstico Secundario 1:               │
│ [Contractura muscular       ] Código: M62.8
│ Clasificación: ( ) CK  (●) FME  ( ) IMF│
│                                         │
│ Diagnóstico Secundario 2:               │
│ [                           ]           │
│ Clasificación: ( ) CK  ( ) FME  ( ) IMF│
│                                         │
└─────────────────────────────────────────┘
```

### **Sección J: Plan de Tratamiento**

```
┌─────────────────────────────────────────┐
│ PLAN DE TRATAMIENTO                     │
├─────────────────────────────────────────┤
│                                         │
│ Plan Diagnóstico:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Resonancia magnética de columna      │ │
│ │ Radiografía simple                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Plan Terapéutico:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Fisioterapia 2-3 veces por semana   │ │
│ │ Reposo relativo                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Plan Educacional:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Ergonomía en el trabajo             │ │
│ │ Ejercicios en casa                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### **Sección K: Profesional Responsable**

```
┌─────────────────────────────────────────┐
│ DATOS DEL PROFESIONAL RESPONSABLE       │
├─────────────────────────────────────────┤
│                                         │
│ Fecha: [__/__/____]  Hora: [__:__]     │
│                                         │
│ Doctor:                                 │
│ 1er Nombre: [Juan          ]            │
│ 1er Apellido: [Pérez         ]          │
│ 2do Apellido: [García        ]          │
│                                         │
│ Documento: [MD-12345]                   │
│                                         │
│ Firma: [  ]  Sello: [  ]                │
│                                         │
│ [Cargar Imagen]                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 Validaciones Requeridas

### **Campos Obligatorios:**
- ✅ Institución del sistema
- ✅ Establecimiento de salud
- ✅ Apellidos y nombres del paciente
- ✅ Sexo y edad del paciente
- ✅ Motivo de consulta
- ✅ Fecha y hora de consulta
- ✅ Diagnóstico principal
- ✅ Plan diagnóstico
- ✅ Plan terapéutico
- ✅ Datos completos del doctor

### **Validaciones de Formato:**
- Email único por paciente
- Documento único
- EVA entre 0-10
- Edad >= 0
- Constantes vitales en rangos razonables
- Fecha <= hoy

### **Validaciones de Negocio:**
- Solo DOCTOR puede crear HC
- Un paciente solo puede tener una HC por fecha
- Diagnóstico no puede estar vacío
- Doctor debe estar activo en el sistema

---

## 📤 Endpoints Requeridos

### **POST /historias-clinicas**
Crear nueva historia clínica

### **GET /historias-clinicas**
Listar historias clínicas

### **GET /historias-clinicas/{id}**
Obtener historia clínica completa

### **PUT /historias-clinicas/{id}**
Editar historia clínica existente

### **GET /historias-clinicas/{id}/pdf**
Descargar en PDF

### **DELETE /historias-clinicas/{id}**
Eliminar historia clínica (soft delete)

---

## 🎨 Consideraciones de UX

1. **Formulario progresivo**: Mostrar secciones de forma clara
2. **Auto-guardado**: Guardar datos temporales mientras se completa
3. **Validación en tiempo real**: Mostrar errores mientras se escribe
4. **Tooltips**: Ayuda contextual para cada campo
5. **Pre-llenado**: Cargar datos del paciente automáticamente
6. **Botones de acción**: Guardar, Descargar PDF, Editar
7. **Confirmación**: Mensaje al guardar correctamente
8. **Historial**: Ver versiones anteriores de la HC

---

**Versión:** 1.0  
**Fecha:** 2025-02-05  
**Autor:** Andres Rodriguez @ MagicCorp  
**Estado:** ✅ Listo para Desarrollo de Frontend y Backend
