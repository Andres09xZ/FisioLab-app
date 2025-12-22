/**
 * API helpers para el flujo de agendamiento de citas
 * Backend base URL: http://localhost:3001/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Tipos
export interface Cita {
  id: string;
  paciente_id: string;
  profesional_id: string;
  sesion_id?: string;
  inicio: string; // ISO string
  fin: string; // ISO string
  titulo?: string;
  notas?: string;
  estado: 'programada' | 'confirmada' | 'completada' | 'cancelada';
  created_at?: string;
  updated_at?: string;
}

export interface CitaDetalle extends Cita {
  paciente_nombres?: string;
  paciente_apellidos?: string;
  paciente_documento?: string;
  paciente_celular?: string;
  profesional_nombre?: string;
  profesional_apellido?: string;
  profesional_especialidad?: string;
  recurso_nombre?: string;
  sesion_id?: string;
  plan_id?: string;
  sesion_estado?: string;
}

export interface CalendarioEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  estado: string;
  paciente_id?: string;
  profesional_id?: string;
}

export interface Sesion {
  id: string;
  plan_id: string;
  cita_id?: string;
  paciente_id: string;
  profesional_id?: string;
  fecha_sesion?: string;
  fecha_programada?: string;
  numero_sesion?: number;
  estado: string;
  notas?: string;
  notas_sesion?: string;
  ejercicios?: string;
  observaciones?: string;
  paciente_nombre?: string;
  profesional_nombre?: string;
  cita_inicio?: string;
  cita_fin?: string;
  cita_estado?: string;
  plan_objetivo?: string;
  sesiones_plan?: number;
  sesiones_completadas?: number;
  created_at?: string;
}

export interface DisponibilidadResponse {
  success: boolean;
  disponible: boolean;
  conflictos?: Array<{
    id: string;
    inicio: string;
    fin: string;
    titulo?: string;
  }>;
  message?: string;
}

export interface CrearCitaPayload {
  paciente_id: string;
  profesional_id: string;
  inicio: string; // ISO string
  fin: string; // ISO string
  titulo?: string;
  notas?: string;
  sesion_id?: string;
  plan_id?: string; // Si se proporciona, crea una sesión asociada al plan
}

export interface GenerarSesionesPayload {
  fecha_inicio: string; // YYYY-MM-DD
  dias_semana: number[]; // [1,3,5] = lunes, miércoles, viernes
  hora: string; // HH:MM
  duracion_minutos: number;
  profesional_id: string;
}

/**
 * GET /api/citas/calendario
 * Obtiene eventos del calendario para un rango de fechas
 */
export async function fetchCalendario(
  desde: string, // YYYY-MM-DD
  hasta: string, // YYYY-MM-DD
  profesionalId?: string
): Promise<{ success: boolean; data: CalendarioEvent[]; error?: string }> {
  try {
    const url = new URL(`${API_BASE_URL}/citas/calendario`);
    url.searchParams.append('desde', desde);
    url.searchParams.append('hasta', hasta);
    if (profesionalId) {
      url.searchParams.append('profesional_id', profesionalId);
    }

    const res = await fetch(url.toString());
    const json = await res.json();

    if (!res.ok) {
      return { success: false, data: [], error: json.message || 'Error al cargar calendario' };
    }

    return { success: true, data: json.data || [] };
  } catch (error) {
    console.error('fetchCalendario error:', error);
    return { success: false, data: [], error: 'Error de conexión' };
  }
}

/**
 * GET /api/agenda/disponibilidad
 * Verifica disponibilidad de un profesional en un rango horario
 */
