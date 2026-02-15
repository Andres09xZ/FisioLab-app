# 🔐 CÓMO ACCEDER COMO DOCTOR

## 🚀 Paso 1: Asegúrate que todo esté corriendo

### Backend
```bash
cd backend/api
npm run dev
# Debe estar en http://localhost:3001
```

### Frontend
```bash
cd frontend/fisio-lab-st-dashboard
pnpm dev
# Debe estar en http://localhost:3000
```

---

## 📋 Opción 1: Usar Datos de Prueba Existentes

Si ya tienes usuarios en la base de datos, usa sus credenciales:

### Desde la Base de Datos PostgreSQL:
```sql
-- Conectar a la BD fisiolabst
SELECT id, email, nombre, apellido, rol FROM usuarios WHERE rol = 'DOCTOR' LIMIT 5;
```

**Credenciales típicas de prueba:**
- Email: `doctor@fisiolab.com`
- Contraseña: `123456` (o la que hayas establecido)

---

## 📝 Opción 2: Crear un Usuario DOCTOR desde la BD

Si no tienes usuarios, crea uno así:

### 1. Conectarse a PostgreSQL:
```bash
psql -h 127.0.0.1 -p 5433 -U fisio_user -d fisiolabst
```

### 2. Insertar un doctor (sin hash de contraseña - solo para prueba):
```sql
INSERT INTO usuarios (
  email, 
  nombre, 
  apellido, 
  rol, 
  activo, 
  creado_en
) VALUES (
  'doctor.prueba@fisiolab.com',
  'Juan',
  'Pérez García',
  'DOCTOR',
  true,
  NOW()
);

-- Verificar que se creó
SELECT * FROM usuarios WHERE email = 'doctor.prueba@fisiolab.com';
```

---

## 🔑 Opción 3: Registrarse como Doctor (Si hay endpoint de registro)

### En la aplicación:
1. Ir a `http://localhost:3000/register`
2. Llenar el formulario con:
   - Email: `doctor@ejemplo.com`
   - Nombre: `Tu nombre`
   - Apellido: `Tu apellido`
   - Contraseña: `TuContraseña123`
   - Rol: **DOCTOR**
3. Click en "Registrarse"

---

## 🎯 Acceder a la Aplicación

### 1. Ir al Login:
```
http://localhost:3000/login
```

### 2. Ingresar credenciales:
```
Email:    doctor@fisiolab.com
Password: 123456
```

### 3. Click en "Iniciar Sesión"

---

## ✅ Una vez autenticado:

### Deberías ver el Dashboard con:
- Sidebar izquierdo con menú
- **"Historias Clínicas"** en el menú (✨ NUEVA OPCIÓN)
- Otras opciones: Pacientes, Agenda, Sesiones, etc.

### Para acceder a Historias Clínicas:
1. Click en **"Historias Clínicas"** en el sidebar
2. Verás la página con:
   - 📋 Lista de tus historias clínicas
   - 🔍 Búsqueda por paciente
   - ➕ Botón "Nueva Historia Clínica"
   - 📊 Estadísticas

---

## 🆕 Para crear una Historia Clínica:

### Desde el listado:
1. Click en botón **"Nueva Historia Clínica"**
2. Se abre el formulario con 10 secciones
3. Llenar los datos:
   - **Sección A**: Datos del paciente
   - **Sección B**: Motivo de consulta
   - **Sección C**: Antecedentes
   - **Sección E**: Descripción de enfermedad
   - **Sección F**: Signos vitales
   - **Sección G**: Sistemas
   - **Sección H**: Examen físico
   - **Sección I**: Diagnósticos
   - **Sección J**: Planes de tratamiento
   - **Sección K**: Firma del doctor

4. El formulario **auto-guarda cada 30 segundos**
5. Click en **"Guardar"** cuando termines

---

## 🔍 Acciones disponibles en el listado:

Para cada historia clínica:

| Acción | Icono | Función |
|--------|-------|---------|
| Ver    | 👁️   | Abre la HC en modo lectura |
| Editar | ✏️    | Abre el formulario para editar |
| PDF    | 📥    | Descarga la HC como PDF |
| Eliminar | 🗑️  | Elimina la HC (con confirmación) |

---

## 🐛 Troubleshooting

### ❌ "Credenciales inválidas"
- Verifica que el usuario existe en la BD
- Revisa que el rol sea "DOCTOR"
- Asegúrate que `activo = true`

### ❌ "No puedo ver Historias Clínicas"
- Verifica que tu rol sea DOCTOR
- Actualiza la página (F5)
- Revisa la consola de errores (F12)

### ❌ "Error al crear Historia Clínica"
- Verifica que haya pacientes creados
- Verifica la conexión al backend
- Revisa el console de desarrollador (F12)

---

## 📊 Script rápido para crear datos de prueba

Si quieres crear todo desde cero (usuario + paciente):

```sql
-- 1. Crear usuario DOCTOR
INSERT INTO usuarios (email, nombre, apellido, rol, activo, creado_en)
VALUES ('doctor.test@fisiolab.com', 'Carlos', 'López', 'DOCTOR', true, NOW());

-- 2. Obtener el ID del doctor
SELECT id FROM usuarios WHERE email = 'doctor.test@fisiolab.com';
-- Copiá el ID (ej: 550e8400-e29b-41d4-a716-446655440000)

-- 3. Crear un paciente
INSERT INTO pacientes (
  nombre, 
  apellido, 
  email, 
  telefono, 
  activo, 
  creado_en
) VALUES (
  'María',
  'González Rodríguez',
  'maria.gonzalez@email.com',
  '+34 912 345 678',
  true,
  NOW()
);

-- 4. Verificar
SELECT * FROM usuarios WHERE rol = 'DOCTOR';
SELECT * FROM pacientes LIMIT 5;
```

---

## 📞 Datos de Prueba Recomendados

```
DOCTOR:
Email: doctor.prueba@fisiolab.com
Nombre: Dr. Juan
Apellido: Pérez
Rol: DOCTOR

PACIENTE:
Nombre: María
Apellido: González
Email: maria@email.com
Teléfono: +34 912 345 678
```

---

¡Listo! Ya deberías poder acceder como doctor y crear historias clínicas. 🎉
