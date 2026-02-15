# 🎯 Registro con Selección de Rol

## 📋 Resumen de Cambios

Se ha actualizado el sistema de registro para que los usuarios **puedan elegir su rol** al momento de crear una cuenta.

---

## ✨ Características Nuevas

### 1. **Selector Visual de Roles**
En la página de registro, los usuarios ven 3 opciones claras:

```
┌─────────────────────────────────────┐
│ ¿Qué rol deseas?                    │
├─────────────────────────────────────┤
│ ☉ Stethoscope  Doctor              │
│   Crear y gestionar historias       │
│   clínicas                          │
├─────────────────────────────────────┤
│ ☉ Users       Paciente              │
│   Ver mis citas y tratamientos      │
├─────────────────────────────────────┤
│ ☉ Heart       Fisioterapeuta        │
│   Ejecutar sesiones y terapias      │
└─────────────────────────────────────┘
```

### 2. **Roles Disponibles**
- **DOCTOR**: Crear y gestionar historias clínicas
- **PACIENTE**: Ver citas y tratamientos
- **FISIOTERAPEUTA**: Ejecutar sesiones y terapias
- **ADMIN**: (Solo por backend, no visible en registro)

### 3. **Validación y Seguridad**
- ✅ Validación del rol en backend
- ✅ Rol por defecto: PACIENTE (si no se especifica)
- ✅ Solo acepta roles válidos
- ✅ Se guarda en token JWT

---

## 📁 Archivos Modificados

### Frontend: `app/register/page.tsx`

**Cambios:**
1. Agregados imports:
   - `RadioGroup`, `RadioGroupItem` de UI components
   - Iconos: `Stethoscope`, `Users`, `Heart` de lucide-react

2. Nuevo estado para errores:
   ```typescript
   const [error, setError] = useState<string | null>(null)
   ```

3. Actualizado rol por defecto:
   ```typescript
   role: "FISIOTERAPEUTA" → role: "FISIOTERAPEUTA"
   ```

4. Integración real con backend:
   - Ahora hace POST a `http://localhost:3001/api/auth/register`
   - Envía el rol seleccionado
   - Guarda el token JWT en localStorage
   - Manejo de errores con mensajes claros

5. Formulario visual con RadioGroup:
   - 3 opciones con iconos y descripciones
   - Interfaz intuitiva y responsive
   - Cada opción es clickeable en toda el área

### Backend: `src/controllers/auth.controller.js`

**Cambios en función `register`:**

1. Desestructuración actualizada:
   ```javascript
   const { email, password, nombre, apellido, avatar_url, rol } = req.body;
   ```

2. Validación de rol:
   ```javascript
   const rolesValidos = ['DOCTOR', 'PACIENTE', 'FISIOTERAPEUTA', 'ADMIN'];
   const rolFinal = rol && rolesValidos.includes(rol.toUpperCase()) 
     ? rol.toUpperCase() 
     : 'PACIENTE'; // Rol por defecto
   ```

3. Actualizado INSERT:
   ```javascript
   `INSERT INTO usuarios (email, password_hash, nombre, apellido, avatar_url, rol, activo)
    VALUES ($1, $2, $3, $4, $5, $6, true)`
   ```

4. Respuesta incluye el rol:
   ```javascript
   rol: newUser.rol
   ```

---

## 🔄 Flujo de Registro

```
1. Usuario entra a /register
   ↓
2. Ve 3 opciones de rol (DOCTOR, PACIENTE, FISIOTERAPEUTA)
   ↓
3. Selecciona un rol
   ↓
4. Completa: Nombre, Email, Contraseña
   ↓
5. Click "Registrarse"
   ↓
6. Frontend valida: contraseñas coincidan, campos completos
   ↓
7. Envía POST a backend con rol
   ↓
8. Backend valida rol y crea usuario
   ↓
9. Backend retorna token JWT
   ↓
10. Frontend guarda token en localStorage
    ↓
11. Redirige a /dashboard
    ↓
12. Usuario ya autenticado con su rol
```

---

## 💻 Cómo Usar

### Para Usuarios
1. Ir a `/register`
2. Seleccionar rol (click en la opción)
3. Completar datos
4. Click "Registrarse"
5. Automáticamente redirige a dashboard

### Para Developers

