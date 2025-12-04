# FisioPro - Database Service

Base de datos PostgreSQL para el sistema de gestión de clínica de fisioterapia.

## 🚀 Inicio Rápido

### Prerequisitos
- Docker Desktop instalado y en ejecución
- Puerto 5432 disponible (o modificar en docker-compose.yml)

### Levantar la base de datos

```bash
# Desde el directorio dbService
docker-compose up -d
```

### Verificar que está corriendo

```bash
docker-compose ps
```

### Ver logs

```bash
docker-compose logs -f
```

## 📊 Información de Conexión

- **Host:** localhost
- **Puerto:** 5432
- **Base de datos:** fisiopro
- **Usuario:** fisiopro_user
- **Contraseña:** fisiopro_pass_2025

**Connection String:**
```
postgresql://fisiopro_user:fisiopro_pass_2025@localhost:5432/fisiopro
```

## 👤 Usuario Admin por Defecto

- **Email:** admin@tuclinica.com
- **Password:** Admin2025!

## 🗂️ Esquema de Base de Datos

La base de datos incluye las siguientes tablas:

1. **usuarios** - Administradores del sistema
2. **profesionales** - Fisioterapeutas
3. **pacientes** - Pacientes de la clínica
4. **historia_clinica** - Historia clínica de cada paciente
5. **recursos** - Camillas, salas, equipos
6. **citas** - Agenda de citas
7. **planes_tratamiento** - Planes de tratamiento
8. **sesiones** - Sesiones de fisioterapia
9. **evaluaciones_fisioterapeuticas** - Evaluaciones iniciales
10. **archivos_adjuntos** - Imágenes, informes, etc.
11. **pagos** - Registro de pagos
12. **certificados** - Certificados médicos

## 🛠️ Comandos Útiles

### Detener la base de datos
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ BORRA TODOS LOS DATOS)
```bash
docker-compose down -v
```

### Reiniciar la base de datos
```bash
docker-compose restart
```

### Conectarse a la base de datos con psql
```bash
docker-compose exec postgres psql -U fisiopro_user -d fisiopro
```

### Hacer backup de la base de datos
```bash
docker-compose exec postgres pg_dump -U fisiopro_user fisiopro > backup.sql
```

### Restaurar desde backup
```bash
docker-compose exec -T postgres psql -U fisiopro_user fisiopro < backup.sql
```

## 🔧 Personalización

Para cambiar las credenciales o configuración:

1. Edita el archivo `docker-compose.yml`
2. Opcionalmente crea un archivo `.env` basado en `.env.example`
3. Reinicia el contenedor

## 📝 Notas

- El esquema se inicializa automáticamente la primera vez que se levanta el contenedor
- Los datos persisten en un volumen Docker llamado `fisiopro_postgres_data`
- El contenedor se reinicia automáticamente si se detiene inesperadamente
