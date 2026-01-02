const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Configurar notificaciones para una cita
 * Envía SMS 30 minutos antes de la cita
 */
export async function programarNotificacionCita(citaId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}> {
  try {
    const url = `${API_BASE_URL}/notificaciones/programar`;
    console.log('📱 Programando notificación para cita:', { citaId, url });
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        cita_id: citaId,
        minutos_antes: 30 
      })
    });

    console.log('📡 Respuesta programar notificación:', { status: res.status, ok: res.ok });

    const json = await res.json();
    console.log('📦 JSON notificación:', json);

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al programar notificación'
      };
    }

    return { success: true, data: json.data, message: json.message };
  } catch (error) {
    console.error('❌ Error en programarNotificacionCita:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión' 
    };
  }
}

/**
 * Enviar notificación inmediata (para pruebas)
 */
export async function enviarNotificacionInmediata(
  telefono: string,
  mensaje: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}> {
  try {
    const url = `${API_BASE_URL}/notificaciones/enviar`;
    console.log('📱 Enviando notificación inmediata:', { telefono, url });
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        telefono,
        mensaje 
      })
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al enviar notificación'
      };
    }

    return { success: true, data: json.data, message: json.message };
  } catch (error) {
    console.error('❌ Error en enviarNotificacionInmediata:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión' 
    };
  }
}

/**
 * Obtener notificaciones programadas
 */
export async function obtenerNotificacionesProgramadas(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const url = `${API_BASE_URL}/notificaciones/programadas`;
    
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener notificaciones'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('❌ Error en obtenerNotificacionesProgramadas:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión' 
    };
  }
}

/**
 * Cancelar notificación programada
 */
export async function cancelarNotificacion(notificacionId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const url = `${API_BASE_URL}/notificaciones/${notificacionId}`;
    
    const res = await fetch(url, {
      method: 'DELETE'
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al cancelar notificación'
      };
    }

    return { success: true, message: json.message };
  } catch (error) {
    console.error('❌ Error en cancelarNotificacion:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error de conexión' 
    };
  }
}
