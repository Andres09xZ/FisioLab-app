# 📱 Sistema de Notificaciones SMS con Twilio

## Configuración Implementada en Frontend

### ✅ Funcionalidades Agregadas:

1. **Archivo de API**: `lib/api/notificaciones.ts`
   - `programarNotificacionCita()` - Programa notificación 30 min antes
   - `enviarNotificacionInmediata()` - Envía SMS de prueba
   - `obtenerNotificacionesProgramadas()` - Lista notificaciones pendientes
   - `cancelarNotificacion()` - Cancela una notificación

2. **CitaModal Actualizado**:
   - Checkbox para activar/desactivar notificaciones (activado por defecto)
   - Integración automática al crear cita
   - Icono de campana (Bell) para mejor UX
   - Mensaje informativo: "El paciente recibirá un SMS 30 minutos antes de la cita"

---

## 🔧 Configuración del Backend (Node.js/Express)

### 1. Instalar Twilio

```bash
npm install twilio node-cron
```

### 2. Variables de Entorno (.env)

```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Configuración de Twilio (backend/config/twilio.js)

```javascript
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

module.exports = { client, twilioPhone };
```

### 4. Controlador de Notificaciones (backend/controllers/notificaciones.controller.js)

```javascript
const { client, twilioPhone } = require('../config/twilio');
const cron = require('node-cron');

// Almacén temporal de notificaciones programadas
const notificacionesProgramadas = new Map();

// Programar notificación para una cita
async function programarNotificacion(req, res) {
  try {
    const { cita_id, minutos_antes = 30 } = req.body;

    // Obtener datos de la cita desde la base de datos
    const cita = await obtenerCitaPorId(cita_id); // Implementar según tu BD
    
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Calcular hora de envío (30 minutos antes)
    const horaCita = new Date(cita.inicio);
    const horaEnvio = new Date(horaCita.getTime() - minutos_antes * 60000);

    // Verificar que la hora de envío sea futura
    if (horaEnvio <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La cita es muy pronto para programar notificación'
      });
    }

    // Crear mensaje personalizado
    const mensaje = `Hola ${cita.paciente_nombre}! Recordatorio: Tienes una cita de fisioterapia mañana a las ${horaCita.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} con ${cita.profesional_nombre}. Te esperamos en la clínica. ¡Saludos! 🏥`;

    // Programar tarea con node-cron
    const cronExpression = `${horaEnvio.getMinutes()} ${horaEnvio.getHours()} ${horaEnvio.getDate()} ${horaEnvio.getMonth() + 1} *`;
    
    const task = cron.schedule(cronExpression, async () => {
      try {
        await client.messages.create({
          body: mensaje,
          from: twilioPhone,
          to: cita.paciente_telefono
        });
        console.log(`📱 SMS enviado a ${cita.paciente_telefono}`);
        notificacionesProgramadas.delete(cita_id);
      } catch (error) {
        console.error('Error enviando SMS:', error);
      }
    });

    // Guardar referencia de la tarea
    notificacionesProgramadas.set(cita_id, {
      task,
      cita_id,
      telefono: cita.paciente_telefono,
      horaEnvio: horaEnvio.toISOString(),
      mensaje
    });

    res.json({
      success: true,
      message: 'Notificación programada exitosamente',
      data: {
        cita_id,
        horaEnvio: horaEnvio.toISOString(),
        minutosAntes: minutos_antes
      }
    });

  } catch (error) {
    console.error('Error programando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al programar notificación'
    });
  }
}

