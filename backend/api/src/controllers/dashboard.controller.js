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

// GET /api/dashboard/especialidades/evaluaciones - Estadísticas de evaluaciones por especialidad
export const getEvaluacionesPorEspecialidad = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Fechas por defecto: todo el histórico si no se especifica
    const whereClause = (fecha_inicio && fecha_fin) 
      ? `WHERE e.creado_en BETWEEN $1 AND $2::date + INTERVAL '1 day'`
      : '';
    
    const params = (fecha_inicio && fecha_fin) ? [fecha_inicio, fecha_fin] : [];

    const { rows } = await query(`
      SELECT 
        COALESCE(e.especialidad, 'Sin especialidad') as especialidad,
        COUNT(e.id)::int as total_evaluaciones,
        COUNT(DISTINCT e.paciente_id)::int as total_pacientes,
        json_agg(
          DISTINCT jsonb_build_object(
            'paciente_id', p.id,
            'paciente_nombre', p.nombres || ' ' || p.apellidos,
            'paciente_documento', p.documento
          )
          ORDER BY (jsonb_build_object(
            'paciente_id', p.id,
            'paciente_nombre', p.nombres || ' ' || p.apellidos,
            'paciente_documento', p.documento
          ))
        ) as pacientes,
        ROUND(AVG(e.escala_eva), 1) as promedio_eva,
        MIN(e.fecha_evaluacion)::text as primera_evaluacion,
        MAX(e.fecha_evaluacion)::text as ultima_evaluacion
      FROM evaluaciones_fisioterapeuticas e
      INNER JOIN pacientes p ON e.paciente_id = p.id
      ${whereClause}
      GROUP BY e.especialidad
      ORDER BY total_evaluaciones DESC
    `, params);

    // Calcular totales generales
    const totalEvaluaciones = rows.reduce((sum, row) => sum + row.total_evaluaciones, 0);
    const totalPacientesUnicos = await query(`
      SELECT COUNT(DISTINCT e.paciente_id)::int as total
      FROM evaluaciones_fisioterapeuticas e
      ${whereClause}
    `, params);

    return res.json({ 
      success: true, 
      data: {
        por_especialidad: rows,
        totales: {
          evaluaciones: totalEvaluaciones,
          pacientes_unicos: totalPacientesUnicos.rows[0].total
        }
      }
    });
  } catch (err) {
    console.error('getEvaluacionesPorEspecialidad error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener estadísticas de evaluaciones' });
  }
};