export async function checkDisponibilidad(
  profesionalId: string,
  inicioISO: string,
  finISO: string,
  citaId?: string // Excluir esta cita de la verificación (útil al mover)
): Promise<DisponibilidadResponse> {
  try {
    const url = new URL(`${API_BASE_URL}/agenda/disponibilidad`);
    url.searchParams.append('profesional_id', profesionalId);
    url.searchParams.append('inicio', inicioISO);
    url.searchParams.append('fin', finISO);
    if (citaId) {
      url.searchParams.append('cita_id', citaId);
    }

    const res = await fetch(url.toString());
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        disponible: false,
        message: json.message || 'Error al verificar disponibilidad'
      };
    }

    return json;
  } catch (error) {
    console.error('checkDisponibilidad error:', error);
    return {
      success: false,
      disponible: false,
      message: 'Error de conexión'
    };
  }
}

/**
 * POST /api/citas
 * Crea una nueva cita
 */
export async function crearCita(
  payload: CrearCitaPayload
): Promise<{ success: boolean; data?: Cita; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al crear cita'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('crearCita error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * PUT /api/citas/{id}
 * Actualiza/mueve una cita existente
 */
export async function moverCita(
  id: string,
  inicioISO: string,
  finISO: string
): Promise<{ success: boolean; data?: Cita; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/citas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inicio: inicioISO, fin: finISO })
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al mover cita'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('moverCita error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * PUT /api/citas/{id}/completar
 * Marca una cita como completada
 */
export async function completarCita(
  id: string,
  notas?: string
): Promise<{ success: boolean; data?: Cita; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/citas/${id}/completar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: notas || '' })
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al completar cita'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('completarCita error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * POST /api/planes/{id}/generar-sesiones
 * Genera sesiones y citas automáticamente para un plan
 */