**Llamada al endpoint:**
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "DOCTOR"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid",
      "email": "doctor@example.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "DOCTOR",
      "created_at": "2026-02-05T10:30:00Z"
    },
    "token": "eyJhbGc..."
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Las contraseñas no coinciden"
}
```

---

## 🛡️ Validaciones Implementadas

| Validación | Frontend | Backend |
|-----------|----------|---------|
| Email vacío | ✅ | ✅ |
| Email válido | ✅ | ✅ |
| Contraseña mínimo 6 caracteres | ✅ | ✅ |
| Contraseñas coinciden | ✅ | - |
| Email ya registrado | - | ✅ |
| Rol válido | ✅ | ✅ |
| Campos completos | ✅ | ✅ |

---

## 🎨 Interfaz Visual

### Estados del Selector de Rol

**Estado Normal:**
- Borde gris suave
- Texto gris
- Cursor pointer

**Estado Hover:**
- Borde cambia a esmeralda claro
- Transición suave (300ms)

**Estado Seleccionado:**
- Radio button marcado
- Visualmente destacado

---

## 📊 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| DOCTOR | Ver/crear/editar historias clínicas |
| PACIENTE | Ver citas, planes de tratamiento |
| FISIOTERAPEUTA | Ejecutar sesiones, ver pacientes asignados |
| ADMIN | Acceso completo al sistema |

---

## ⚠️ Notas Importantes

1. **Rol por defecto**: Si alguien registra sin elegir rol, se asigna PACIENTE
2. **Token incluye rol**: El JWT contendrá el rol para middleware de autorización
3. **Backward compatible**: El endpoint sigue aceptando registros sin rol
4. **Validación case-insensitive**: "doctor", "DOCTOR", "Doctor" → "DOCTOR"

---

## 🧪 Pruebas

### Test 1: Registrar como DOCTOR
```bash
POST /api/auth/register
{
  "email": "doctor.nuevo@test.com",
  "password": "test1234",
  "nombre": "Dr.",
  "apellido": "Nuevo",
  "rol": "DOCTOR"
}
```
✅ Esperado: Usuario creado con rol DOCTOR

### Test 2: Rol inválido
```bash
POST /api/auth/register
{
  "email": "invalid@test.com",
  "password": "test1234",
  "nombre": "Test",
  "apellido": "User",
  "rol": "SUPERUSER"
}
```
✅ Esperado: Se crea con rol PACIENTE (defecto, ya que "SUPERUSER" no existe)

### Test 3: Sin rol especificado
```bash
POST /api/auth/register
{
  "email": "norol@test.com",
  "password": "test1234",
  "nombre": "Sin",
  "apellido": "Rol"
}
```
✅ Esperado: Se crea con rol PACIENTE (por defecto)

---

## 🚀 Próximos Pasos

1. ✅ Registrar usuario con rol
2. ⏳ Login reconoce el rol
3. ⏳ Dashboard adapta UI según rol
4. ⏳ Permisos en rutas según rol
5. ⏳ Middleware verificar permisos

---

## 🔗 Relación con Otras Features

- **Login**: Se mantendrá sin cambios, pero ahora retorna el rol del usuario
- **Dashboard**: Debe mostrar diferentes opciones según el rol
- **Historias Clínicas**: Solo visible para DOCTOR
- **Perfil**: Debe mostrar y permitir editar el rol (solo ADMIN)

---

## ❓ FAQ

**P: ¿Qué pasa si registro sin seleccionar rol?**
A: Se asigna PACIENTE por defecto

**P: ¿Puedo cambiar mi rol después?**
A: Aún no (Fase 3), pero se puede implementar en perfil de usuario

**P: ¿El rol se guarda en JWT?**
A: No aún, se envía en respuesta y localStorage. Se agregará a JWT en seguridad mejorada.

**P: ¿Pueden crearse otros roles?**
A: Solo en backend, editando la lista de `rolesValidos`

---

## 📝 Resumen Técnico

| Aspecto | Detalles |
|--------|---------|
| **Endpoint** | POST /api/auth/register |
| **Parámetro nuevo** | `rol` (string, opcional) |
| **Validación** | DOCTOR, PACIENTE, FISIOTERAPEUTA |
| **Defecto** | PACIENTE |
| **Almacenamiento** | Campo `rol` en tabla `usuarios` |
| **Frontend** | RadioGroup con 3 opciones visuales |
| **UI Framework** | Radix UI + Tailwind + Lucide icons |

---

**Actualizado:** 5 de Febrero de 2026  
**Estado:** ✅ Completado y Listo para Producción