// GET /api/dashboard/especialidades/planes - Estadísticas de planes por especialidad
export const getPlanesPorEspecialidad = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, estado } = req.query;
    
    // Construir filtros dinámicos
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (fecha_inicio && fecha_fin) {
      conditions.push(`pt.creado_en BETWEEN $${paramCount} AND $${paramCount + 1}::date + INTERVAL '1 day'`);
      params.push(fecha_inicio, fecha_fin);
      paramCount += 2;
    }

    if (estado) {
      conditions.push(`pt.estado = $${paramCount}`);
      params.push(estado);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(`
      SELECT 
        COALESCE(pt.especialidad, 'Sin especialidad') as especialidad,
        COUNT(pt.id)::int as total_planes,
        COUNT(DISTINCT pt.paciente_id)::int as total_pacientes,
        COUNT(*) FILTER (WHERE pt.estado = 'activo')::int as planes_activos,
        COUNT(*) FILTER (WHERE pt.estado = 'finalizado')::int as planes_finalizados,
        COUNT(*) FILTER (WHERE pt.estado = 'cancelado')::int as planes_cancelados,
        json_agg(
          DISTINCT jsonb_build_object(
            'paciente_id', p.id,
            'paciente_nombre', p.nombres || ' ' || p.apellidos,
            'paciente_documento', p.documento,
            'planes_count', (
              SELECT COUNT(*)::int 
              FROM planes_tratamiento pt2 
              WHERE pt2.paciente_id = p.id 
                AND COALESCE(pt2.especialidad, 'Sin especialidad') = COALESCE(pt.especialidad, 'Sin especialidad')
            )
          )
          ORDER BY (jsonb_build_object(
            'paciente_id', p.id,
            'paciente_nombre', p.nombres || ' ' || p.apellidos,
            'paciente_documento', p.documento,
            'planes_count', (
              SELECT COUNT(*)::int 
              FROM planes_tratamiento pt2 
              WHERE pt2.paciente_id = p.id 
                AND COALESCE(pt2.especialidad, 'Sin especialidad') = COALESCE(pt.especialidad, 'Sin especialidad')
            )
          ))
        ) as pacientes,
        SUM(pt.sesiones_plan)::int as total_sesiones_planificadas,
        SUM(pt.sesiones_completadas)::int as total_sesiones_completadas,
        CASE 
          WHEN SUM(pt.sesiones_plan) > 0 
          THEN ROUND((SUM(pt.sesiones_completadas)::decimal / SUM(pt.sesiones_plan)) * 100, 1)
          ELSE 0
        END as porcentaje_progreso
      FROM planes_tratamiento pt
      INNER JOIN pacientes p ON pt.paciente_id = p.id
      ${whereClause}
      GROUP BY pt.especialidad
      ORDER BY total_planes DESC
    `, params);

    // Calcular totales generales
    const totalesQuery = await query(`
      SELECT 
        COUNT(*)::int as total_planes,
        COUNT(DISTINCT paciente_id)::int as total_pacientes
      FROM planes_tratamiento pt
      ${whereClause}
    `, params);

    return res.json({ 
      success: true, 
      data: {
        por_especialidad: rows,
        totales: totalesQuery.rows[0]
      }
    });
  } catch (err) {
    console.error('getPlanesPorEspecialidad error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener estadísticas de planes' });
  }
};

