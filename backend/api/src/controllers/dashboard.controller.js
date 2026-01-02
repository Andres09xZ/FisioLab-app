import { query } from '../config/database.js';

export const resumen = async (req, res) => {
  try {
    const [{ rows: r1 }, { rows: r2 }, { rows: r3 }] = await Promise.all([
      query('SELECT COUNT(*)::int as pacientes FROM pacientes WHERE activo = true'),
      query('SELECT COUNT(*)::int as profesionales FROM profesionales WHERE activo = true'),
      query('SELECT COUNT(*)::int as citas_hoy FROM citas WHERE DATE(inicio) = CURRENT_DATE')
    ]);
    return res.json({ success: true, pacientes: r1[0].pacientes, profesionales: r2[0].profesionales, citasHoy: r3[0].citas_hoy });
  } catch (err) {
    console.error('dashboard resumen error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener resumen' });
  }
};

export const ingresosMes = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT TO_CHAR(date_trunc('day', fecha_pago), 'YYYY-MM-DD') as dia, SUM(monto)::numeric as total
       FROM pagos
       WHERE date_trunc('month', fecha_pago) = date_trunc('month', CURRENT_DATE)
       GROUP BY 1
       ORDER BY 1`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('dashboard ingresosMes error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener ingresos del mes' });
  }
};

// GET /api/analytics/dashboard - Métricas completas del dashboard
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Fechas por defecto: mes actual
    const inicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    // Ejecutar todas las consultas en paralelo
    const [
      totalPacientes,
      pacientesNuevos,
      citasStats,
      sesionesStats,
      ingresos,
      planesActivos,
      profesionalesActivos,
      citasPorEstado,
      citasPorProfesional
    ] = await Promise.all([
      // Total pacientes activos
      query('SELECT COUNT(*)::int as total FROM pacientes WHERE activo = true'),
      
      // Pacientes nuevos en el período
      query(`
        SELECT COUNT(*)::int as total 
        FROM pacientes 
        WHERE created_at BETWEEN $1 AND $2::date + INTERVAL '1 day'
      `, [inicio, fin]),
      
      // Estadísticas de citas
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE estado = 'completada')::int as completadas,
          COUNT(*) FILTER (WHERE estado = 'cancelada')::int as canceladas,
          COUNT(*) FILTER (WHERE estado = 'no_asistio')::int as no_asistio,
          COUNT(*) FILTER (WHERE estado = 'programada')::int as programadas,
          COUNT(*) FILTER (WHERE DATE(inicio) = CURRENT_DATE)::int as hoy
        FROM citas 
        WHERE inicio BETWEEN $1 AND $2::date + INTERVAL '1 day'
      `, [inicio, fin]),
      
      // Estadísticas de sesiones
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE estado = 'completada')::int as completadas,
          COUNT(*) FILTER (WHERE estado = 'pendiente')::int as pendientes
        FROM sesiones 
        WHERE creado_en BETWEEN $1 AND $2::date + INTERVAL '1 day'
      `, [inicio, fin]),
      
      // Ingresos del período
      query(`
        SELECT 
          COALESCE(SUM(monto), 0)::numeric as total,
          COUNT(*)::int as cantidad_pagos
        FROM pagos 
        WHERE fecha BETWEEN $1 AND $2::date + INTERVAL '1 day'
      `, [inicio, fin]),
      
      // Planes de tratamiento activos
      query(`SELECT COUNT(*)::int as total FROM planes_tratamiento WHERE estado = 'activo'`),
      
      // Profesionales activos
      query(`SELECT COUNT(*)::int as total FROM profesionales WHERE activo = true`),
      
      // Citas por estado (para gráfico)
      query(`
        SELECT estado, COUNT(*)::int as total
        FROM citas 
        WHERE inicio BETWEEN $1 AND $2::date + INTERVAL '1 day'
        GROUP BY estado
      `, [inicio, fin]),
      
      // Citas por profesional (para gráfico)
      query(`
        SELECT 
          p.id,
          p.nombre || ' ' || p.apellido as nombre,
          COUNT(c.id)::int as total_citas,
          COUNT(*) FILTER (WHERE c.estado = 'completada')::int as completadas
        FROM profesionales p
        LEFT JOIN citas c ON p.id = c.profesional_id 
          AND c.inicio BETWEEN $1 AND $2::date + INTERVAL '1 day'
        WHERE p.activo = true
        GROUP BY p.id, p.nombre, p.apellido
        ORDER BY total_citas DESC
      `, [inicio, fin])
    ]);

    // Calcular tasa de asistencia
    const totalCitas = citasStats.rows[0].total;
    const completadas = citasStats.rows[0].completadas;
    const tasaAsistencia = totalCitas > 0 ? Math.round((completadas / totalCitas) * 100) : 0;

    return res.json({
      success: true,
      data: {
        periodo: { inicio, fin },
        resumen: {
          pacientes: {
            total: totalPacientes.rows[0].total,
            nuevos: pacientesNuevos.rows[0].total
          },
          citas: {
            total: citasStats.rows[0].total,
            hoy: citasStats.rows[0].hoy,
            completadas: citasStats.rows[0].completadas,
            canceladas: citasStats.rows[0].canceladas,
            no_asistio: citasStats.rows[0].no_asistio,
            programadas: citasStats.rows[0].programadas,
            tasa_asistencia: tasaAsistencia
          },
          sesiones: {
            total: sesionesStats.rows[0].total,
            completadas: sesionesStats.rows[0].completadas,
            pendientes: sesionesStats.rows[0].pendientes
          },
          ingresos: {
            total: parseFloat(ingresos.rows[0].total) || 0,
            cantidad_pagos: ingresos.rows[0].cantidad_pagos
          },
          planes_activos: planesActivos.rows[0].total,
          profesionales_activos: profesionalesActivos.rows[0].total
        },
        graficos: {
          citas_por_estado: citasPorEstado.rows,
          citas_por_profesional: citasPorProfesional.rows
        }
      }
    });
  } catch (err) {
    console.error('getAnalyticsDashboard error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener analytics', error: err.message });
  }
};

// GET /api/analytics/tendencias - Tendencias de citas por día
export const getTendencias = async (req, res) => {
  try {
    const { dias } = req.query;
    const numeroDias = parseInt(dias) || 30;

    const { rows } = await query(`
      SELECT 
        DATE(inicio)::text as fecha,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE estado = 'completada')::int as completadas,
        COUNT(*) FILTER (WHERE estado = 'cancelada')::int as canceladas
      FROM citas
      WHERE inicio >= CURRENT_DATE - INTERVAL '${numeroDias} days'
      GROUP BY DATE(inicio)
      ORDER BY fecha
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getTendencias error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener tendencias' });
  }
};