// Enviar notificación inmediata (para pruebas)
async function enviarNotificacionInmediata(req, res) {
  try {
    const { telefono, mensaje } = req.body;

    const result = await client.messages.create({
      body: mensaje,
      from: twilioPhone,
      to: telefono
    });

    res.json({
      success: true,
      message: 'SMS enviado exitosamente',
      data: {
        sid: result.sid,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error enviando SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al enviar SMS'
    });
  }
}

// Obtener notificaciones programadas
function obtenerProgramadas(req, res) {
  const programadas = Array.from(notificacionesProgramadas.values()).map(n => ({
    cita_id: n.cita_id,
    telefono: n.telefono,
    horaEnvio: n.horaEnvio
  }));

  res.json({
    success: true,
    data: programadas
  });
}

// Cancelar notificación
function cancelarNotificacion(req, res) {
  const { id } = req.params;
  
  const notificacion = notificacionesProgramadas.get(id);
  
  if (!notificacion) {
    return res.status(404).json({
      success: false,
      message: 'Notificación no encontrada'
    });
  }

  notificacion.task.stop();
  notificacionesProgramadas.delete(id);

  res.json({
    success: true,
    message: 'Notificación cancelada'
  });
}

module.exports = {
  programarNotificacion,
  enviarNotificacionInmediata,
  obtenerProgramadas,
  cancelarNotificacion
};
```

### 5. Rutas (backend/routes/notificaciones.routes.js)

```javascript
const express = require('express');
const router = express.Router();
const {
  programarNotificacion,
  enviarNotificacionInmediata,
  obtenerProgramadas,
  cancelarNotificacion
} = require('../controllers/notificaciones.controller');

router.post('/programar', programarNotificacion);
router.post('/enviar', enviarNotificacionInmediata);
router.get('/programadas', obtenerProgramadas);
router.delete('/:id', cancelarNotificacion);

module.exports = router;
```

### 6. Registrar rutas en app.js

```javascript
const notificacionesRoutes = require('./routes/notificaciones.routes');
app.use('/api/notificaciones', notificacionesRoutes);
```

---

## 🧪 Pruebas

### Probar envío inmediato (desde terminal o Postman):

```bash
curl -X POST http://localhost:3001/api/notificaciones/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+51987654321",
    "mensaje": "Prueba de notificación desde FisioLab"
  }'
```

### Probar notificación programada:

1. Crear una cita desde el frontend
2. Activar el checkbox "Enviar notificación SMS"
3. Verificar en la consola del backend que se programó correctamente
4. El SMS se enviará automáticamente 30 minutos antes de la cita

---

## 📋 Checklist de Implementación

- [✅] Frontend: Archivo `lib/api/notificaciones.ts` creado
- [✅] Frontend: CitaModal actualizado con checkbox
- [✅] Frontend: Integración automática al crear cita
- [ ] Backend: Instalar Twilio (`npm install twilio node-cron`)
- [ ] Backend: Configurar variables de entorno
- [ ] Backend: Crear controlador de notificaciones
- [ ] Backend: Crear rutas de notificaciones
- [ ] Backend: Registrar rutas en app.js
- [ ] Twilio: Crear cuenta y obtener credenciales
- [ ] Twilio: Verificar número de teléfono
- [ ] Pruebas: Enviar SMS de prueba
- [ ] Pruebas: Programar notificación real

---

## 🔑 Obtener Credenciales de Twilio

1. Ir a https://www.twilio.com/
2. Crear cuenta (tienen trial gratuito)
3. En el dashboard, obtener:
   - `Account SID`
   - `Auth Token`
   - `Phone Number` (número de Twilio para enviar SMS)

---

## 💡 Mejoras Futuras

- ✅ Notificación 30 minutos antes (implementado)
- ⏰ Permitir configurar tiempo personalizado (15, 30, 60 min)
- 📧 Agregar notificaciones por email
- 🔔 Notificaciones push en navegador
- 📊 Dashboard de notificaciones enviadas
- ❌ Cancelar notificación si se cancela la cita
- 🔄 Re-programar notificación si se modifica la cita

---

## ⚠️ Consideraciones

1. **Costos**: Twilio cobra por SMS enviado (~$0.0075 USD/SMS en Perú)
2. **Límites**: Cuenta trial tiene límites de envío
3. **Formato**: Números deben estar en formato E.164: `+51987654321`
4. **Zona horaria**: Ajustar según tu ubicación (actualmente -05:00)
5. **Persistencia**: Usar base de datos para notificaciones en producción

---

✅ **El frontend está completamente configurado y listo para usar!**
