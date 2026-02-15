# 👨‍⚕️ VISTA DEL DOCTOR - HISTORIA CLÍNICA
## Diseño y Estructura UX/UI

---

## 📱 Pantalla 1: Lista de Historias Clínicas

```
┌─────────────────────────────────────────────────────────────┐
│  FisioLab │ Dashboard │ Historias Clínicas                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Mis Historias Clínicas                                     │
│  Gestione todas sus historias clínicas creadas              │
│                                                              │
│  [🔍 Buscar paciente...] [📅 Filtrar por fecha] [+ Nueva HC]│
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Código    │ Paciente       │ Diagnóstico        │ Fecha  │ Acciones │
├─────────────────────────────────────────────────────────────┤
│HC-2025-001│ Juan Pérez     │ Lumbalgia mecánica │15/01/25 │ 👁️ 📝 🗑️ │
│HC-2025-002│ María García   │ Cervicalgia        │16/01/25 │ 👁️ 📝 🗑️ │
│HC-2025-003│ Carlos López   │ Esguince de tobillo│17/01/25 │ 👁️ 📝 🗑️ │
│HC-2025-004│ Ana Rodríguez  │ Tendinitis         │18/01/25 │ 👁️ 📝 🗑️ │
│                                                              │
│  Mostrando 4 de 15 registros  [< 1 2 3 4 >]                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Pantalla 2: Crear Nueva Historia Clínica

```
┌─────────────────────────────────────────────────────────────┐
│  Nueva Historia Clínica                     ⏰ Guardado: 14:35│
│  Complete el formulario en las 10 secciones disponibles     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [A.Datos][B.Motivo][C.Anteced...][E.Enfer...][F.Const...]  │
│ [G.Sist...][H.Exam...][I.Diag...][J.Plan][K.Prof]          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ SECCIÓN A: Datos del Establecimiento y Paciente            │
│                                                              │
│  Institución del Sistema:  ┌──────────────────────────────┐ │
│                            │ FisioLab               (auto) │ │
│                            └──────────────────────────────┘ │
│                                                              │
│  Establecimiento de Salud: ┌──────────────────────────────┐ │
│                            │ [Clínica FisioLab...]        │ │
│                            └──────────────────────────────┘ │
│                                                              │
│  ┌─ DATOS DEL PACIENTE ───────────────────────────────────┐ │
│  │                                                         │ │
│  │ Primer Apellido:   ┌──────────────────────────────────┐│ │
│  │                    │ Pérez                            ││ │
│  │                    └──────────────────────────────────┘│ │
│  │                                                         │ │
│  │ Primer Nombre:     ┌──────────────────────────────────┐│ │
│  │                    │ Juan                             ││ │
│  │                    └──────────────────────────────────┘│ │
│  │                                                         │ │
│  │ Sexo:  (●) Masculino  ( ) Femenino  ( ) Otro         │ │
│  │                                                         │ │
│  │ Edad:  ┌──────────────────────────────────────────────┐│ │
│  │        │ 45                                           ││ │
│  │        └──────────────────────────────────────────────┘│ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ ☑ Auto-guardar cada 30s ]     [Cancelar] [💾 Guardar]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Pantalla 3: Sección E (Enfermedad Actual)