// GET /api/dashboard/especialidades/resumen - Resumen general de especialidades
export const getResumenEspecialidades = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT 
        especialidad,
        tipo,
        total,
        pacientes
      FROM (
        -- Evaluaciones por especialidad
        SELECT 
          COALESCE(e.especialidad, 'Sin especialidad') as especialidad,
          'evaluacion' as tipo,
          COUNT(e.id)::int as total,
          COUNT(DISTINCT e.paciente_id)::int as pacientes
        FROM evaluaciones_fisioterapeuticas e
        GROUP BY e.especialidad
        
        UNION ALL
        
        -- Planes por especialidad
        SELECT 
          COALESCE(pt.especialidad, 'Sin especialidad') as especialidad,
          'plan' as tipo,
          COUNT(pt.id)::int as total,
          COUNT(DISTINCT pt.paciente_id)::int as pacientes
        FROM planes_tratamiento pt
        GROUP BY pt.especialidad
      ) combined
      ORDER BY especialidad, tipo
    `);

    // Agrupar por especialidad
    const especialidades = {};
    rows.forEach(row => {
      if (!especialidades[row.especialidad]) {
        especialidades[row.especialidad] = {
          especialidad: row.especialidad,
          evaluaciones: 0,
          planes: 0,
          pacientes_evaluaciones: 0,
          pacientes_planes: 0
        };
      }
      if (row.tipo === 'evaluacion') {
        especialidades[row.especialidad].evaluaciones = row.total;
        especialidades[row.especialidad].pacientes_evaluaciones = row.pacientes;
      } else {
        especialidades[row.especialidad].planes = row.total;
        especialidades[row.especialidad].pacientes_planes = row.pacientes;
      }
    });

    const resumen = Object.values(especialidades).sort((a, b) => 
      (b.evaluaciones + b.planes) - (a.evaluaciones + a.planes)
    );

    return res.json({ success: true, data: resumen });
  } catch (err) {
    console.error('getResumenEspecialidades error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener resumen de especialidades' });
  }
};

// GET /api/dashboard/especialidades/:especialidad/detalle - Detalle de una especialidad específica
export const getDetalleEspecialidad = async (req, res) => {
  try {
    const { especialidad } = req.params;
    const especialidadFiltro = especialidad === 'Sin especialidad' ? null : especialidad;

    // Validar especialidad
    const especialidadesValidas = ['Traumatologia', 'Neurologia', 'Deportologia', 'Pediatria', 'Geriatria', 'Sin especialidad'];
    if (!especialidadesValidas.includes(especialidad)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Especialidad inválida' 
      });
    }

    const [evaluaciones, planes, pacientes] = await Promise.all([
      // Evaluaciones de esta especialidad
      query(`
        SELECT 
          e.id,
          e.paciente_id,
          p.nombres || ' ' || p.apellidos as paciente_nombre,
          p.documento as paciente_documento,
          e.diagnostico,
          e.motivo_consulta,
          e.escala_eva,
          e.fecha_evaluacion::text,
          e.creado_en::text
        FROM evaluaciones_fisioterapeuticas e
        INNER JOIN pacientes p ON e.paciente_id = p.id
        WHERE ($1::text IS NULL AND e.especialidad IS NULL) OR e.especialidad = $1
        ORDER BY e.fecha_evaluacion DESC
        LIMIT 50
      `, [especialidadFiltro]),

      // Planes de esta especialidad
      query(`
        SELECT 
          pt.id,
          pt.paciente_id,
          p.nombres || ' ' || p.apellidos as paciente_nombre,
          p.documento as paciente_documento,
          pt.objetivo,
          pt.estado,
          pt.sesiones_plan,
          pt.sesiones_completadas,
          CASE 
            WHEN pt.sesiones_plan > 0 
            THEN ROUND((pt.sesiones_completadas::decimal / pt.sesiones_plan) * 100, 1)
            ELSE 0
          END as progreso,
          pt.creado_en::text
        FROM planes_tratamiento pt
        INNER JOIN pacientes p ON pt.paciente_id = p.id
        WHERE ($1::text IS NULL AND pt.especialidad IS NULL) OR pt.especialidad = $1
        ORDER BY pt.creado_en DESC
        LIMIT 50
      `, [especialidadFiltro]),

      // Pacientes únicos de esta especialidad
      query(`
        SELECT DISTINCT
          p.id,
          p.nombres || ' ' || p.apellidos as nombre,
          p.documento,
          p.telefono,
          p.email,
          (SELECT COUNT(*)::int FROM evaluaciones_fisioterapeuticas e 
           WHERE e.paciente_id = p.id 
           AND (($1::text IS NULL AND e.especialidad IS NULL) OR e.especialidad = $1)
          ) as total_evaluaciones,
          (SELECT COUNT(*)::int FROM planes_tratamiento pt 
           WHERE pt.paciente_id = p.id 
           AND (($1::text IS NULL AND pt.especialidad IS NULL) OR pt.especialidad = $1)
          ) as total_planes
        FROM pacientes p
        WHERE p.id IN (
          SELECT DISTINCT paciente_id FROM evaluaciones_fisioterapeuticas e
          WHERE ($1::text IS NULL AND e.especialidad IS NULL) OR e.especialidad = $1
          UNION
          SELECT DISTINCT paciente_id FROM planes_tratamiento pt
          WHERE ($1::text IS NULL AND pt.especialidad IS NULL) OR pt.especialidad = $1
        )
        ORDER BY nombre
      `, [especialidadFiltro])
    ]);

    return res.json({ 
      success: true, 
      data: {
        especialidad: especialidad,
        estadisticas: {
          total_evaluaciones: evaluaciones.rows.length,
          total_planes: planes.rows.length,
          total_pacientes: pacientes.rows.length
        },
        evaluaciones: evaluaciones.rows,
        planes: planes.rows,
        pacientes: pacientes.rows
      }
    });
  } catch (err) {
    console.error('getDetalleEspecialidad error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener detalle de especialidad' });
  }
};
