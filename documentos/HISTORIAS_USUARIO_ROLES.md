# 🔐 Historias de Usuario - Gestión de Roles y Autenticación
## Doctor y Fisioterapeuta en FisioLab

---

## 📋 Índice

1. [Descripción General de Roles](#-descripción-general-de-roles)
2. [Historias de Usuario - Doctor](#-historias-de-usuario---doctor)
3. [Historias de Usuario - Fisioterapeuta](#-historias-de-usuario---fisioterapeuta)
4. [Historias de Usuario - Administrador (Recepcionista)](#-historias-de-usuario---administrador-recepcionista)
5. [Historias Compartidas](#-historias-compartidas)
6. [Matriz de Permisos](#-matriz-de-permisos)
7. [Flujos de Autenticación](#-flujos-de-autenticación)
8. [Especificaciones Técnicas](#-especificaciones-técnicas)

---

## 🎭 Descripción General de Roles

### **DOCTOR (Médico/Fisiatra)**
- Realiza evaluaciones médicas iniciales
- Diagnostica condiciones de pacientes
- Accede a resumen médico de pacientes
- Genera reportes médicos

### **FISIOTERAPEUTA**
- Ejecuta planes de tratamiento
- Realiza sesiones de terapia
- Registra evolución del paciente
- Carga ejercicios y técnicas aplicadas
- Comunica cambios al doctor
- Registra asistencia y pagos

---

## 👨‍⚕️ Historias de Usuario - Doctor

### UR001: Registrar Doctor en el Sistema
**Como** administrador del sistema  
**Quiero** registrar un nuevo doctor en la plataforma  
**Para** que pueda acceder con sus propias credenciales

**Criterios de Aceptación:**
- ✅ Registrar nuevo doctor con datos únicos
- ✅ Validar que el email sea único en el sistema
- ✅ Especificar especialidad médica (Médico General, Fisiatra, Cirujano, etc.)
- ✅ Asignar número de licencia/matrícula
- ✅ Establecer rol como "DOCTOR" en el sistema
- ✅ Crear contraseña temporal inicial
- ✅ Requiere contraseña en primer login
- ✅ Marcar como activo/inactivo

**Endpoint:** `POST /auth/register-doctor`

**Body Request:**
```json
{
  "email": "doctor@clinica.com",
  "nombre": "Juan",
  "apellido": "Pérez García",
  "especialidad": "Fisiatra",
  "numero_licencia": "MD-12345",
  "telefono": "555-1234",
  "avatar_url": "https://...",
  "password_temporal": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Doctor registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid-doctor-001",
      "email": "doctor@clinica.com",
      "nombre": "Juan",
      "apellido": "Pérez García",
      "rol": "DOCTOR",
      "especialidad": "Fisiatra",
      "numero_licencia": "MD-12345",
      "activo": true,
      "requiere_cambio_password": true
    },
    "token": "jwt-token-temporal"
  }
}
```

---

### UR002: Doctor Login con Email y Contraseña
**Como** doctor  
**Quiero** iniciar sesión en el sistema con email y contraseña  
**Para** acceder a mis pacientes y funciones

**Criterios de Aceptación:**
- ✅ Validar email y contraseña correctos
- ✅ Verificar que el usuario tiene rol "DOCTOR"
- ✅ Verificar que el doctor está activo
- ✅ Generar token JWT con rol incluido
- ✅ Si es primer login, solicitar cambio de contraseña
- ✅ Redirigir al dashboard del doctor
- ✅ Registrar log de login
- ✅ Mostrar error específico si falla

**Endpoint:** `POST /auth/login`

**Body Request:**
```json
{
  "email": "doctor@clinica.com",
  "password": "contraseña_segura",
  "rol": "DOCTOR"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid-doctor-001",
      "email": "doctor@clinica.com",
      "nombre": "Juan",
      "apellido": "Pérez García",
      "rol": "DOCTOR",
      "especialidad": "Fisiatra",
      "avatar_url": "https://...",
      "requiere_cambio_password": false,
      "activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

---

### UR003: Cambiar Contraseña en Primer Login
**Como** doctor  
**Quiero** cambiar mi contraseña temporal al acceder por primera vez  
**Para** establecer una contraseña propia y segura

**Criterios de Aceptación:**
- ✅ Validar que el usuario tenga `requiere_cambio_password = true`
- ✅ Solicitar contraseña actual (temporal)
- ✅ Solicitar nueva contraseña (mín 8 caracteres, mayúscula, número, símbolo)
- ✅ Confirmar nueva contraseña (debe coincidir)
- ✅ Validar que nueva contraseña sea diferente a la anterior
- ✅ Encriptar nueva contraseña
- ✅ Marcar como `requiere_cambio_password = false`
- ✅ Generar nuevo token después del cambio

**Endpoint:** `POST /auth/change-password-first-login`

**Body Request:**
```json
{
  "password_actual": "contraseña_temporal",
  "nueva_password": "MiNovaPassword123!",
  "confirmar_password": "MiNovaPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente",
  "data": {
    "user": {
      "id": "uuid-doctor-001",
      "email": "doctor@clinica.com",
      "rol": "DOCTOR",
      "requiere_cambio_password": false
    },
    "token": "nuevo-jwt-token",
    "redirectTo": "/doctor/dashboard"
  }
}
```

---

### UR004: Ver Dashboard del Doctor
**Como** doctor  
**Quiero** acceder a mi dashboard personalizado  
**Para** ver información relevante de mis pacientes y actividades

**Criterios de Aceptación:**
- ✅ Mostrar pacientes asignados al doctor
- ✅ Mostrar evaluaciones pendientes por realizar
- ✅ Mostrar planes de tratamiento creados
- ✅ Mostrar evolución de pacientes bajo su supervisión
- ✅ Mostrar citas agendadas para hoy
- ✅ Mostrar reportes de fisioterapeutas
- ✅ Acceder solo a información de sus pacientes
- ✅ Vista adaptada para doctor (no ver funciones de fisioterapeuta)

**Endpoint:** `GET /dashboard/doctor`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_pacientes": 24,
      "evaluaciones_pendientes": 3,
      "planes_activos": 18,
      "sesiones_hoy": 6
    },
    "citas_hoy": [
      {
        "id": "cita-001",
        "paciente": "María García",
        "hora": "09:00",
        "tipo": "Evaluación",
        "sala": "Consultorio 1"
      }
    ],
    "evaluaciones_pendientes": [
      {
        "id": "pac-001",
        "paciente": "Carlos López",
        "tipo_lesion": "Lumbalgia",
        "fecha_solicitud": "2025-02-04"
      }
    ],
    "pacientes_recientes": [...]
  }
}
```

---

### UR005: Crear Historia Clínica
**Como** doctor  
**Quiero** crear una historia clínica completa para un paciente  
**Para** documentar su evaluación médica inicial con todos los datos clínicos necesarios

**Criterios de Aceptación:**

#### **A. Datos del Establecimiento y Paciente**
- ✅ Seleccionar/crear institución del sistema
- ✅ Asignar código único de historia clínica
- ✅ Asignar número de archivo
- ✅ Registrar datos del paciente (apellidos, nombres, sexo, edad)
- ✅ Validar que email y documento sean únicos

#### **B. Motivo de Consulta**
- ✅ Registrar motivo de la primera consulta
- ✅ Permitir registro de consultas subsecuentes
- ✅ Registrar fecha de consulta

#### **C. Antecedentes Patológicos Personales**
- ✅ Seleccionar múltiples antecedentes médicos:
  - Cardiopatía
  - Hipertensión
  - Enfermedad Cardiovascular
  - Endocrino (Diabetes)
  - Cáncer
  - Tuberculosis
  - Enfermedad Infecciosa
  - Mal de Formación
  - Otro
- ✅ Agregar datos clínico-quirúrgicos, obstétricos y alergénicos relevantes

#### **E. Enfermedad o Problema Actual**
- ✅ Registrar descripción completa de la enfermedad actual
- ✅ Incluir cronología, localización, características e intensidad
- ✅ Registrar factores agravantes
- ✅ Registrar factores de alivio

#### **F. Constantes Vitales y Antropometría**
- ✅ Registrar fecha y hora
- ✅ Temperatura (°C)
- ✅ Presión Arterial (mmHg)
- ✅ Pulso (x/min)
- ✅ Frecuencia Respiratoria (/min)
- ✅ Peso (Kg)
- ✅ Talla (cm)
- ✅ IMC (Kg/m²)
- ✅ Perímetro Abdominal (cm)
- ✅ Hemoglobina (g/dl)
- ✅ Glucosa Capilar (g/dl)
- ✅ Pleusovolumétrico (%)

#### **G. Revisión Actual de Órganos y Sistemas**
- ✅ Seleccionar sistemas examinados:
  - Piel - Anexos
  - Órganos de los Sentidos
  - Respiratorio
  - Cárdio-Vascular
  - Digestivo
  - Genito-Urinario
  - Músculo-Esquelético
  - Endocrino
  - Hemo-Linfático
  - Nervioso
- ✅ Marcar patologías presentes con "X"
- ✅ Permitir descripción de hallazgos

#### **H. Examen Físico**
- ✅ **Regional:**
  - Piel-Panéreas
  - Cabeza
  - Ojos
  - Oídos
  - Nariz
  - Cuello
  
- ✅ **Abdomen:**
  - Boca
  - Garganta
  - Abdomen
  - Axlas-Mamas
  - Supereores

- ✅ **Sistemas:**
  - Abdomen
  - Urogenital
  - Respiratorio
  - Vascular
  - Digestivo
  - Hemo-Linfático
  - Esquelético
  - Neurológico

- ✅ Permitir descripción detallada de cada área examinada

#### **I. Diagnóstico**
- ✅ Registrar diagnóstico principal y secundarios
- ✅ Permitir clasificación de diagnósticos (CK, FME, IMF)
- ✅ Usar código diagnóstico si aplica

#### **J. Plan de Tratamiento**
- ✅ Registrar plan diagnóstico
- ✅ Registrar plan terapéutico
- ✅ Registrar plan educacional
- ✅ Permitir múltiples líneas de plan

#### **K. Datos del Profesional Responsable**
- ✅ Registrar fecha de consulta
- ✅ Registrar hora
- ✅ Registrar nombre completo del doctor
- ✅ Registrar primer apellido del doctor
- ✅ Registrar segundo apellido del doctor
- ✅ Registrar firma/sello del doctor
- ✅ Registrar número de documento de identificación

**Endpoint:** `POST /historias-clinicas`

**Body Request:**
```json
{
  "paciente_id": "pac-001",
  "doctor_id": "doctor-001",
  "fecha_consulta": "2025-02-05",
  "hora_consulta": "10:30",
  
  "A_datos_establecimiento": {
    "institucion": "Clínica FisioLab",
    "codigo_unico": "HC-2025-001",
    "numero_archivo": "ARH-001"
  },

  "B_motivo_consulta": {
    "primera_consulta": "Dolor lumbar crónico",
    "consultas_subsecuentes": ""
  },

  "C_antecedentes_patologicos": {
    "cardiopatia": false,
    "hipertension": true,
    "enf_cardiovascular": false,
    "endocrino": true,
    "cancer": false,
    "tuberculosis": false,
    "enf_infecciosa": false,
    "mal_formacion": false,
    "otros": "",
    "datos_clinicos": "Hipertensión controlada con losartán. Sin alergias conocidas."
  },

  "E_enfermedad_actual": {
    "descripcion": "Dolor lumbar de 3 meses de evolución",
    "cronologia": "Inició hace 3 meses sin causa aparente",
    "localizacion": "Región lumbar media",
    "caracteristicas": "Dolor tipo contractura, constante",
    "intensidad": "EVA 7/10",
    "factores_agravantes": "Sedestación prolongada, esfuerzo físico",
    "factores_alivio": "Reposo, calor local"
  },

  "F_constantes_vitales": {
    "fecha": "2025-02-05",
    "hora": "10:30",
    "temperatura_c": 36.8,
    "presion_arterial": "130/85",
    "pulso_xmin": 72,
    "frecuencia_respiratoria": 18,
    "peso_kg": 78,
    "talla_cm": 175,
    "imc": 25.4,
    "perimetro_abdominal_cm": 95,
    "hemoglobina_g_dl": 14.5,
    "glucosa_capilar_g_dl": 105,
    "pleusovolumerico_pct": 98
  },

  "G_revision_organos_sistemas": {
    "piel_anexos": true,
    "organos_sentidos": true,
    "respiratorio": false,
    "cardio_vascular": false,
    "digestivo": false,
    "genito_urinario": false,
    "musculo_esqueletico": true,
    "endocrino": false,
    "hemo_linfatico": false,
    "nervioso": false,
    "hallazgos": "Contractura paravertebral bilateral, limitación de movilidad"
  },

  "H_examen_fisico": {
    "regional": {
      "piel_panecas": "Normal",
      "cabeza": "Normal",
      "ojos": "Normal",
      "oidos": "Normal",
      "nariz": "Normal",
      "cuello": "Contractura trapecio bilateral"
    },
    "abdomen": {
      "boca": "Normal",
      "garganta": "Normal",
      "abdomen": "Normal",
      "axlas_mamas": "Normal",
      "supereores": "Normal"
    },
    "sistemas": {
      "abdomen": "Blando, depresible",
      "urogenital": "Normal",
      "respiratorio": "Movimientos normales",
      "vascular": "Pulsos presentes",
      "digestivo": "Ruidos normales",
      "hemo_linfatico": "Normal",
      "esqueletico": "Limitación ROM columna lumbar",
      "neurologico": "Reflejos normales"
    }
  },

  "I_diagnostico": [
    {
      "diagnostico_principal": "Lumbalgia mecánica",
      "clasificacion": "CK",
      "codigo": "M54.5"
    },
    {
      "diagnostico_secundario": "Contractura muscular",
      "clasificacion": "FME",
      "codigo": "M62.8"
    }
  ],

  "J_plan_tratamiento": {
    "plan_diagnostico": "Resonancia magnética de columna lumbar",
    "plan_terapeutico": "Fisioterapia 2-3 veces por semana, reposo relativo",
    "plan_educacional": "Ergonomía, ejercicios en casa, manejo del estrés"
  },

  "K_profesional_responsable": {
    "fecha": "2025-02-05",
    "hora": "10:30",
    "nombre_doctor": "Juan",
    "primer_apellido": "Pérez",
    "segundo_apellido": "García",
    "documento_identidad": "MD-12345",
    "firma_sello": "base64_encoded_image"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Historia clínica creada exitosamente",
  "data": {
    "id": "hc-001",
    "paciente_id": "pac-001",
    "doctor_id": "doctor-001",
    "codigo_unico": "HC-2025-001",
    "fecha_creacion": "2025-02-05T10:30:00Z",
    "estado": "completada",
    "url_documento": "/documentos/hc-001.pdf"
  }
}
```

---

### UR006: Ver Lista de Pacientes
**Como** doctor  
**Quiero** ver la lista de pacientes en el sistema  
**Para** seleccionar un paciente y crear o revisar su historia clínica

**Criterios de Aceptación:**
- ✅ Mostrar lista de todos los pacientes registrados
- ✅ Mostrar datos básicos (nombre, apellido, edad, documento)
- ✅ Buscar paciente por nombre, apellido o documento
- ✅ Mostrar si tiene historia clínica creada
- ✅ Mostrar fecha de última consulta
- ✅ Permitir filtrado por estado (activo/inactivo)
- ✅ Ordenar alfabéticamente

**Endpoint:** `GET /pacientes?rol=doctor&q=busqueda`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pac-001",
      "apellidos": "Pérez García",
      "nombres": "Carlos",
      "documento": "12345678",
      "edad": 45,
      "sexo": "M",
      "telefono": "555-1234",
      "email": "carlos@email.com",
      "tiene_historia_clinica": true,
      "fecha_ultima_consulta": "2025-02-05",
      "activo": true
    }
  ]
}
```

---

### UR007: Ver Detalle de Paciente
**Como** doctor  
**Quiero** ver el perfil completo de un paciente  
**Para** conocer sus datos personales antes de crear/revisar historia clínica

**Criterios de Aceptación:**
- ✅ Mostrar datos personales completos
- ✅ Mostrar datos de contacto (teléfono, email)
- ✅ Mostrar datos de emergencia
- ✅ Mostrar información ocupacional
- ✅ Mostrar antecedentes médicos generales
- ✅ Mostrar notas previas si existen
- ✅ Mostrar historial de historias clínicas creadas
- ✅ Permitir crear nueva historia clínica

**Endpoint:** `GET /pacientes/{id}?rol=doctor`

---

### UR008: Editar Historia Clínica
**Como** doctor  
**Quiero** editar una historia clínica existente  
**Para** corregir datos o agregar información faltante

**Criterios de Aceptación:**
- ✅ Acceder a historia clínica existente
- ✅ Poder editar todos los campos
- ✅ Registrar fecha de última edición
- ✅ Mantener historial de cambios
- ✅ Generar nueva versión del documento

**Endpoint:** `PUT /historias-clinicas/{id}`

---

### UR009: Ver Historia Clínica Completa
**Como** doctor  
**Quiero** ver una historia clínica creada previamente  
**Para** revisar los datos y el diagnóstico anterior

**Criterios de Aceptación:**
- ✅ Mostrar todos los datos de la historia clínica
- ✅ Mostrar en formato visual estructurado
- ✅ Permitir imprimir/descargar PDF
- ✅ Mostrar fecha de creación y doctor responsable
- ✅ Mostrar firma digital del doctor

**Endpoint:** `GET /historias-clinicas/{id}`

---

### UR010: Generar PDF de Historia Clínica
**Como** doctor  
**Quiero** descargar la historia clínica en formato PDF  
**Para** compartirla con el paciente o archivarla

**Criterios de Aceptación:**
- ✅ Generar documento PDF formateado profesionalmente
- ✅ Incluir encabezado con datos de la institución
- ✅ Incluir todos los datos clínicos
- ✅ Incluir firma y sello del doctor
- ✅ Incluir número de historia clínica
- ✅ Permitir descargar directamente

**Endpoint:** `GET /historias-clinicas/{id}/pdf`

---

## 🏥 Historias de Usuario - Fisioterapeuta

### UR011: Registrar Fisioterapeuta en el Sistema
**Como** administrador del sistema  
**Quiero** registrar un nuevo fisioterapeuta en la plataforma  
**Para** que pueda acceder con sus propias credenciales

**Criterios de Aceptación:**
- ✅ Registrar nuevo fisioterapeuta con datos únicos
- ✅ Validar que el email sea único
- ✅ Especificar especialidades (deportiva, pediátrica, etc.)
- ✅ Asignar número de licencia/matrícula
- ✅ Establecer rol como "FISIOTERAPEUTA"
- ✅ Crear contraseña temporal inicial
- ✅ Requiere cambio de contraseña en primer login
- ✅ Asignar color identificador para agenda

**Endpoint:** `POST /auth/register-fisioterapeuta`

**Body Request:**
```json
{
  "email": "fisio@clinica.com",
  "nombre": "María",
  "apellido": "López Rodríguez",
  "especialidades": ["Deporte", "Musculoesquelética"],
  "numero_licencia": "LIC-FT-54321",
  "telefono": "555-5678",
  "color_agenda": "#FF6B6B",
  "avatar_url": "https://...",
  "comision_porcentaje": 20
}
```

---

### UR012: Fisioterapeuta Login
**Como** fisioterapeuta  
**Quiero** iniciar sesión con email y contraseña  
**Para** acceder a mis pacientes y sesiones

**Criterios de Aceptación:**
- ✅ Validar email y contraseña
- ✅ Verificar rol "FISIOTERAPEUTA"
- ✅ Verificar que está activo
- ✅ Generar token JWT con permisos específicos
- ✅ Redirigir a dashboard de fisioterapeuta
- ✅ Mostrar sesiones programadas para hoy
- ✅ Registrar log de login

**Endpoint:** `POST /auth/login`

**Body Request:**
```json
{
  "email": "fisio@clinica.com",
  "password": "contraseña_segura",
  "rol": "FISIOTERAPEUTA"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid-fisio-001",
      "email": "fisio@clinica.com",
      "nombre": "María",
      "apellido": "López",
      "rol": "FISIOTERAPEUTA",
      "especialidades": ["Deporte", "Musculoesquelética"],
      "avatar_url": "https://...",
      "color_agenda": "#FF6B6B"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

---

### UR013: Ver Dashboard de Fisioterapeuta
**Como** fisioterapeuta  
**Quiero** acceder a mi dashboard personalizado  
**Para** ver mis sesiones, pacientes y tareas del día

**Criterios de Aceptación:**
- ✅ Mostrar sesiones programadas para hoy
- ✅ Mostrar pacientes bajo mi cuidado
- ✅ Mostrar planes de tratamiento activos
- ✅ Mostrar notas pendientes por registrar
- ✅ Mostrar tareas urgentes
- ✅ Ver ingresos del mes (comisiones)
- ✅ Acceder solo a información de sus pacientes
- ✅ Vista adaptada para fisioterapeuta

**Endpoint:** `GET /dashboard/fisioterapeuta`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sesiones_hoy": 6,
    "proxima_sesion": {
      "id": "ses-001",
      "paciente": "Carlos López",
      "hora": "10:00",
      "duracion": "60 min",
      "sala": "Sala 2",
      "plan": "Lumbalgia - Sesión 5/12"
    },
    "pacientes_activos": 12,
    "planes_activos": 10,
    "tareas_pendientes": 3,
    "ingresos_mes": 2500,
    "comisiones_mes": 500,
    "sesiones_próximos_dias": [...]
  }
}
```

---

### UR014: Ver Detalle de Paciente (Fisioterapeuta)
**Como** fisioterapeuta  
**Quiero** acceder al perfil completo del paciente  
**Para** conocer su historial médico y plan de tratamiento

**Criterios de Aceptación:**
- ✅ Ver datos personales del paciente
- ✅ Ver evaluación médica realizada por doctor
- ✅ Ver plan de tratamiento autorizado
- ✅ Ver historial de sesiones anteriores
- ✅ Ver precauciones y contraindicaciones
- ✅ Ver notas médicas del doctor
- ✅ Ver contacto de emergencia
- ✅ Ver antecedentes médicos relevantes

**Endpoint:** `GET /pacientes/{id}?rol=FISIOTERAPEUTA`

---

### UR015: Realizar Sesión de Tratamiento
**Como** fisioterapeuta  
**Quiero** registrar una sesión de tratamiento  
**Para** documentar el trabajo realizado con el paciente

**Criterios de Aceptación:**
- ✅ Registrar hora de inicio y fin
- ✅ Registrar ejercicios realizados
- ✅ Registrar técnicas aplicadas (masaje, estiramiento, etc.)
- ✅ Registrar escala EVA (dolor) actual del paciente
- ✅ Registrar observaciones de la sesión
- ✅ Adjuntar fotos/videos de ejercicios
- ✅ Marcar sesión como completada
- ✅ Registrar asistencia del paciente

**Endpoint:** `POST /sesiones`

**Body Request:**
```json
{
  "paciente_id": "pac-001",
  "plan_id": "plan-001",
  "fecha_sesion": "2025-02-05T10:00:00Z",
  "hora_inicio": "10:00",
  "hora_fin": "11:00",
  "duracion_minutos": 60,
  "asistencia": true,
  "escala_eva_inicial": 7,
  "escala_eva_final": 5,
  "ejercicios": [
    {
      "nombre": "Flexión lumbar",
      "series": 3,
      "repeticiones": 10,
      "observaciones": "Sin dolor"
    }
  ],
  "tecnicas": ["Masaje terapéutico", "Estiramientos estáticos"],
  "observaciones": "Buen progreso, paciente motivado",
  "notas_medicas": "Comunicar al doctor sobre mejora"
}
```

---

### UR016: Registrar Notas de Evolución
**Como** fisioterapeuta  
**Quiero** agregar notas de evolución entre sesiones  
**Para** documentar cambios en el estado del paciente

**Criterios de Aceptación:**
- ✅ Agregar notas de texto
- ✅ Registrar cambios en movilidad
- ✅ Registrar cambios en dolor
- ✅ Registrar cambios en funcionalidad
- ✅ Poder editar notas antes de cerrar sesión
- ✅ Registrar fecha y hora de la nota
- ✅ Notificar al doctor si hay cambios significativos

**Endpoint:** `POST /sesiones/{id}/notas`

---

### UR017: Ver Plan de Tratamiento Asignado
**Como** fisioterapeuta  
**Quiero** revisar el plan de tratamiento del paciente  
**Para** cumplir con los objetivos establecidos por el doctor

**Criterios de Aceptación:**
- ✅ Ver objetivos médicos del plan
- ✅ Ver número de sesiones totales y realizadas
- ✅ Ver técnicas recomendadas por el doctor
- ✅ Ver precauciones especiales
- ✅ Ver evaluación inicial y recomendaciones
- ✅ Ver progreso general del plan
- ✅ Ver comentarios del doctor

**Endpoint:** `GET /planes/{id}/detalle-fisio`

---

### UR018: Solicitar Cambio de Plan al Doctor
**Como** fisioterapeuta  
**Quiero** solicitar al doctor un cambio en el plan de tratamiento  
**Para** adaptar el tratamiento si el progreso no es el esperado

**Criterios de Aceptación:**
- ✅ Enviar solicitud al doctor asignado
- ✅ Incluir motivo del cambio (mejora rápida, estancamiento, complicación)
- ✅ Proponer nuevas técnicas
- ✅ Sugerir número de sesiones adicionales
- ✅ Registrar fecha de solicitud
- ✅ Ver estado de la solicitud (pendiente, aprobada, rechazada)
- ✅ Recibir notificación cuando el doctor responda

**Endpoint:** `POST /planes/{id}/solicitar-cambio`

**Body Request:**
```json
{
  "motivo": "Progreso más rápido que lo esperado",
  "observaciones": "Paciente mejorando rápidamente, sesiones pueden reducirse",
  "sesiones_sugeridas": 8,
  "nuevas_tecnicas": ["Ejercicio en casa"]
}
```

---

### UR019: Registrar Asistencia y Pagos
**Como** fisioterapeuta  
**Quiero** registrar cuando un paciente asiste o no a su sesión  
**Para** controlar la asistencia y facturación

**Criterios de Aceptación:**
- ✅ Marcar presencia/ausencia del paciente
- ✅ Registrar si fue cancelada por el paciente
- ✅ Registrar si fue cancelada por la clínica
- ✅ Registrar pago realizado en sesión
- ✅ Generar comprobante de pago
- ✅ Calcular automáticamente comisión del fisioterapeuta
- ✅ Notificar recepción del pago

**Endpoint:** `PUT /sesiones/{id}/asistencia-pago`

---

### UR020: Ver Mi Calendario de Sesiones
**Como** fisioterapeuta  
**Quiero** ver mi calendario personal de sesiones  
**Para** organizar mi día y saber con qué pacientes trabajaré

**Criterios de Aceptación:**
- ✅ Ver calendario por semana o mes
- ✅ Mostrar solo mis sesiones
- ✅ Ver datos del paciente en cada sesión
- ✅ Ver sala y recursos asignados
- ✅ Cambiar vista (agenda, tabla)
- ✅ Mostrar sesiones realizadas vs pendientes
- ✅ Poder filtrar por estado

**Endpoint:** `GET /calendario/fisioterapeuta?desde=&hasta=`

---

### UR021: Generar Reporte de Paciente
**Como** fisioterapeuta  
**Quiero** generar un reporte de evolución del paciente  
**Para** compartirlo con el doctor o el paciente

**Criterios de Aceptación:**
- ✅ Incluir sesiones realizadas
- ✅ Incluir evolución del dolor (gráfico EVA)
- ✅ Incluir cambios en ROM
- ✅ Incluir ejercicios realizados
- ✅ Incluir observaciones generales
- ✅ Poder exportar a PDF
- ✅ Mantener copia en el sistema

**Endpoint:** `GET /reportes/paciente/{id}/fisioterapeuta`

---

### UR022: Ver Ingresos y Comisiones
**Como** fisioterapeuta  
**Quiero** ver mis ingresos y comisiones generadas  
**Para** controlar mis ganancias

**Criterios de Aceptación:**
- ✅ Ver total de sesiones realizadas
- ✅ Ver ingresos brutos
- ✅ Ver comisión calculada
- ✅ Ver desglose por mes
- ✅ Ver pagos recibidos
- ✅ Filtrar por rango de fechas
- ✅ Exportar reporte

**Endpoint:** `GET /finanzas/mi-comisiones`

---

## 🔐 Historias de Usuario - Administrador (Recepcionista)

### UR023: Registrar Administrador
**Como** propietario/gerente de clínica  
**Quiero** crear un usuario administrador  
**Para** que gestione usuarios, citas y facturación

**Criterios de Aceptación:**
- ✅ Crear cuenta con rol "ADMIN"
- ✅ Especificar nivel de acceso (total, limitado)
- ✅ Crear contraseña temporal
- ✅ Requerir cambio en primer login
- ✅ Asignar permisos específicos

**Endpoint:** `POST /auth/register-admin`

---

### UR024: Admin Login
**Como** administrador/recepcionista  
**Quiero** iniciar sesión en el sistema  
**Para** acceder a todas las funciones administrativas

**Criterios de Aceptación:**
- ✅ Validar credenciales
- ✅ Verificar rol "ADMIN"
- ✅ Generar token con permisos totales
- ✅ Redirigir a panel administrativo
- ✅ Registrar acceso

**Endpoint:** `POST /auth/login`

---

### UR025: Ver Dashboard Administrativo
**Como** administrador  
**Quiero** ver un dashboard con toda la información de la clínica  
**Para** controlar todas las operaciones

**Criterios de Aceptación:**
- ✅ Mostrar estadísticas globales
- ✅ Mostrar citas programadas
- ✅ Mostrar ingresos totales
- ✅ Mostrar ocupación de recursos
- ✅ Mostrar lista de usuarios
- ✅ Acceso a todos los reportes
- ✅ Datos en tiempo real

**Endpoint:** `GET /dashboard/admin`

---

### UR026: Gestionar Usuarios del Sistema
**Como** administrador  
**Quiero** crear, editar y desactivar usuarios  
**Para** controlar el acceso al sistema

**Criterios de Aceptación:**
- ✅ Ver lista de todos los usuarios
- ✅ Crear nuevos usuarios (Doctor, Fisioterapeuta, Admin)
- ✅ Editar datos de usuario
- ✅ Desactivar/activar usuarios
- ✅ Resetear contraseña de usuario
- ✅ Ver historial de accesos
- ✅ Asignar permisos específicos

**Endpoint:** `GET/POST/PUT/DELETE /admin/usuarios`

---

---

## 🔄 Historias Compartidas

### UR027: Cambiar Contraseña Personal
**Como** cualquier usuario (Doctor, Fisioterapeuta, Admin)  
**Quiero** cambiar mi contraseña  
**Para** mantener mi cuenta segura

**Criterios de Aceptación:**
- ✅ Validar contraseña actual
- ✅ Solicitar nueva contraseña con requisitos fuertes
- ✅ Confirmar nueva contraseña
- ✅ Encriptar y guardar
- ✅ Generar nuevo token
- ✅ Mostrar mensaje de éxito

**Endpoint:** `PUT /auth/cambiar-password`

---

### UR028: Recuperar Contraseña Olvidada
**Como** usuario  
**Quiero** recuperar mi contraseña olvidada  
**Para** poder volver a acceder al sistema

**Criterios de Aceptación:**
- ✅ Solicitar email
- ✅ Validar que email existe
- ✅ Generar token de recuperación temporal
- ✅ Enviar email con enlace
- ✅ Permitir establecer nueva contraseña
- ✅ Token válido por 1 hora
- ✅ Registrar intento de recuperación

**Endpoint:** `POST /auth/forgot-password`

---

### UR029: Cerrar Sesión
**Como** cualquier usuario  
**Quiero** cerrar mi sesión  
**Para** asegurar que otros no puedan usar mi cuenta

**Criterios de Aceptación:**
- ✅ Invalidar token actual
- ✅ Limpiar datos de sesión
- ✅ Redirigir a página de login
- ✅ Mostrar mensaje de despedida
- ✅ Registrar log de logout

**Endpoint:** `POST /auth/logout`

---

### UR030: Ver Mi Perfil
**Como** cualquier usuario  
**Quiero** ver mi información de perfil  
**Para** verificar que mis datos son correctos

**Criterios de Aceptación:**
- ✅ Mostrar todos mis datos personales
- ✅ Mostrar mi rol y permisos
- ✅ Mostrar fecha de último acceso
- ✅ Mostrar especialidad/área (si aplica)
- ✅ Poder editar algunos datos (nombre, teléfono, avatar)

**Endpoint:** `GET /auth/me` o `GET /perfil`

---

### UR031: Editar Mi Perfil
**Como** cualquier usuario  
**Quiero** actualizar mi información de perfil  
**Para** mantener mis datos actualizados

**Criterios de Aceptación:**
- ✅ Poder cambiar avatar
- ✅ Poder cambiar teléfono
- ✅ Poder cambiar información de contacto
- ✅ No poder cambiar email ni rol
- ✅ Validar datos antes de guardar
- ✅ Mostrar confirmación de actualización

**Endpoint:** `PUT /perfil`

---

---

## 🔐 Matriz de Permisos

| Funcionalidad | Doctor | Fisioterapeuta |
|---------------|--------|-----------------|
| **Ver Lista de Pacientes** | ✅ | ❌ |
| **Ver Detalle de Paciente** | ✅ | ❌ |
| **Crear Historia Clínica** | ✅ | ❌ |
| **Editar Historia Clínica** | ✅ | ❌ |
| **Ver Historia Clínica** | ✅ | ❌ |
| **Descargar PDF Historia Clínica** | ✅ | ❌ |
| **Realizar Sesión de Terapia** | ❌ | ✅ |
| **Registrar Evolución** | ✅ | ✅ |
| **Cambiar Contraseña** | ✅ | ✅ |
| **Recuperar Contraseña** | ✅ | ✅ |
| **Cerrar Sesión** | ✅ | ✅ |
| **Ver Perfil** | ✅ | ✅ |
| **Editar Perfil** | ✅ | ✅ |

---

## 🔄 Flujos de Autenticación

### Flujo 1: Login y Acceso por Rol

```
┌─────────────────┐
│   Usuario       │
└────────┬────────┘
         │
         ▼
    ┌────────────────────┐
    │  Ingresar Email    │
    │  Contraseña + Rol  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ Validar Credenciales en BD │
    └────────┬───────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
    ✅ VÁLIDO    ❌ INVÁLIDO
        │          │
        │          └─► Error 401
        │             (Login fallido)
        │
        ▼
   ┌──────────────────┐
   │ Generar JWT      │
   │ (con rol)        │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Verificar:                   │
   │ - rol = DOCTOR?              │
   │ - rol = FISIOTERAPEUTA?      │
   │ - rol = ADMIN?               │
   └────────┬─────────────────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
 DOCTOR  FISIO   ADMIN
    │       │       │
    └───────┼───────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Redirigir a Dashboard Según Rol:
   │ - /doctor/dashboard          │
   │ - /fisio/dashboard           │
   │ - /admin/dashboard           │
   └──────────────────────────────┘
```

### Flujo 2: Cambio de Contraseña en Primer Login

```
┌─────────────────────────────────┐
│ Doctor/Fisio Primer Login       │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ requiere_cambio_password = true? │
└────────┬──────────────┬──────────┘
         │              │
        SÍ             NO
         │              │
         ▼              ▼
    ┌─────────┐    ┌──────────────┐
    │ Mostrar │    │ Ir a         │
    │ Pantalla│    │ Dashboard    │
    │ Cambio  │    └──────────────┘
    │ Password│
    └────┬────┘
         │
         ▼
    ┌─────────────────────────┐
    │ Validar:                │
    │ - Pass temporal actual  │
    │ - Pass nueva (8+ chars) │
    │ - Confirmar Pass        │
    └────┬──────────┬─────────┘
         │          │
       ✅            ❌
         │          │
         │          └─► Error
         │
         ▼
    ┌──────────────────┐
    │ Hash Nueva Pass  │
    │ Guardar en BD    │
    │ requerimiento=no │
    └────┬─────────────┘
         │
         ▼
    ┌──────────────────┐
    │ Nuevo JWT Token  │
    └────┬─────────────┘
         │
         ▼
    ┌──────────────────┐
    │ Ir a Dashboard   │
    └──────────────────┘
```

### Flujo 3: Flujo de Crear Paciente (Doctor vs Fisioterapeuta)

```
                ┌─────────────────┐
                │ Nuevo Paciente  │
                └────────┬────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ ¿Quién crea? │
                  └──┬──────┬────┘
                     │      │
                   DOCTOR  FISIO
                     │      │
         ┌───────────┘      └────────────┐
         │                               │
         ▼                               ▼
    ┌──────────────┐              ┌──────────────┐
    │ Eval. Médica │              │ No puede crear│
    │ + Plan       │              │ Solo ver      │
    │              │              │ datos         │
    └──────────────┘              └──────────────┘
```

---

## 📊 Especificaciones Técnicas

### Estructura de Token JWT

```javascript
{
  "userId": "uuid-001",
  "email": "doctor@clinica.com",
  "rol": "DOCTOR",  // DOCTOR | FISIOTERAPEUTA | ADMIN
  "especialidad": "Fisiatra",
  "iat": 1707138000,
  "exp": 1707742800
}
```

### Tabla de Usuarios en BD

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rol ENUM('DOCTOR', 'FISIOTERAPEUTA', 'ADMIN') NOT NULL,
  especialidad VARCHAR(100),
  numero_licencia VARCHAR(50) UNIQUE,
  avatar_url VARCHAR(255),
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  requiere_cambio_password BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_email ON usuarios(email);
CREATE INDEX idx_rol ON usuarios(rol);
CREATE INDEX idx_activo ON usuarios(activo);
```

### Middleware de Autenticación por Rol

```javascript
// Ejemplo de middleware
export const requireDoctor = (req, res, next) => {
  if (req.user.rol !== 'DOCTOR') {
    return res.status(403).json({
      success: false,
      message: 'Solo doctores pueden acceder a este recurso'
    });
  }
  next();
};

export const requireFisio = (req, res, next) => {
  if (req.user.rol !== 'FISIOTERAPEUTA') {
    return res.status(403).json({
      success: false,
      message: 'Solo fisioterapeutas pueden acceder a este recurso'
    });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden acceder a este recurso'
    });
  }
  next();
};
```

### Endpoints Protegidos por Rol

```javascript
// Router de doctor
doctorRouter.post('/evaluacion', requireDoctor, createEvaluacion);
doctorRouter.post('/plan', requireDoctor, createPlan);
doctorRouter.get('/supervision', requireDoctor, getSupervis);

// Router de fisioterapeuta
fisioRouter.post('/sesion', requireFisio, createSesion);
fisioRouter.put('/sesion/:id', requireFisio, updateSesion);
fisioRouter.get('/mis-pacientes', requireFisio, getMisPacientes);

// Router de admin
adminRouter.get('/usuarios', requireAdmin, getUsuarios);
adminRouter.post('/usuarios', requireAdmin, createUsuario);
adminRouter.get('/reportes', requireAdmin, getReportes);
```

---

## 🎯 Resumen de Historias de Roles

| ID | Historia | Doctor | Fisio |
|----|----------|--------|-------|
| **UR001** | Registrar Doctor | Admin | - |
| **UR002** | Doctor Login | Doctor | - |
| **UR003** | Cambiar Pass (Primer Login) | Doctor | - |
| **UR004** | Dashboard Doctor | Doctor | - |
| **UR005** | Crear Historia Clínica | Doctor | - |
| **UR006** | Ver Lista de Pacientes | Doctor | - |
| **UR007** | Ver Detalle de Paciente | Doctor | - |
| **UR008** | Editar Historia Clínica | Doctor | - |
| **UR009** | Ver Historia Clínica Completa | Doctor | - |
| **UR010** | Generar PDF Historia Clínica | Doctor | - |
| **UR011** | Registrar Fisioterapeuta | Admin | - |
| **UR012** | Fisio Login | - | Fisio |
| **UR013** | Dashboard Fisioterapeuta | - | Fisio |
| **UR014** | Ver Detalle Paciente | - | Fisio |
| **UR015** | Realizar Sesión | - | Fisio |
| **UR016** | Registrar Notas Evolución | - | Fisio |
| **UR017** | Ver Plan Asignado | - | Fisio |
| **UR018** | Solicitar Cambio Plan | - | Fisio |
| **UR019** | Registrar Asistencia/Pagos | - | Fisio |
| **UR020** | Ver Calendario Sesiones | - | Fisio |
| **UR021** | Generar Reporte Paciente | - | Fisio |
| **UR022** | Ver Ingresos/Comisiones | - | Fisio |
| **UR027** | Cambiar Contraseña Personal | ✅ | ✅ |
| **UR028** | Recuperar Contraseña | ✅ | ✅ |
| **UR029** | Cerrar Sesión | ✅ | ✅ |
| **UR030** | Ver Mi Perfil | ✅ | ✅ |
| **UR031** | Editar Mi Perfil | ✅ | ✅ |

**Total de Historias de Roles:** 27 (sin Admin)

---

## 📌 Notas Finales

### Consideraciones de Seguridad
- 🔒 Todas las contraseñas se almacenan hasheadas
- 🔒 Tokens JWT con expiración de 7 días
- 🔒 Middleware de autenticación en todas las rutas protegidas
- 🔒 Validación de rol en endpoints sensibles
- 🔒 Logs de acceso y cambios

### Consideraciones de Usabilidad
- 👤 Dashboard personalizado para cada rol
- 👤 Solo ver información permitida para el rol
- 👤 Flujos optimizados por tipo de usuario
- 👤 Notificaciones relevantes a cada rol

---

**Versión:** 2.0  
**Fecha:** 2025-02-05  
**Autor:** Andres Rodriguez @ MagicCorp  
**Estado:** ✅ Completo y Listo para Desarrollo
