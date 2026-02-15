# 💊 API de Recetas Médicas - FisioLab

## 📋 Descripción

Sistema de gestión de recetas médicas para doctores traumatólogos. Permite crear, consultar, actualizar y anular prescripciones médicas vinculadas a historias clínicas o de forma independiente.

---

## 🚀 Inicio Rápido

### 1. Ejecutar Migración de Base de Datos

```bash
# Conectar a PostgreSQL
psql -U fisio_user -d fisiolab_db

# Ejecutar migración
\i backend/dbService/migration-recetas-medicas.sql
```

### 2. Ejecutar Pruebas Unitarias

```bash
cd backend/api
node src/tests/recetas.test.js
```

### 3. Iniciar Servidor

```bash
cd backend/api
npm run dev
```

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT Bearer Token:

```http
Authorization: Bearer <token>
```

**Roles requeridos:** `DOCTOR` (solo doctores pueden gestionar recetas)

---

## 📡 Endpoints

### 1. Crear Receta Médica

**Endpoint:** `POST /api/recetas`

**Descripción:** Crea una nueva receta médica. Puede vincularse a una historia clínica existente o crearse de forma independiente.

**Request Body:**

```json
{
  "historia_clinica_id": "uuid-optional",  // Opcional para recetas rápidas
  "paciente_id": "uuid-required",
  "diagnostico_principal": "Esguince de tobillo grado II",
  "medicamentos": [
    {
      "nombre": "Ibuprofeno 600mg",
      "presentacion": "Tabletas",
      "dosis": "1 tableta cada 8 horas",
      "duracion": "7 días",
      "via_administracion": "Oral",
      "indicaciones": "Tomar con alimentos"
    },
    {
      "nombre": "Paracetamol 500mg",
      "presentacion": "Tabletas",
      "dosis": "1 tableta cada 6 horas si fiebre",
      "duracion": "5 días",
      "via_administracion": "Oral",
      "indicaciones": "Solo en caso de fiebre"
    }
  ],
  "indicaciones_generales": "Reposo relativo durante 7 días",
  "recomendaciones": "Aplicar hielo local 3 veces al día. Elevar pierna. Usar vendaje compresivo.",
  "vigencia_dias": 30,
  "firma_doctor": "data:image/png;base64,...",
  "numero_registro_medico": "12345-BOL"
}
```

**Campos Requeridos:**
- `paciente_id` ✅
- `diagnostico_principal` ✅
- `medicamentos` ✅ (mínimo 1)
  - Cada medicamento debe tener: `nombre`, `presentacion`, `dosis`, `duracion`, `via_administracion`

**Response 201 - Created:**

```json
{
  "success": true,
  "message": "Receta creada exitosamente",
  "data": {
    "id": "uuid-123",
    "codigo_receta": "RX-1707408234567-8912",
    "fecha_emision": "2026-02-08T14:30:45.123Z",
    "fecha_vencimiento": "2026-03-10",
    "estado": "activa"
  }
}
```

**Errores:**
- `400` - Datos inválidos o medicamentos incompletos
- `403` - Usuario no es DOCTOR
- `404` - Paciente o historia clínica no encontrada

---

### 2. Listar Recetas

**Endpoint:** `GET /api/recetas`

**Descripción:** Lista todas las recetas del doctor autenticado con paginación y filtros.

**Query Parameters:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `status` | string | Filtrar por estado | `activa`, `vencida`, `anulada` |
| `paciente_id` | uuid | Filtrar por paciente | `uuid-123` |
| `search` | string | Buscar en código/paciente/diagnóstico | `esguince` |
| `page` | integer | Número de página | `1` (default) |
| `page_size` | integer | Tamaño de página (max 100) | `20` (default) |

**Ejemplo:**

```http
GET /api/recetas?status=activa&page=1&page_size=20&search=ibuprofeno
```