export async function generarSesiones(
  planId: string,
  payload: GenerarSesionesPayload
): Promise<{
  success: boolean;
  data?: {
    sesiones_creadas: number;
    citas_creadas: number;
    conflictos?: any[];
    sesiones?: any[];
  };
  error?: string;
}> {
  try {
    console.log('🔵 [API] generarSesiones llamado con:', { planId, payload });
    
    const res = await fetch(`${API_BASE_URL}/planes/${planId}/generar-sesiones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    console.log('🔵 [API] Respuesta del backend:', { status: res.status, json });

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || 'Error al generar sesiones'
      };
    }

    // El backend puede responder de diferentes formas, normalizamos la respuesta
    const data = json.data || {
      sesiones_creadas: json.total || json.sesiones?.length || 0,
      citas_creadas: json.citas_creadas?.length || 0,
      sesiones: json.sesiones || [],
      conflictos: json.conflictos || []
    };

    return { success: true, data };
  } catch (error) {
    console.error('generarSesiones error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/planes/{id}/sesiones
 * Obtiene las sesiones de un plan (incluye cita_id)
 */
export async function obtenerSesionesPlan(
  planId: string
): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    numero_sesion: number;
    cita_id?: string;
    completada: boolean;
    notas?: string;
  }>;
  error?: string;
}> {
  try {
    console.log('🟡 [API] obtenerSesionesPlan - Pidiendo sesiones para plan:', planId);
    const res = await fetch(`${API_BASE_URL}/planes/${planId}/sesiones`);
    const json = await res.json();
    console.log('🟡 [API] obtenerSesionesPlan - Respuesta:', { status: res.status, json });

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener sesiones'
      };
    }

    // El backend puede devolver data o directamente el array
    const sesiones = json.data || json.sesiones || (Array.isArray(json) ? json : []);
    console.log('🟡 [API] obtenerSesionesPlan - Sesiones procesadas:', sesiones);
    
    return { success: true, data: sesiones };
  } catch (error) {
    console.error('obtenerSesionesPlan error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/citas/:id
 * Obtiene detalle completo de una cita
 */
export async function obtenerCita(
  id: string
): Promise<{ success: boolean; data?: CitaDetalle; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/citas/${id}`);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener cita'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('obtenerCita error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * PUT /api/citas/:id/cancelar
 * Cancela una cita y desvincula la sesión asociada
 */
export async function cancelarCita(
  id: string,
  motivo?: string
): Promise<{ 
  success: boolean; 
  data?: { 
    cita: Cita; 
    sesion_desvinculada?: { id: string; plan_id: string; paciente_id: string } 
  }; 
  error?: string;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/citas/${id}/cancelar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivo || '' })
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al cancelar cita'
      };
    }

    return { success: true, data: json.data, message: json.message };
  } catch (error) {
    console.error('cancelarCita error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * DELETE /api/citas/:id
 * Elimina una cita permanentemente
 */
export async function eliminarCita(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/citas/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return {
        success: false,
        error: json.message || 'Error al eliminar cita'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('eliminarCita error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/sesiones
 * Lista sesiones con filtros
 */
export async function listarSesiones(
  filtros?: {
    paciente_id?: string;
    plan_id?: string;
    estado?: string;
    sin_cita?: boolean;
  }
): Promise<{ success: boolean; data?: Sesion[]; error?: string }> {
  try {
    const url = new URL(`${API_BASE_URL}/sesiones`);
    if (filtros?.paciente_id) url.searchParams.append('paciente_id', filtros.paciente_id);
    if (filtros?.plan_id) url.searchParams.append('plan_id', filtros.plan_id);
    if (filtros?.estado) url.searchParams.append('estado', filtros.estado);
    if (filtros?.sin_cita) url.searchParams.append('sin_cita', 'true');

    const res = await fetch(url.toString());
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al listar sesiones'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('listarSesiones error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * PUT /api/sesiones/:id/asignar-cita
 * Asigna una cita a una sesión pendiente
 */
export async function asignarCitaASesion(
  sesionId: string,
  citaId: string
): Promise<{ success: boolean; data?: Sesion; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/sesiones/${sesionId}/asignar-cita`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cita_id: citaId })
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al asignar cita'
      };
    }

    return { success: true, data: json.data, message: json.message };
  } catch (error) {
    console.error('asignarCitaASesion error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/pacientes/:id/sesiones-pendientes
 * Obtiene sesiones pendientes de un paciente
 */
export async function obtenerSesionesPendientesPaciente(
  pacienteId: string
): Promise<{ success: boolean; data?: Sesion[]; total_pendientes?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/pacientes/${pacienteId}/sesiones-pendientes`);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener sesiones pendientes'
      };
    }

    return { success: true, data: json.data, total_pendientes: json.total_pendientes };
  } catch (error) {
    console.error('obtenerSesionesPendientesPaciente error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * POST /api/planes/:id/generar-sesiones-pendientes
 * Genera sesiones sin citas asignadas
 */
export async function generarSesionesPendientes(
  planId: string,
  cantidadSesiones?: number
): Promise<{ success: boolean; data?: Sesion[]; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/planes/${planId}/generar-sesiones-pendientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cantidadSesiones ? { cantidad_sesiones: cantidadSesiones } : {})
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al generar sesiones pendientes'
      };
    }

    return { success: true, data: json.data, message: json.message };
  } catch (error) {
    console.error('generarSesionesPendientes error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/planes/:id
 * Obtiene detalle de un plan
 */
export async function obtenerPlan(
  planId: string
): Promise<{ 
  success: boolean; 
  data?: {
    id: string;
    paciente_id: string;
    evaluacion_id: string;
    objetivo: string;
    sesiones_plan: number;
    sesiones_completadas: number;
    estado: string;
    notas?: string;
    activo: boolean;
    paciente_nombre?: string;
    progreso_porcentaje?: number;
    sesiones_programadas?: number;
    sesiones_pendientes?: number;
    sesiones_canceladas?: number;
  }; 
  error?: string 
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/planes/${planId}`);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener plan'
      };
    }

    return { success: true, data: json.data };
  } catch (error) {
    console.error('obtenerPlan error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// =====================
// TIPOS ADICIONALES
// =====================

export interface Profesional {
  id: string;
  nombre: string;
  apellido?: string;
  especialidad?: string;
  email?: string;
  activo?: boolean;
}

export interface Recurso {
  id: string;
  nombre: string;
  tipo?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  documento?: string;
  celular?: string;
  email?: string;
}

// =====================
// FUNCIONES PARA SELECTORES
// =====================

/**
 * GET /api/profesionales
 * Obtiene lista de profesionales para selectores
 */
export async function fetchProfesionales(): Promise<{
  success: boolean;
  data?: Profesional[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/profesionales`);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener profesionales'
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error('fetchProfesionales error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * POST /api/profesionales
 * Crea un nuevo profesional
 */
export interface CrearProfesionalData {
  nombre: string;
  apellido: string;
  documento?: string;
  telefono?: string;
  email?: string;
  especialidad?: string;
  color_agenda?: string;
  comision_porcentaje?: number;
  activo?: boolean;
}

export async function crearProfesional(data: CrearProfesionalData): Promise<{
  success: boolean;
  data?: Profesional;
  error?: string;
}> {
  try {
    console.log('📤 Creando profesional:', data);
    const res = await fetch(`${API_BASE_URL}/profesionales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    console.log('📥 Respuesta crear profesional:', json);

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || 'Error al crear profesional'
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error('crearProfesional error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * PUT /api/profesionales/:id
 * Actualiza un profesional existente
 */
export async function actualizarProfesional(
  id: string, 
  data: Partial<CrearProfesionalData>
): Promise<{
  success: boolean;
  data?: Profesional;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/profesionales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || 'Error al actualizar profesional'
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error('actualizarProfesional error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * DELETE /api/profesionales/:id
 * Elimina un profesional
 */
export async function eliminarProfesional(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/profesionales/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || 'Error al eliminar profesional'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('eliminarProfesional error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/recursos
 * Obtiene lista de recursos disponibles
 */
export async function fetchRecursos(): Promise<{
  success: boolean;
  data?: Recurso[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/recursos`);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener recursos'
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error('fetchRecursos error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * GET /api/pacientes
 * Obtiene lista de pacientes para selectores
 */
export async function fetchPacientes(): Promise<{
  success: boolean;
  data?: Paciente[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/pacientes`);
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener pacientes'
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error('fetchPacientes error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// =====================
// PLANES DE PACIENTE
// =====================

export interface PlanTratamiento {
  id: string;
  paciente_id: string;
  objetivo: string;
  sesiones_plan: number;
  sesiones_completadas: number;
  estado: string;
  activo: boolean;
}

/**
 * GET /api/pacientes/:id/planes
 * Obtiene los planes de tratamiento de un paciente
 */
export async function fetchPlanesPaciente(
  pacienteId: string
): Promise<{
  success: boolean;
  data?: PlanTratamiento[];
  error?: string;
}> {
  try {
    console.log('Llamando API:', `${API_BASE_URL}/pacientes/${pacienteId}/planes`);
    const res = await fetch(`${API_BASE_URL}/pacientes/${pacienteId}/planes`);
    const json = await res.json();
    console.log('Respuesta API planes:', json);

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al obtener planes del paciente'
      };
    }

    // El backend puede devolver { success, data } o directamente un array
    const planes = json.data || json;
    console.log('Planes parseados:', planes);
    return { success: true, data: Array.isArray(planes) ? planes : [] };
  } catch (error) {
    console.error('fetchPlanesPaciente error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * PUT /api/sesiones/:id
 * Actualiza una sesión existente
 */
export async function actualizarSesion(
  sesionId: string,
  data: {
    notas_sesion?: string;
    ejercicios?: string;
    observaciones?: string;
    estado?: string;
  }
): Promise<{
  success: boolean;
  data?: Sesion;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/sesiones/${sesionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al actualizar sesión'
      };
    }

    return { success: true, data: json.data || json };
  } catch (error) {
    console.error('actualizarSesion error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * DELETE /api/sesiones/:id
 * Elimina una sesión
 */
export async function eliminarSesion(
  sesionId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/sesiones/${sesionId}`, {
      method: 'DELETE'
    });
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Error al eliminar sesión'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('eliminarSesion error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}
