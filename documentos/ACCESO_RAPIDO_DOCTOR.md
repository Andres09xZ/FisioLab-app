# ⚡ Guía Rápida: Registro y Acceso como DOCTOR

## 1️⃣ Verificar que Backend está corriendo

```powershell
# En una terminal:
cd backend\api
npm run dev

# Espera a ver:
# ✓ Server running on http://localhost:3001
```

---

## 2️⃣ Verificar que Frontend está corriendo

```powershell
# En otra terminal:
cd frontend\fisio-lab-st-dashboard
pnpm dev

# Espera a ver:
# ▲ ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 3️⃣ Registro Correcto como DOCTOR

1. Ve a: **http://localhost:3000/register**
2. **IMPORTANTE**: Selecciona el rol **DOCTOR** (es el PRIMERO)
3. Completa los datos:
   - Nombre Completo: `Dr. Juan Pérez`
   - Correo: `doctor.test@fisiolab.com`
   - Contraseña: `password123`
   - Confirmar: `password123`
4. Click en **"Registrarse"**

✅ Si funciona: Te redirige automáticamente a `/dashboard`

---

## 4️⃣ Acceder a Historias Clínicas

1. Una vez en el dashboard, mira el **sidebar izquierdo**
2. Busca la opción **"Historias Clínicas"** (con icono de documento)
3. Click en ella

✅ Si funciona: Ves una tabla vacía con botón "Nueva Historia Clínica"

---

## 5️⃣ Si Ves Error

### ❌ Error: "Error al cargar historias clínicas"

Abre la consola (F12) y mira los logs:

**Si ves**: `Error 403 - Solo doctores pueden...`
→ Tu usuario NO es DOCTOR
→ Solución: Registrate nuevamente seleccionando DOCTOR

**Si ves**: `Error 401 - Unauthorized`
→ Token inválido
→ Solución: `localStorage.clear()` en consola y vuelve a iniciar sesión

**Si ves**: `Error connecting to 127.0.0.1:3001`
→ Backend no está corriendo
→ Solución: `npm run dev` en backend/api

---

## 6️⃣ Verificar desde la Consola (F12)

Abre la consola del navegador (F12) y pega:

```javascript
// Ver usuario actual
JSON.parse(localStorage.getItem('fisiolab_user'))

// Debería mostrar algo como:
{
  id: "uuid",
  name: "Dr. Juan Pérez",
  role: "DOCTOR",
  email: "doctor.test@fisiolab.com"
}
```

Si `role` NO es `"DOCTOR"`, necesitas registrarte como DOCTOR.

---

## 7️⃣ Crear Primera Historia Clínica

1. En Historias Clínicas, click **"Nueva Historia Clínica"**
2. Selecciona un paciente (o crea uno si es necesario)
3. Completa el formulario
4. Click **"Guardar"**

✅ Vuelves a la lista y ves tu historia clínica

---

## ⚠️ Importante

**El rol debe ser exactamente "DOCTOR"** para acceder a esta función. No es "Doctor" o "MEDICO", es **"DOCTOR"** en mayúsculas.