**Response 200 - OK:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "codigo_receta": "RX-1707408234567-8912",
      "paciente_nombre_completo": "Juan Pérez García",
      "paciente_documento": "12345678",
      "diagnostico_principal": "Esguince de tobillo grado II",
      "fecha_emision": "2026-02-08T14:30:45.123Z",
      "fecha_vencimiento": "2026-03-10",
      "estado": "activa",
      "historia_clinica_id": "uuid-456",
      "cantidad_medicamentos": 2
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 45,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 3. Ver Receta Específica

**Endpoint:** `GET /api/recetas/:id`

**Descripción:** Obtiene los detalles completos de una receta.

**Response 200 - OK:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "historia_clinica_id": "uuid-456",
    "paciente_id": "uuid-789",
    "doctor_id": "uuid-doctor",
    "codigo_receta": "RX-1707408234567-8912",
    "paciente_nombre_completo": "Juan Pérez García",
    "paciente_documento": "12345678",
    "paciente_edad": 45,
    "paciente_sexo": "M",
    "medicamentos": [
      {
        "nombre": "Ibuprofeno 600mg",
        "presentacion": "Tabletas",
        "dosis": "1 tableta cada 8 horas",
        "duracion": "7 días",
        "via_administracion": "Oral",
        "indicaciones": "Tomar con alimentos"
      }
    ],
    "indicaciones_generales": "Reposo relativo durante 7 días",
    "recomendaciones": "Aplicar hielo local 3 veces al día",
    "diagnostico_principal": "Esguince de tobillo grado II",
    "firma_doctor": "data:image/png;base64,...",
    "numero_registro_medico": "12345-BOL",
    "nombre_doctor": "Dr. Carlos Ramírez",
    "fecha_emision": "2026-02-08T14:30:45.123Z",
    "vigencia_dias": 30,
    "fecha_vencimiento": "2026-03-10",
    "estado": "activa",
    "created_at": "2026-02-08T14:30:45.123Z",
    "updated_at": "2026-02-08T14:30:45.123Z"
  }
}
```

**Errores:**
- `403` - No tienes permisos para ver esta receta
- `404` - Receta no encontrada

---

### 4. Actualizar Receta

**Endpoint:** `PATCH /api/recetas/:id`

**Descripción:** Actualiza medicamentos e indicaciones de una receta activa.

**Request Body:**

```json
{
  "medicamentos": [
    {
      "nombre": "Diclofenaco 75mg",
      "presentacion": "Tabletas",
      "dosis": "1 tableta cada 12 horas",
      "duracion": "5 días",
      "via_administracion": "Oral",
      "indicaciones": "Con alimentos"
    }
  ],
  "indicaciones_generales": "Reposo absoluto por 10 días",
  "recomendaciones": "Fisioterapia después de 7 días"
}
```

**Response 200 - OK:**

```json
{
  "success": true,
  "message": "Receta actualizada exitosamente",
  "data": {
    "id": "uuid-123",
    "codigo_receta": "RX-1707408234567-8912",
    "updated_at": "2026-02-08T15:45:30.456Z"
  }
}
```

**Errores:**
- `400` - No se puede editar receta vencida/anulada
- `403` - Solo puedes editar tus propias recetas

---

### 5. Anular Receta

**Endpoint:** `DELETE /api/recetas/:id`

**Descripción:** Anula una receta (soft delete). Cambia el estado a "anulada".

**Response 200 - OK:**

```json
{
  "success": true,
  "message": "Receta anulada exitosamente"
}
```

---

### 6. Duplicar Receta

**Endpoint:** `POST /api/recetas/:id/duplicate`

**Descripción:** Crea una copia de una receta existente con nuevo código y fechas.

**Response 201 - Created:**

```json
{
  "success": true,
  "message": "Receta duplicada exitosamente",
  "data": {
    "id": "uuid-new",
    "codigo_receta": "RX-1707408999999-1234",
    "fecha_emision": "2026-02-08T16:00:00.000Z"
  }
}
```

---

### 7. Descargar PDF

**Endpoint:** `GET /api/recetas/:id/pdf`

**Descripción:** Genera y descarga el PDF de la receta.

**Response 200 - OK:**

```
Content-Type: application/pdf
```

*(Nota: Actualmente retorna JSON, pendiente implementar generación real de PDF)*

---

### 8. Obtener Datos para Receta desde HC

**Endpoint:** `GET /api/historias-clinicas/:id/datos-receta`

**Descripción:** Obtiene los datos necesarios de una historia clínica para crear una receta.

**Response 200 - OK:**

```json
{
  "success": true,
  "data": {
    "historia_clinica_id": "uuid-hc",
    "paciente_id": "uuid-paciente",
    "paciente_nombre_completo": "Juan Pérez García",
    "paciente_documento": "12345678",
    "paciente_edad": 45,
    "paciente_sexo": "M",
    "diagnostico_principal": "Fractura de radio distal tipo Colles",
    "tipo_historia": "traumatologica"
  }
}
```

---

## 📊 Estados de Receta

| Estado | Descripción |
|--------|-------------|
| `activa` | Receta válida y dentro del período de vigencia |
| `vencida` | Receta que ha superado la fecha de vencimiento |
| `anulada` | Receta anulada por el doctor (soft delete) |

---

## 🧪 Pruebas Unitarias

### Ejecutar Pruebas

```bash
node backend/api/src/tests/recetas.test.js
```

### Cobertura de Pruebas

- ✅ Generación de código único de receta
- ✅ Cálculo de fecha de vencimiento
- ✅ Validación de medicamentos (casos exitosos)
- ✅ Validación de array vacío
- ✅ Validación de campos faltantes
- ✅ Validación de campos vacíos
- ✅ Validación de múltiples medicamentos
- ✅ Formato de estructura de medicamento
- ✅ Vigencia personalizada (7, 60, 90 días)
- ✅ Estructura JSON completa de receta

**Total: 10 pruebas**

---

## 🗂️ Estructura de Base de Datos

### Tabla: `recetas_medicas`

```sql
CREATE TABLE recetas_medicas (
    id UUID PRIMARY KEY,
    historia_clinica_id UUID REFERENCES historias_clinicas(id),  -- Puede ser NULL
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    doctor_id UUID NOT NULL REFERENCES usuarios(id),
    codigo_receta VARCHAR(50) UNIQUE NOT NULL,
    
    -- Datos del paciente
    paciente_nombre_completo TEXT NOT NULL,
    paciente_documento TEXT NOT NULL,
    paciente_edad INT,
    paciente_sexo CHAR(1),
    
    -- Prescripción
    medicamentos JSONB NOT NULL,
    indicaciones_generales TEXT,
    recomendaciones TEXT,
    diagnostico_principal TEXT NOT NULL,
    
    -- Firma
    firma_doctor TEXT,
    numero_registro_medico TEXT,
    nombre_doctor TEXT NOT NULL,
    
    -- Control
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    vigencia_dias INT DEFAULT 30,
    fecha_vencimiento DATE NOT NULL,
    estado estado_receta DEFAULT 'activa',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### Índices

- `idx_recetas_medicas_doctor_id` - Búsqueda por doctor
- `idx_recetas_medicas_paciente_id` - Búsqueda por paciente
- `idx_recetas_medicas_historia_id` - Búsqueda por HC
- `idx_recetas_medicas_estado` - Filtro por estado
- `idx_recetas_medicas_fecha_emision` - Ordenamiento temporal
- `idx_recetas_medicas_codigo` - Búsqueda por código único

---

## 🔒 Seguridad y Validaciones

### Validaciones Backend

1. **Autenticación JWT** - Todos los endpoints requieren token válido
2. **Rol DOCTOR** - Solo doctores pueden gestionar recetas
3. **Propiedad de HC** - Solo puedes crear recetas desde tus propias HCs
4. **Medicamentos Obligatorios** - Mínimo 1 medicamento con campos completos
5. **Campos Requeridos**:
   - `nombre`, `presentacion`, `dosis`, `duracion`, `via_administracion`
6. **Estados de Receta** - No editar recetas vencidas/anuladas
7. **Soft Delete** - Las recetas eliminadas cambian estado, no se borran físicamente

### Permisos por Endpoint

| Endpoint | Rol Requerido | Validación Adicional |
|----------|---------------|----------------------|
| POST /recetas | DOCTOR | Paciente existe, HC es propia (si se proporciona) |
| GET /recetas | DOCTOR | Solo ve sus propias recetas |
| GET /recetas/:id | DOCTOR | Solo ve sus propias recetas |
| PATCH /recetas/:id | DOCTOR | Solo edita sus recetas activas |
| DELETE /recetas/:id | DOCTOR | Solo anula sus propias recetas |
| POST /recetas/:id/duplicate | DOCTOR | Solo duplica sus propias recetas |

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Crear Receta desde Historia Clínica

```bash
# 1. Obtener datos de la HC
curl -X GET http://localhost:3001/api/historias-clinicas/{hc_id}/datos-receta \
  -H "Authorization: Bearer <token>"

# 2. Crear receta con los datos obtenidos
curl -X POST http://localhost:3001/api/recetas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "historia_clinica_id": "uuid-from-step-1",
    "paciente_id": "uuid-from-step-1",
    "diagnostico_principal": "Fractura de radio distal",
    "medicamentos": [
      {
        "nombre": "Ibuprofeno 600mg",
        "presentacion": "Tabletas",
        "dosis": "1 tableta cada 8 horas",
        "duracion": "7 días",
        "via_administracion": "Oral",
        "indicaciones": "Con alimentos"
      }
    ],
    "indicaciones_generales": "Reposo e inmovilización",
    "vigencia_dias": 30
  }'
```

### Ejemplo 2: Crear Receta Rápida (sin HC)

```bash
curl -X POST http://localhost:3001/api/recetas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "uuid-paciente",
    "diagnostico_principal": "Cefalea tensional",
    "medicamentos": [
      {
        "nombre": "Paracetamol 500mg",
        "presentacion": "Tabletas",
        "dosis": "1 tableta cada 6 horas",
        "duracion": "3 días",
        "via_administracion": "Oral",
        "indicaciones": "Si persiste dolor"
      }
    ]
  }'
```

### Ejemplo 3: Listar Recetas Activas

```bash
curl -X GET "http://localhost:3001/api/recetas?status=activa&page=1&page_size=10" \
  -H "Authorization: Bearer <token>"
```

### Ejemplo 4: Duplicar Receta

```bash
curl -X POST http://localhost:3001/api/recetas/{receta_id}/duplicate \
  -H "Authorization: Bearer <token>"
```

---

## 🚨 Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | OK | Operación exitosa |
| 201 | Created | Receta creada |
| 400 | Bad Request | Datos inválidos, medicamentos incompletos |
| 401 | Unauthorized | Token faltante/inválido/expirado |
| 403 | Forbidden | Usuario no es DOCTOR, no tiene permisos |
| 404 | Not Found | Receta, paciente o HC no encontrada |
| 500 | Internal Server Error | Error del servidor |

### Formato de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en dev)"
}
```

---

## 📚 Próximas Mejoras

- [ ] Generación real de PDF con `pdfkit` o `puppeteer`
- [ ] Código QR de validación en PDF
- [ ] Catálogo de medicamentos con autocompletado
- [ ] Plantillas de recetas frecuentes
- [ ] Historial de modificaciones de recetas
- [ ] Notificación por email/SMS al paciente
- [ ] Portal del paciente para ver sus recetas
- [ ] Integración con farmacias (opcional)
- [ ] Firma digital avanzada
- [ ] Vencimiento automático de recetas (cron job)

---

## 👥 Autor

FisioLab Development Team - 2026

## 📄 Licencia

Privado - Uso interno de FisioLab
