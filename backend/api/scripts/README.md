# 🧹 Script de Limpieza de Base de Datos

Este script te permite **eliminar todos los datos** de la base de datos FisioLab manteniendo la estructura de las tablas intacta.

## ⚠️ ADVERTENCIA

**Este proceso es IRREVERSIBLE**. Todos los datos serán eliminados permanentemente:
- Pacientes
- Evaluaciones fisioterapéuticas
- Planes de tratamiento
- Sesiones
- Citas
- Profesionales
- Recursos
- Pagos
- Certificados
- Archivos
- Usuarios

## 📋 Uso

### Opción 1: Usando npm (Recomendado)

```bash
npm run clean-db -- --confirm
```

### Opción 2: Ejecutando directamente con Node

```bash
node scripts/clean-database.js --confirm
```

## 🔒 Protección

El script **requiere el flag `--confirm`** para ejecutarse. Si lo ejecutas sin este flag, solo mostrará un mensaje de advertencia sin eliminar datos.

```bash
# Esto NO eliminará datos (solo muestra advertencia)
npm run clean-db

# Esto SÍ eliminará todos los datos
npm run clean-db -- --confirm
```

## ✅ Proceso de Limpieza

El script:

1. **Conecta a la base de datos** (fisiolabst en localhost:5433)
2. **Inicia una transacción** para seguridad
3. **Deshabilita temporalmente las restricciones** de clave foránea
4. **Elimina datos en el orden correcto** respetando dependencias:
   - sesiones
   - planes_tratamiento
   - evaluaciones_fisioterapeuticas
   - certificados
   - pagos
   - archivos
   - citas
   - pacientes
   - profesionales
   - recursos
   - usuarios
5. **Confirma la transacción** (COMMIT)
6. **Muestra resumen** de registros eliminados

## 📊 Salida Esperada

```
🧹 Iniciando limpieza de la base de datos...

📋 Eliminando datos de las siguientes tablas:
   ✅ sesiones: 10 registros eliminados
   ✅ planes_tratamiento: 1 registros eliminados
   ✅ evaluaciones_fisioterapeuticas: 2 registros eliminados
   ✅ certificados: 0 registros eliminados
   ✅ pagos: 5 registros eliminados
   ✅ archivos: 3 registros eliminados
   ✅ citas: 15 registros eliminados
   ✅ pacientes: 8 registros eliminados
   ✅ profesionales: 3 registros eliminados
   ✅ recursos: 2 registros eliminados
   ✅ usuarios: 2 registros eliminados

🔄 Reiniciando secuencias...

✨ Base de datos limpiada exitosamente!
📊 Todas las tablas están vacías y listas para nuevos datos.

✅ Proceso completado.
```

## 🔄 Después de la Limpieza

1. **Las tablas permanecen intactas** - Solo los datos son eliminados
2. **Las migraciones se ejecutarán normalmente** al reiniciar el servidor
3. **Puedes empezar a ingresar datos desde cero**

## 🚀 Siguiente Paso: Ingresar Datos Frescos

Después de limpiar, sigue este orden para ingresar datos:

```bash
# 1. Reiniciar el servidor (ejecutará migraciones)
npm run start

# 2. Crear un usuario (opcional, para autenticación)
POST /api/auth/register
Body: { email, password, nombre, apellido }

# 3. Crear profesionales
POST /api/profesionales
Body: { nombre, apellido, especialidad, documento, telefono }

# 4. Crear pacientes
POST /api/pacientes
Body: { nombres, apellidos, documento, ... }

# 5. Crear evaluaciones
POST /api/evaluaciones
Body: { paciente_id, motivo_consulta, diagnostico, ... }

# 6. Crear planes de tratamiento
POST /api/evaluaciones/{id}/planes
Body: { objetivo, sesiones_plan }

# 7. Generar sesiones
POST /api/planes/{id}/generar-sesiones
Body: { fecha_inicio, dias_semana, hora, profesional_id }
```

## ❓ Solución de Problemas

### Error de conexión

```
Error: connect ECONNREFUSED 127.0.0.1:5433
```

**Solución:** Verifica que PostgreSQL esté corriendo en el puerto 5433.

```bash
# Windows
Get-Service -Name postgresql*

# Si no está corriendo, iniciarlo
Start-Service postgresql-x64-15  # Ajusta el nombre según tu versión
```

### Error de permisos

```
Error: permission denied for table ...
```

**Solución:** Verifica las credenciales de la base de datos en el script:
- Usuario: `fisio_user`
- Contraseña: `root`
- Base de datos: `fisiolabst`

### Tablas no existen

Si ves muchas advertencias de "tabla no existe", es normal si es una instalación nueva. El script las salta automáticamente.

## 🔧 Configuración

Si necesitas cambiar la configuración de conexión, edita el archivo:

```javascript
// scripts/clean-database.js
const pool = new Pool({
  host: '127.0.0.1',      // Cambiar si está en otro host
  port: 5433,              // Cambiar si usas otro puerto
  database: 'fisiolabst',  // Cambiar si la BD tiene otro nombre
  user: 'fisio_user',      // Cambiar usuario si es necesario
  password: 'root'         // Cambiar contraseña
});
```

## 📝 Notas Adicionales

- El script usa **transacciones** para garantizar que si hay un error, no se eliminan datos parcialmente
- Las **restricciones de clave foránea** se deshabilitan temporalmente para evitar errores de dependencias
- Es **seguro ejecutarlo múltiples veces** - si las tablas ya están vacías, simplemente reportará 0 registros eliminados

---

**Última actualización:** 4 de diciembre de 2025  
**Versión:** 1.0.0
