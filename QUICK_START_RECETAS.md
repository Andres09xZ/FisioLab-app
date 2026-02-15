# 🚀 QUICK START - Recetas Médicas API

## ⚡ Implementar en 3 Pasos

### PASO 1: Ejecutar Migración de Base de Datos

```bash
# Opción A: Desde PostgreSQL
psql -U fisio_user -d fisiolab_db -f backend/dbService/migration-recetas-medicas.sql

# Opción B: Desde pgAdmin o DBeaver
# Abrir y ejecutar: backend/dbService/migration-recetas-medicas.sql
```

**Verificar migración:**
```sql
SELECT * FROM recetas_medicas LIMIT 1;  -- Debe retornar estructura vacía
```

---

### PASO 2: Ejecutar Pruebas

```bash
cd backend/api
node src/tests/recetas.test.js
```

**Resultado esperado:**
```
✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE
Total de pruebas: 10
Estado: ✅ PASS
```

---

### PASO 3: Iniciar el Servidor

```bash
cd backend/api
npm run dev
```

**Verificar que el servidor inició:**
```bash
curl http://localhost:3001/api/health
```

---

## 🧪 Probar la API

### 1. Obtener Token (Login)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@fisiolab.com",
    "password": "tu_password"
  }'
```

**Guarda el token retornado:** `eyJhbGciOiJIUzI1NiIs...`

---

### 2. Crear Primera Receta

```bash
curl -X POST http://localhost:3001/api/recetas \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "REEMPLAZAR_CON_UUID_PACIENTE",
    "diagnostico_principal": "Esguince de tobillo grado II",
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
    "vigencia_dias": 30
  }'
```

---

### 3. Listar Recetas

```bash
curl -X GET "http://localhost:3001/api/recetas?status=activa" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

### 4. Ver Receta Específica

```bash
curl -X GET "http://localhost:3001/api/recetas/RECETA_ID" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📋 Obtener IDs Necesarios

### Obtener ID de Paciente

```bash
curl -X GET "http://localhost:3001/api/pacientes" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Obtener ID de Historia Clínica

```bash
curl -X GET "http://localhost:3001/api/historias-clinicas" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Obtener Datos desde HC para Receta

```bash
curl -X GET "http://localhost:3001/api/historias-clinicas/HC_ID/datos-receta" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🐛 Troubleshooting

### Error: "Solo doctores pueden crear recetas"

**Solución:** Verifica que el usuario autenticado tiene `rol = 'DOCTOR'`

```sql
-- Cambiar rol de usuario
UPDATE usuarios SET rol = 'DOCTOR' WHERE email = 'tu_email@fisiolab.com';
```

---

### Error: "Tabla recetas_medicas no existe"

**Solución:** Ejecuta la migración

```bash
psql -U fisio_user -d fisiolab_db -f backend/dbService/migration-recetas-medicas.sql
```

---

### Error: "Token inválido o expirado"

**Solución:** Genera un nuevo token haciendo login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@fisiolab.com", "password": "tu_password"}'
```

---

### Error: "Paciente no encontrado"

**Solución:** Verifica que el UUID del paciente existe

```sql
SELECT id, nombres, apellidos FROM pacientes LIMIT 5;
```

---

## 📚 Documentación Completa

- **API Completa:** [RECETAS_API_DOCUMENTATION.md](./RECETAS_API_DOCUMENTATION.md)
- **Resumen de Implementación:** [RECETAS_IMPLEMENTATION_SUMMARY.md](./RECETAS_IMPLEMENTATION_SUMMARY.md)
- **Código Fuente:** `src/controllers/recetas.controller.js`
- **Pruebas:** `src/tests/recetas.test.js`

---

## ✅ Checklist de Implementación

- [ ] Migración ejecutada en BD
- [ ] Pruebas unitarias ejecutadas (10/10 pass)
- [ ] Servidor iniciado correctamente
- [ ] Token de autenticación obtenido
- [ ] Primera receta creada exitosamente
- [ ] Recetas listadas correctamente

---

## 🎯 Próximo Paso: Frontend

Ahora que el backend está completo y probado, el siguiente paso es:

1. Crear componentes React para el módulo de recetas
2. Formulario de creación de receta
3. Lista de recetas con filtros
4. Vista detalle de receta
5. Generación de PDF

**Pregunta:** ¿Quieres que continúe con el desarrollo del frontend ahora?

---

**Estado:** ✅ Backend completado y listo para usar

**Tiempo estimado frontend:** 2-3 horas

---

## 📞 Ayuda Adicional

Si necesitas ayuda con:
- Frontend de recetas
- Generación de PDF
- Integración con historias clínicas
- Notificaciones al paciente
- Portal del paciente

Solo pregunta! 🚀
