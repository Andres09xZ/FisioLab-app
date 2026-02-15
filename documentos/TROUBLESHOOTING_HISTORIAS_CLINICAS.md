# 🔧 Troubleshooting: Error al Cargar Historias Clínicas

## ❌ Problema
```
Error al cargar historias clínicas
app/historias-clinicas/page.tsx (63:31)
```

---

## 🔍 Causas Comunes

### 1. **Backend no está corriendo**
- **Síntoma**: `Error: Failed to fetch` o `Error connecting to 127.0.0.1:3001`
- **Solución**:
```powershell
cd backend\api
npm run dev
```
Espera a ver: `✓ Server running on http://localhost:3001`

### 2. **Usuario no está autenticado**
- **Síntoma**: Error 401 Unauthorized
- **Solución**:
  - Ve a http://localhost:3000/login
  - Inicia sesión con credenciales válidas
  - Verifica que se guardó el token: `localStorage.getItem('fisiolab_token')`

### 3. **Token expirado o inválido**
- **Síntoma**: 401 Unauthorized
- **Solución**:
  - Limpia localStorage: `localStorage.clear()`
  - Vuelve a iniciar sesión

### 4. **El usuario NO tiene rol DOCTOR**
- **Síntoma**: Error 403 Forbidden - "No tienes permisos para ver historias clínicas"
- **Solución**:
  - Solo usuarios con rol **DOCTOR** pueden ver historias clínicas
  - Si registraste como PACIENTE o FISIOTERAPEUTA, crea una nueva cuenta como DOCTOR

### 5. **Base de datos no tiene datos**
- **Síntoma**: Carga correctamente pero no muestra historias
- **Solución**: Crea una historia clínica desde la aplicación o ve a "Historias Clínicas" → "Nueva Historia Clínica"

---

## 🛠️ Pasos de Diagnóstico

### Paso 1: Abre la consola del navegador
```
F12 → Pestaña "Console"
```

### Paso 2: Busca los logs
Deberías ver algo como:
```
Fetching historias con token: eyJhbGciOiJIUzI1NiI...
Response status: 200
Response ok: true
Response data: {success: true, data: [...]}
```

### Paso 3: Si ves errores
Lee el mensaje exacto en `Response data.message`

---

## 🐛 Errores Específicos y Soluciones

### Error: "No hay sesión activa"
**Causa**: No hay token guardado
**Solución**: Inicia sesión nuevamente

### Error: "Error 401: Unauthorized"
**Causa**: Token inválido o expirado
**Solución**:
```javascript
// En la consola del navegador:
localStorage.clear()
// Luego recarga la página y vuelve a iniciar sesión
```

### Error: "Error 403: Forbidden - Solo doctores pueden..."
**Causa**: Tu usuario no tiene rol DOCTOR
**Solución**:
1. Ve a http://localhost:3000/register
2. Selecciona rol: **DOCTOR**
3. Completa datos y registrate
4. Vuelve a /historias-clinicas

### Error: "No se pudo cargar las historias clínicas"
**Causa**: Error desconocido en el servidor
**Solución**:
1. Revisa la consola del navegador (F12)
2. Mira el error en `Response data.message`
3. Ve a los logs del backend

---

## 📊 Verificar el Backend

### Verificar que el endpoint existe
```powershell
# Desde PowerShell, con un token válido:
$headers = @{"Authorization" = "Bearer YOUR_TOKEN"}
Invoke-WebRequest -Uri "http://localhost:3001/api/historias-clinicas" -Headers $headers
```

### Ver logs del backend
En la terminal donde corre `npm run dev`:
- Si ves: `GET /api/historias-clinicas 200` → ✅ OK
- Si ves: `GET /api/historias-clinicas 401` → ❌ Token inválido
- Si ves: `GET /api/historias-clinicas 403` → ❌ Permiso denegado

---

## 🗄️ Verificar Base de Datos

### Conectar a PostgreSQL
```powershell
psql -h 127.0.0.1 -p 5433 -U fisio_user -d fisiolabst
```

### Ver si hay historias clínicas
```sql
SELECT * FROM historias_clinicas LIMIT 5;
```

### Ver si tu usuario existe
```sql
SELECT id, email, nombre, rol FROM usuarios WHERE email = 'tu@email.com';
```

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo: `npm run dev` en `backend/api`
- [ ] Frontend corriendo: `pnpm dev` en `frontend/fisio-lab-st-dashboard`
- [ ] Iniciaste sesión en http://localhost:3000/login
- [ ] Tu usuario tiene rol **DOCTOR**
- [ ] Abre la consola (F12) y verifica los logs
- [ ] Base de datos PostgreSQL está corriendo en puerto 5433
- [ ] Hay al menos una historia clínica creada

---

## 🚀 Flujo Correcto

1. **Registrate como DOCTOR**
   - http://localhost:3000/register
   - Selecciona: Doctor
   - Completa datos y registrate

2. **Ve a Historias Clínicas**
   - http://localhost:3000/historias-clinicas
   - Click en "Nueva Historia Clínica"

3. **Completa el formulario**
   - Selecciona paciente
   - Rellena todos los campos
   - Click "Guardar"

4. **Vuelve a la lista**
   - Deberías ver tu historia clínica en la lista

---

## 💡 Debug Avanzado

### Ver el token guardado
```javascript
// En la consola del navegador (F12):
localStorage.getItem('fisiolab_token')
```

### Ver datos del usuario
```javascript
// En la consola del navegador:
JSON.parse(localStorage.getItem('fisiolab_user'))
```

### Hacer una solicitud manual desde la consola
```javascript
fetch('http://localhost:3001/api/historias-clinicas', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('fisiolab_token')}`
  }
}).then(r => r.json()).then(d => console.log(d))
```

---

## 📞 Si Aún No Funciona

1. **Copia el error completo** de la consola (F12)
2. **Verifica los logs del backend** - busca líneas rojo
3. **Reinicia todo**:
   ```powershell
   # Terminal 1
   cd backend\api
   npm run dev
   
   # Terminal 2
   cd frontend\fisio-lab-st-dashboard
   pnpm dev
   ```
4. **Limpia caché**: `localStorage.clear()` en la consola

---

## 📝 Respuesta Esperada (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1234",
      "codigo_unico": "HC-2026-00001",
      "paciente_id": "uuid-paciente",
      "doctor_id": "uuid-doctor",
      "fecha_consulta": "2026-02-05T10:30:00Z",
      "diagnostico_principal": "Lumbalgia aguda",
      "creado_en": "2026-02-05T10:30:00Z",
      "primer_nombre_paciente": "Juan",
      "primer_apellido_paciente": "Pérez",
      "doctor_nombre": "Dr. Carlos"
    }
  ],
  "total": 1
}
```

---

**Última actualización**: 5 de Febrero de 2026  
**Estado**: Listo para diagnóstico
