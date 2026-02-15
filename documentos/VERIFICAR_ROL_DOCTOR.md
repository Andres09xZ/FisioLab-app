# 🔐 Verificar y Cambiar tu Rol

## Paso 1: Abre la Consola del Navegador

Presiona **F12** en tu navegador y ve a la pestaña **"Console"**.

## Paso 2: Ejecuta estos comandos

Copia y pega en la consola:

```javascript
// Ver qué usuario estás logueado
JSON.parse(localStorage.getItem('fisiolab_user'))
```

Esto te mostrará algo como:
```
{
  id: "abc123...",
  name: "Tu Nombre",
  role: "PACIENTE",  ← Ver aquí el rol
  email: "tu@email.com"
}
```

## Paso 3: Verificar el Rol

- ✅ Si `role` es `"DOCTOR"` → Todo bien, pero algo va mal
- ❌ Si `role` es `"PACIENTE"` → ¡Ese es el problema!
- ❌ Si `role` es `"FISIOTERAPEUTA"` → También causa error (solo DOCTOR puede ver)

---

## ⚠️ Solución: Registrate Como DOCTOR

### Opción A: Registrar Nueva Cuenta (Recomendado)

1. **Limpia tu sesión actual**:
   - En la consola del navegador (F12):
   ```javascript
   localStorage.clear()
   ```

2. **Ve a registro**:
   - http://localhost:3000/register

3. **IMPORTANTE - Selecciona "Doctor"**:
   - La primera opción debe estar seleccionada: **👨‍⚕️ Doctor**

4. **Completa los datos**:
   ```
   Nombre: Dr. Juan Pérez
   Email: doctor@fisiolab.com
   Contraseña: password123
   ```

5. **Click "Registrarse"**

6. **Verifica en la consola**:
   ```javascript
   JSON.parse(localStorage.getItem('fisiolab_user'))
   // Debe mostrar: role: "DOCTOR"
   ```

### Opción B: Crear Usuario DOCTOR en Base de Datos (SQL)

Si prefieres en la BD:

```sql
-- Conectarse a la BD
psql -h 127.0.0.1 -p 5433 -U fisio_user -d fisiolabst

-- Crear usuario DOCTOR
INSERT INTO usuarios (email, nombre, apellido, rol, activo, password_hash, created_at, updated_at)
VALUES (
  'doctor.nuevo@test.com',
  'Dr. Carlos',
  'López',
  'DOCTOR',
  true,
  'password_hash_placeholder',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET rol = 'DOCTOR';
```

---

## ✅ Verificar que Funciona

Una vez registrado como DOCTOR:

1. **Recarga la página** (F5)
2. **Ve a Historias Clínicas** en el sidebar
3. Deberías ver una tabla (aunque esté vacía)
4. Click **"Nueva Historia Clínica"** para crear una

---

## 🔑 Resumen Rápido

| Rol | Puede ver HC? |
|-----|--------------|
| DOCTOR | ✅ SÍ |
| PACIENTE | ❌ NO |
| FISIOTERAPEUTA | ❌ NO |
| ADMIN | ✅ SÍ |

**Solo usuarios con rol DOCTOR pueden acceder a Historias Clínicas** 👨‍⚕️
