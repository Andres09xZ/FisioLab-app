import { query } from '../config/database.js';

export const ocupacion = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const params = [];
    let sql = `SELECT r.id as recurso_id, r.nombre as recurso, COUNT(c.id)::int as ocupacion
               FROM recursos r
               LEFT JOIN citas c ON c.recurso_id = r.id`;
    if (desde) { params.push(desde); sql += ` AND c.inicio >= $${params.length}`; }
    if (hasta) { params.push(hasta); sql += ` AND c.fin <= $${params.length}`; }
    sql += ' GROUP BY r.id, r.nombre ORDER BY ocupacion DESC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('reportes ocupacion error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de ocupación' });
  }
};

// Reporte de pacientes atendidos por período
export const pacientesAtendidos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, profesional_id } = req.query;
    
    const inicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const params = [inicio, fin];
    let whereExtra = '';
    
    if (profesional_id) {
      params.push(profesional_id);
      whereExtra = ` AND c.profesional_id = $${params.length}`;
    }

    const { rows } = await query(`
      SELECT 
        COUNT(DISTINCT c.paciente_id)::int as total_pacientes,
        COUNT(c.id)::int as total_citas,
        COUNT(*) FILTER (WHERE c.estado = 'completada')::int as citas_completadas,
        COUNT(*) FILTER (WHERE c.estado = 'cancelada')::int as citas_canceladas,
        COUNT(*) FILTER (WHERE c.estado = 'no_asistio')::int as no_asistio
      FROM citas c
      WHERE c.inicio BETWEEN $1 AND $2::date + INTERVAL '1 day' ${whereExtra}
    `, params);

    // Detalle por día
    const { rows: porDia } = await query(`
      SELECT 
        DATE(c.inicio)::text as fecha,
        COUNT(DISTINCT c.paciente_id)::int as pacientes,
        COUNT(c.id)::int as citas
      FROM citas c
      WHERE c.inicio BETWEEN $1 AND $2::date + INTERVAL '1 day' 
        AND c.estado = 'completada' ${whereExtra}
      GROUP BY DATE(c.inicio)
      ORDER BY fecha
    `, params);

    return res.json({ 
      success: true, 
      data: {
        resumen: rows[0],
        por_dia: porDia
      },
      periodo: { inicio, fin }
    });
  } catch (err) {
    console.error('pacientesAtendidos error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de pacientes' });
  }
};

// Reporte de ingresos
export const ingresos = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, agrupacion } = req.query;
    
    const inicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
    const agrupar = agrupacion || 'dia'; // dia, semana, mes

    let dateFormat;
    switch (agrupar) {
      case 'semana':
        dateFormat = `TO_CHAR(date_trunc('week', fecha), 'IYYY-IW')`;
        break;
      case 'mes':
        dateFormat = `TO_CHAR(fecha, 'YYYY-MM')`;
        break;
      default:
        dateFormat = `DATE(fecha)::text`;
    }

    const { rows: totales } = await query(`
      SELECT 
        COALESCE(SUM(monto), 0)::numeric as total,
        COUNT(*)::int as cantidad,
        COALESCE(AVG(monto), 0)::numeric as promedio,
        COALESCE(MAX(monto), 0)::numeric as maximo,
        COALESCE(MIN(monto), 0)::numeric as minimo
      FROM pagos
      WHERE fecha BETWEEN $1 AND $2::date + INTERVAL '1 day'
    `, [inicio, fin]);

    const { rows: serie } = await query(`
      SELECT 
        ${dateFormat} as periodo,
        SUM(monto)::numeric as total,
        COUNT(*)::int as cantidad
      FROM pagos
      WHERE fecha BETWEEN $1 AND $2::date + INTERVAL '1 day'
      GROUP BY ${dateFormat}
      ORDER BY periodo
    `, [inicio, fin]);

    return res.json({ 
      success: true, 
      data: {
        resumen: {
          total: parseFloat(totales.rows?.[0]?.total || totales[0]?.total || 0),
          cantidad: totales.rows?.[0]?.cantidad || totales[0]?.cantidad || 0,
          promedio: parseFloat(totales.rows?.[0]?.promedio || totales[0]?.promedio || 0),
          maximo: parseFloat(totales.rows?.[0]?.maximo || totales[0]?.maximo || 0),
          minimo: parseFloat(totales.rows?.[0]?.minimo || totales[0]?.minimo || 0)
        },
        serie
      },
      periodo: { inicio, fin, agrupacion: agrupar }
    });
  } catch (err) {
    console.error('ingresos error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de ingresos' });
  }
};