```
┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN E: Enfermedad o Problema Actual                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Descripción del Problema *                                  │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Dolor en región lumbar que radía hacia glúteo derecho... ││
│ │ El paciente reporta limitación funcional importante...   ││
│ │                                                           ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Cronología *                                                │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Desde hace 6 meses, de inicio insidioso                 ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Localización Anatómica *                                    │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Región lumbar, especialmente L4-L5                      ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Características del Problema *                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Dolor de tipo mecánico, empeora con flexión y carga    ││
│ │ Mejora parcialmente con reposo                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Intensidad del Dolor (EVA): 7/10                            │
│ ┌───────────────────────────────────────────────────────────┐
│ │ Sin dolor ◽━━◼━━━◽━━━◽━━━◽━━━◽ Dolor máximo            │
│ │            0  1  2  3  4  5  6  7  8  9  10              │
│ └───────────────────────────────────────────────────────────┘
│                                                              │
│ Factores Agravantes                                         │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Actividades de carga, permanecer sentado >1 hora        ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Factores de Alivio                                          │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Reposo, calor local, medicamentos antiinflamatorios     ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [ ☑ Auto-guardar cada 30s ]     [Anterior] [Siguiente]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🩺 Pantalla 4: Sección F (Constantes Vitales)

```
┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN F: Constantes Vitales y Antropometría             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Fecha: [2025-02-05]  Hora: [14:35]                         │
│                                                              │
│ ─── VITALES ───────────────────────────────────────────────│
│                                                              │
│ Temperatura (°C):        [37.2]       (Normal: 36-37.5)    │
│ Presión Sistólica (mmHg):[130]        (Normal: 90-140)     │
│ Presión Diastólica (mmHg):[85]        (Normal: 60-90)      │
│ Pulso (x/min):           [72]         (Normal: 60-100)     │
│ Frecuencia Respiratoria: [18]         (Normal: 12-20)      │
│                                                              │
│ ─── ANTROPOMETRÍA ─────────────────────────────────────────│
│                                                              │
│ Peso (Kg): [75]    Talla (cm): [180]   IMC: [23.1] ✓       │
│                                                              │
│ Perímetro Abdominal (cm): [92]  (Normal: <102)             │
│                                                              │
│ ─── LABORATORIOS ──────────────────────────────────────────│
│                                                              │
│ Hemoglobina (g/dl):      [14.5]  (Normal: 13.5-17.5)      │
│ Glucosa Capilar (g/dl):  [98]    (Normal: 70-100)         │
│ Pleusovolumétrico (%):   [98]    (Normal: >80)            │
│                                                              │
│  [ ☑ Auto-guardar cada 30s ]     [Anterior] [Siguiente]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💊 Pantalla 5: Sección I (Diagnóstico)

```
┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN I: Diagnóstico                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ DIAGNÓSTICO PRINCIPAL * ─────────────────────────────────┐
│ │                                                           │
│ │ Diagnóstico:                                             │
│ │ ┌───────────────────────────────────────────────────────┐│
│ │ │ Lumbalgia mecánica con probable compromiso radicular││
│ │ └───────────────────────────────────────────────────────┘│
│ │                                                           │
│ │ Código CIE-10: [M54.5]                                 │
│ │ Clasificación: [CK ▼]                                  │
│ │                                                           │
│ └───────────────────────────────────────────────────────────┘
│                                                              │
│ ┌─ DIAGNÓSTICO SECUNDARIO 1 ────────────────────────────────┐
│ │                                                           │
│ │ Diagnóstico:                                             │
│ │ ┌───────────────────────────────────────────────────────┐│
│ │ │ Contractura muscular paravertebral                    ││
│ │ └───────────────────────────────────────────────────────┘│
│ │                                                           │
│ │ Código CIE-10: [M62.83]                                │
│ │ Clasificación: [FME ▼]                                 │
│ │                                                           │
│ └───────────────────────────────────────────────────────────┘
│                                                              │
│ ┌─ DIAGNÓSTICO SECUNDARIO 2 ────────────────────────────────┐
│ │                                                           │
│ │ Diagnóstico: [________________________]                 │
│ │ Código CIE-10: [________________________]                │
│ │ Clasificación: [CK ▼]                                  │
│ │                                                           │
│ └───────────────────────────────────────────────────────────┘
│                                                              │
│  [ ☑ Auto-guardar cada 30s ]     [Anterior] [Siguiente]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Pantalla 6: Sección J (Plan)

```
┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN J: Plan de Tratamiento                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Plan Diagnóstico *                                          │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ • Resonancia magnética de columna lumbo-sacra           ││
│ │ • Radiografía simple de columna en 2 proyecciones     ││
│ │ • Si sospecha radiculopatía: EMG/ENG                  ││
│ │                                                           ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Plan Terapéutico *                                          │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ • Fisioterapia: 2-3 veces por semana por 4 semanas     ││
│ │ • Reposo relativo: evitar carga excesiva              ││
│ │ • AINES: Ibuprofeno 400mg cada 8h por 7 días         ││
│ │ • Masoterapia y estiramientos                          ││
│ │ • Considerar infiltración si no hay mejoría           ││
│ │                                                           ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Plan Educacional                                            │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ • Postura correcta en actividades diarias              ││
│ │ • Ergonomía en el trabajo                              ││
│ │ • Ejercicios de fortalecimiento en casa                ││
│ │ • Importancia de la adherencia al tratamiento          ││
│ │                                                           ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [ ☑ Auto-guardar cada 30s ]     [Anterior] [Siguiente]   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✍️ Pantalla 7: Sección K (Profesional)

