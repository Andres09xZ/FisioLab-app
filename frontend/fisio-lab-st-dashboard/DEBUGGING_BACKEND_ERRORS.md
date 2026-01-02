# 🔍 Guía de Depuración - Error 500 al Completar Cita

## ❌ Problema Actual
Estás recibiendo un **Error 500** del backend cuando intentas completar una cita:
```
POST http://localhost:3001/api/citas/{id}/completar
Status: 500 Internal Server Error
```

## 🎯 Causas Comunes del Error 500

### 1. **Error en la Base de Datos**
El backend podría tener problemas al:
- Actualizar el estado de la cita
- Actualizar la sesión asociada
- Actualizar el plan de tratamiento
- Ejecutar triggers o validaciones

### 2. **Datos Faltantes o Inválidos**
- La cita no tiene una sesión asociada (`sesion_id` es null)
- La sesión no tiene un plan asociado
- El estado actual de la cita no permite completarla

### 3. **Error en el Código del Backend**
- Referencia a un campo que no existe
- Error en la lógica de negocio
- Problema con transacciones de base de datos

## 🔧 Cómo Diagnosticar

### Paso 1: Revisa los Logs del Backend
Abre la terminal donde está corriendo tu backend y busca el error completo.

Deberías ver algo como:
```bash
Error al completar cita: {
  message: "...",
  stack: "..."
}
```

### Paso 2: Verifica los Datos de la Cita
Abre la consola del navegador (F12) y busca:
```javascript
Intentando completar cita: {
  id: "a8af7ead-be50-4fca-8a7c-ff7dd4586103",
  notas: "..."
}

Resultado de completar cita: {
  success: false,
  error: "...",
  message: "..."
}
```

### Paso 3: Verifica la Cita en la Base de Datos
```sql
-- Consulta la cita específica
SELECT * FROM citas 
WHERE id = 'a8af7ead-be50-4fca-8a7c-ff7dd4586103';

-- Verifica si tiene sesión asociada
SELECT c.*, s.* 
FROM citas c
LEFT JOIN sesiones s ON c.sesion_id = s.id
WHERE c.id = 'a8af7ead-be50-4fca-8a7c-ff7dd4586103';

-- Verifica si la sesión tiene plan
SELECT c.*, s.*, p.*
FROM citas c
LEFT JOIN sesiones s ON c.sesion_id = s.id
LEFT JOIN planes_tratamiento p ON s.plan_id = p.id
WHERE c.id = 'a8af7ead-be50-4fca-8a7c-ff7dd4586103';
```

## 🛠️ Soluciones Posibles

### Solución 1: Cita sin Sesión Asociada
Si la cita no tiene `sesion_id`, el backend podría fallar al actualizar. 

**Solución temporal**: Permitir completar citas sin sesión.

### Solución 2: Error en el Endpoint del Backend
Revisa el archivo del backend donde está el endpoint `/api/citas/:id/completar`.

Verifica que:
```typescript
// Backend - Ejemplo correcto
async completarCita(id: string, notas: string) {
  try {
    // 1. Actualizar cita
    const cita = await this.citaRepository.update(id, {
      estado: 'completada',
      notas: notas
    });

    // 2. Si tiene sesión, actualizarla
    if (cita.sesion_id) {
      await this.sesionRepository.update(cita.sesion_id, {
        estado: 'completada',
        fecha_sesion: new Date(),
        notas_sesion: notas
      });

      // 3. Actualizar estadísticas del plan
      const sesion = await this.sesionRepository.findById(cita.sesion_id);
      if (sesion && sesion.plan_id) {
        await this.actualizarProgresoPlan(sesion.plan_id);
      }
    }

    return { success: true, data: cita };
  } catch (error) {
    console.error('Error al completar cita:', error);
    throw error; // ← Asegúrate de que el error se propague correctamente
  }
}
```

### Solución 3: Problema con Transacciones
Si usas transacciones, asegúrate de que estén correctamente manejadas:

```typescript
// Backend
await this.dataSource.transaction(async (manager) => {
  // Todas las operaciones aquí
  await manager.update(Cita, id, { estado: 'completada' });
  await manager.update(Sesion, sesionId, { estado: 'completada' });
  // etc...
});
```

## 📊 Error en Dashboard (Ingresos)
El otro error es:
```
GET http://localhost:3001/api/dashboard/ingresos-mes?year=2025
Status: 500 Internal Server Error
```

**Posibles causas**:
- Error en la consulta SQL
- Problema con agregaciones (SUM, COUNT, etc.)
- Campo faltante en la tabla `citas` o `pagos`
- Problema con el año 2025 (puede que no haya datos)

**Solución temporal**: Desactiva temporalmente esta llamada en el dashboard hasta arreglar el backend.

## ✅ Checklist de Verificación

- [ ] Revisa los logs del backend (terminal del servidor)
- [ ] Verifica que la cita existe en la base de datos
- [ ] Verifica que la cita tiene `sesion_id` (puede ser NULL)
- [ ] Verifica que el endpoint `/completar` maneja correctamente citas sin sesión
- [ ] Verifica que las tablas tienen todos los campos necesarios
- [ ] Prueba el endpoint directamente con Postman/Thunder Client:
  ```bash
  PUT http://localhost:3001/api/citas/a8af7ead-be50-4fca-8a7c-ff7dd4586103/completar
  Content-Type: application/json
  
  {
    "notas": "Sesión completada satisfactoriamente"
  }
  ```

## 🆘 Si Necesitas Más Ayuda

Comparte:
1. Los logs completos del backend (error stack trace)
2. La estructura de la cita en la base de datos
3. El código del endpoint `/completar` en el backend