// Reporte de rendimiento por profesional
export const rendimientoProfesionales = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const { rows } = await query(`
      SELECT 
        pr.id,
        pr.nombre || ' ' || pr.apellido as profesional,
        pr.especialidad,
        COUNT(c.id)::int as total_citas,
        COUNT(*) FILTER (WHERE c.estado = 'completada')::int as completadas,
        COUNT(*) FILTER (WHERE c.estado = 'cancelada')::int as canceladas,
        COUNT(*) FILTER (WHERE c.estado = 'no_asistio')::int as no_asistio,
        COUNT(DISTINCT c.paciente_id)::int as pacientes_atendidos,
        ROUND(
          CASE WHEN COUNT(c.id) > 0 
          THEN (COUNT(*) FILTER (WHERE c.estado = 'completada')::decimal / COUNT(c.id)) * 100 
          ELSE 0 END
        )::int as tasa_cumplimiento
      FROM profesionales pr
      LEFT JOIN citas c ON pr.id = c.profesional_id 
        AND c.inicio BETWEEN $1 AND $2::date + INTERVAL '1 day'
      WHERE pr.activo = true
      GROUP BY pr.id, pr.nombre, pr.apellido, pr.especialidad
      ORDER BY completadas DESC
    `, [inicio, fin]);

    return res.json({ 
      success: true, 
      data: rows,
      periodo: { inicio, fin }
    });
  } catch (err) {
    console.error('rendimientoProfesionales error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de profesionales' });
  }
};

// Reporte de progreso de planes de tratamiento
export const progresoPlaness = async (req, res) => {
  try {
    const { estado, paciente_id } = req.query;
    
    const params = [];
    let whereClauses = [];

    if (estado) {
      params.push(estado);
      whereClauses.push(`pt.estado = $${params.length}`);
    }

    if (paciente_id) {
      params.push(paciente_id);
      whereClauses.push(`pt.paciente_id = $${params.length}`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const { rows } = await query(`
      SELECT 
        pt.id,
        pt.objetivo,
        pt.sesiones_plan,
        pt.sesiones_completadas,
        pt.estado,
        pt.creado_en,
        ROUND(
          CASE WHEN pt.sesiones_plan > 0 
          THEN (COALESCE(pt.sesiones_completadas, 0)::decimal / pt.sesiones_plan) * 100 
          ELSE 0 END
        )::int as progreso_porcentaje,
        p.nombres || ' ' || p.apellidos as paciente_nombre,
        p.documento as paciente_documento,
        (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id AND s.estado = 'programada') as sesiones_programadas,
        (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id AND s.estado = 'pendiente') as sesiones_pendientes
      FROM planes_tratamiento pt
      JOIN pacientes p ON pt.paciente_id = p.id
      ${whereSQL}
      ORDER BY pt.creado_en DESC
    `, params);

    // Resumen general
    const { rows: resumen } = await query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE estado = 'activo')::int as activos,
        COUNT(*) FILTER (WHERE estado = 'finalizado')::int as finalizados,
        COUNT(*) FILTER (WHERE estado = 'cancelado')::int as cancelados,
        ROUND(AVG(
          CASE WHEN sesiones_plan > 0 
          THEN (COALESCE(sesiones_completadas, 0)::decimal / sesiones_plan) * 100 
          ELSE 0 END
        ))::int as progreso_promedio
      FROM planes_tratamiento
    `);

    return res.json({ 
      success: true, 
      data: {
        planes: rows,
        resumen: resumen[0]
      }
    });
  } catch (err) {
    console.error('progresoPlaness error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de planes' });
  }
};

// Reporte de asistencia
export const asistencia = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, profesional_id } = req.query;
    
    const inicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const params = [inicio, fin];
    let whereExtra = '';
    
    if (profesional_id) {
      params.push(profesional_id);
      whereExtra = ` AND c.profesional_id = $${params.length}`;
    }

    const { rows: general } = await query(`
      SELECT 
        COUNT(*)::int as total_citas,
        COUNT(*) FILTER (WHERE estado = 'completada')::int as asistieron,
        COUNT(*) FILTER (WHERE estado = 'no_asistio')::int as no_asistieron,
        COUNT(*) FILTER (WHERE estado = 'cancelada')::int as canceladas,
        ROUND(
          CASE WHEN COUNT(*) FILTER (WHERE estado IN ('completada', 'no_asistio')) > 0
          THEN (COUNT(*) FILTER (WHERE estado = 'completada')::decimal / 
                COUNT(*) FILTER (WHERE estado IN ('completada', 'no_asistio'))) * 100
          ELSE 0 END
        )::int as tasa_asistencia
      FROM citas c
      WHERE c.inicio BETWEEN $1 AND $2::date + INTERVAL '1 day' ${whereExtra}
    `, params);

    // Asistencia por día de la semana
    const { rows: porDiaSemana } = await query(`
      SELECT 
        EXTRACT(DOW FROM inicio)::int as dia_semana,
        CASE EXTRACT(DOW FROM inicio)
          WHEN 0 THEN 'Domingo'
          WHEN 1 THEN 'Lunes'
          WHEN 2 THEN 'Martes'
          WHEN 3 THEN 'Miércoles'
          WHEN 4 THEN 'Jueves'
          WHEN 5 THEN 'Viernes'
          WHEN 6 THEN 'Sábado'
        END as nombre_dia,
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE estado = 'completada')::int as asistieron,
        COUNT(*) FILTER (WHERE estado = 'no_asistio')::int as no_asistieron
      FROM citas c
      WHERE c.inicio BETWEEN $1 AND $2::date + INTERVAL '1 day' ${whereExtra}
      GROUP BY EXTRACT(DOW FROM inicio)
      ORDER BY dia_semana
    `, params);

    return res.json({ 
      success: true, 
      data: {
        general: general[0],
        por_dia_semana: porDiaSemana
      },
      periodo: { inicio, fin }
    });
  } catch (err) {
    console.error('asistencia error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener reporte de asistencia' });
  }
};