```
┌─────────────────────────────────────────────────────────────┐
│ SECCIÓN K: Datos del Profesional Responsable              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Fecha: [2025-02-05]  Hora: [14:35]  (auto-llenado)        │
│                                                              │
│ ─── DATOS DEL DOCTOR ───────────────────────────────────────│
│                                                              │
│ Nombre:              [Juan]                                 │
│ Primer Apellido:     [Pérez]                                │
│ Segundo Apellido:    [García]                               │
│ Documento/Cédula:    [MD-12345]                             │
│                                                              │
│ ─── FIRMA Y SELLO ──────────────────────────────────────────│
│                                                              │
│ Firma Digital:           Sello Profesional:                │
│ ┌──────────────────────┐ ┌────────────────────┐           │
│ │ 📎 Cargar Firma      │ │ 📎 Cargar Sello    │           │
│ └──────────────────────┘ └────────────────────┘           │
│                                                              │
│ ℹ️  Nota: Esta historia clínica será guardada con la      │
│     información del doctor autenticado. Todos los datos    │
│     serán registrados y auditables.                        │
│                                                              │
│  [ ☑ Auto-guardar cada 30s ]   [Anterior] [💾 Guardar]   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Pantalla 8: Confirmación de Guardado

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                  ✅ ¡Éxito!                                 │
│                                                              │
│         Historia Clínica Creada Correctamente               │
│                                                              │
│              Código: HC-2025-00047                          │
│              Fecha:  05/02/2025 14:47                       │
│              Paciente: Juan Pérez García                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    [👁️ Ver Documento]  [📥 Descargar PDF]  [📝 Editar]    │
│                                                              │
│              [Volver a Lista de HC]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Pantalla 9: Vista de Detalles (Ver)

```
┌─────────────────────────────────────────────────────────────┐
│  Historia Clínica HC-2025-00047 - LECTURA                 │
│  Creada: 05/02/2025 14:47 | Modificada: 05/02/2025 14:47 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [A.Datos][B.Motivo][C.Anteced...][E.Enfer...]...         │
│                                                              │
│ SECCIÓN A: Datos del Establecimiento y Paciente            │
│                                                              │
│  Institución: FisioLab                                      │
│  Código HC: HC-2025-00047                                   │
│                                                              │
│  Paciente: Juan Pérez García                                │
│  Sexo: Masculino | Edad: 45 años                            │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ SECCIÓN E: Enfermedad Actual                                │
│                                                              │
│  Descripción: Dolor en región lumbar que radía...          │
│  Cronología: Desde hace 6 meses                             │
│  Localización: Región lumbar L4-L5                          │
│  Intensidad (EVA): 7/10                                     │
│                                                              │
│ ... [resto de secciones] ...                                │
│                                                              │
│  [Editar] [Descargar PDF] [Volver]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Flujo de Navegación Completo

```
Dashboard
    │
    ├─ Historias Clínicas (NUEVA)
    │   │
    │   ├─ [Ver] → Lectura de HC (read-only)
    │   ├─ [Editar] → Formulario editable
    │   ├─ [Descargar] → PDF con formato oficial
    │   ├─ [Eliminar] → Soft delete con confirmación
    │   └─ [Nueva HC] → Formulario vacío para crear
    │
    └─ ... (otros módulos)
```

---

## 🎨 Colores y Diseño

```
Paleta de Colores:
├─ Primario:      #0891b2 (cyan-600) - Botones principales
├─ Secundario:    #64748b (slate-500) - Texto secundario
├─ Error:         #dc2626 (red-600) - Validaciones
├─ Success:       #16a34a (green-600) - Confirmaciones
├─ Background:    #f8fafc (slate-50) - Fondos
└─ Border:        #e2e8f0 (slate-200) - Bordes

Tipografía:
├─ Títulos:       Font-weight: 600 | Size: 18px
├─ Subtítulos:    Font-weight: 500 | Size: 16px
├─ Body:          Font-weight: 400 | Size: 14px
└─ Small:         Font-weight: 400 | Size: 12px
```

---

**Este es el flujo visual completo. La Fase 2 implementará estas pantallas.**
