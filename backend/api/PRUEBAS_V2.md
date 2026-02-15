# 🧪 Guía de Pruebas - Backend V2

## ✅ Estado de la Migración

**Migración ejecutada exitosamente:**
- ✓ evaluaciones_v2
- ✓ planes_v2  
- ✓ sesiones_v2
- ✓ logs_actividad
- ✓ 2 vistas
- ✓ 10 triggers

---

## 🔧 Configuración de Nombres de Tablas

**IMPORTANTE:** Las tablas V2 están nombradas como:
- `evaluaciones_v2` (no `evaluaciones`)
- `planes_v2` (no `planes_tratamiento`)
- `sesiones_v2` (no `sesiones`)

Los controllers y servicios deben actualizarse para usar estos nombres.

---

## 🧪 Pruebas de Endpoints

### 1. Health Check ✅
```bash
curl http://localhost:3001/api/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "version": "2.0"
}
```

### 2. Info V2 ✅
```bash
curl http://localhost:3001/api/v2/info
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "version": "2.0.0",
    "features": ["Arquitectura inmutable...", ...]
  }
}
```

---

## ⚠️ Pendientes

**Los siguientes archivos necesitan actualizarse para usar las tablas V2:**

1. `src/services/versionado.service.js`
   - Cambiar `evaluaciones` → `evaluaciones_v2`

2. `src/services/scheduling.service.js`
   - Cambiar `sesiones` → `sesiones_v2`
   - Cambiar `planes_tratamiento` → `planes_v2`

3. `src/controllers/evaluaciones.controller.v2.js`
   - Cambiar `evaluaciones` → `evaluaciones_v2`

4. `src/controllers/planes.controller.v2.js`
   - Cambiar `planes_tratamiento` → `planes_v2`
   - Cambiar `sesiones` → `sesiones_v2`

---

## 🚀 Próximo Paso

Necesitas actualizar los archivos mencionados arriba para usar los nombres correctos de las tablas V2.

**Opción rápida:** Buscar y reemplazar en cada archivo:
- `evaluaciones` → `evaluaciones_v2`
- `planes_tratamiento` → `planes_v2`  
- `sesiones` → `sesiones_v2`

Una vez actualizados, podrás probar los endpoints V2.
