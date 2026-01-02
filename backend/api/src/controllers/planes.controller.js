import { query } from '../config/database.js';

// PLANES DE TRATAMIENTO
// Estados: 'activo', 'finalizado', 'cancelado'

export const listPlanesPorPaciente = async (req, res) => {
  try {
    const { id } = req.params; // paciente id
    const { estado } = req.query; // filtro opcional por estado

    let sql = `SELECT pt.id,
                      pt.paciente_id,
                      pt.evaluacion_id,
                      pt.objetivo,
                      pt.sesiones_plan,
                      pt.sesiones_completadas,
                      pt.estado,
                      pt.notas,
                      pt.activo,
                      pt.creado_en,
                      pt.actualizado_en,
                      (
                        SELECT COALESCE(json_agg(json_build_object(
                          'id', s.id,
                          'cita_id', s.cita_id,
                          'fecha_sesion', s.fecha_sesion,
                          'profesional_id', s.profesional_id,
                          'estado', s.estado,
                          'notas', s.notas,
                          'profesional_nombre', (SELECT nombre || ' ' || apellido FROM profesionales pr WHERE pr.id = s.profesional_id),
                          'cita_inicio', (SELECT inicio FROM citas c WHERE c.id = s.cita_id),
                          'cita_fin', (SELECT fin FROM citas c WHERE c.id = s.cita_id)
                        )), '[]'::json)
                        FROM sesiones s WHERE s.plan_id = pt.id
                      ) as sesiones,
                      (
                        SELECT json_build_object(
                          'id', ef.id,
                          'diagnostico', ef.diagnostico,
                          'fecha_evaluacion', ef.fecha_evaluacion
                        )
                        FROM evaluaciones_fisioterapeuticas ef WHERE ef.id = pt.evaluacion_id
                      ) as evaluacion
               FROM planes_tratamiento pt
               WHERE pt.paciente_id = $1`;

    const params = [id];

    if (estado) {
      params.push(estado);
      sql += ` AND pt.estado = $${params.length}`;
    }

    sql += ' ORDER BY pt.creado_en DESC';

    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listPlanesPorPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al listar planes' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { id } = req.params; // paciente id
    const { objetivo, sesiones_plan, notas, evaluacion_id } = req.body;
    if (!objetivo || !sesiones_plan) {
      return res.status(400).json({ success: false, message: 'objetivo y sesiones_plan son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO planes_tratamiento (paciente_id, evaluacion_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo)
       VALUES ($1, $2, $3, $4, 0, 'activo', $5, true)
       RETURNING id, paciente_id, evaluacion_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo, creado_en`,
      [id, evaluacion_id || null, objetivo, sesiones_plan, notas || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createPlan error', err);
    return res.status(500).json({ success: false, message: 'Error al crear plan' });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params; // plan id
    const { objetivo, sesiones_plan, notas, activo, estado, evaluacion_id } = req.body;
    
    // Validar estado si se proporciona
    const estadosValidos = ['activo', 'finalizado', 'cancelado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false, 
        message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` 
      });
    }
    
    const { rows } = await query(
      `UPDATE planes_tratamiento SET
        objetivo = COALESCE($2, objetivo),
        sesiones_plan = COALESCE($3, sesiones_plan),
        notas = COALESCE($4, notas),
        activo = COALESCE($5, activo),
        estado = COALESCE($6, estado),
        evaluacion_id = COALESCE($7, evaluacion_id),
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, paciente_id, evaluacion_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo, creado_en, actualizado_en`,
      [id, objetivo || null, sesiones_plan || null, notas || null, typeof activo === 'boolean' ? activo : null, estado || null, evaluacion_id || null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updatePlan error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar plan' });
  }
};

// Obtener plan por ID con información relacionada
export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT pt.*,
              p.nombres || ' ' || p.apellidos as paciente_nombre,
              p.documento as paciente_documento,
              e.diagnostico as evaluacion_diagnostico,
              e.motivo_consulta as evaluacion_motivo,
              e.fecha_evaluacion as evaluacion_fecha,
              e.escala_eva as evaluacion_escala_eva,
              CASE 
                WHEN pt.sesiones_plan > 0 
                THEN ROUND((COALESCE(pt.sesiones_completadas, 0)::decimal / pt.sesiones_plan) * 100)
                ELSE 0
              END as progreso_porcentaje,
              (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id) as total_sesiones,
              (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id AND s.estado = 'programada') as sesiones_programadas,
              (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id AND s.estado = 'pendiente') as sesiones_pendientes,
              (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id AND s.estado = 'completada') as sesiones_completadas_count,
              (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id AND s.estado = 'cancelada') as sesiones_canceladas
       FROM planes_tratamiento pt
       LEFT JOIN pacientes p ON pt.paciente_id = p.id
       LEFT JOIN evaluaciones_fisioterapeuticas e ON pt.evaluacion_id = e.id
       WHERE pt.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getPlan error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener plan' });
  }
};

export const createPlanForEvaluation = async (req, res) => {
  const {id: evaluacion_id} = req.params;
  const {objetivo, sesiones_plan, notas} = req.body;

  try {
    const evaluacion = await query(
      `SELECT paciente_id FROM evaluaciones_fisioterapeuticas WHERE id = $1`,
      [evaluacion_id]
    );

    if(evaluacion.rows.length === 0){
      return res.status(404).json({error: 'Evaluacion no encontrada'});
    }
    const {paciente_id} = evaluacion.rows[0]; 

    // Creamos el plan de tratamiento con estado inicial 'activo'
    const result = await query(
      `INSERT INTO planes_tratamiento (paciente_id, evaluacion_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo)
       VALUES ($1, $2, $3, $4, 0, 'activo', $5, true)
       RETURNING id, paciente_id, evaluacion_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo, creado_en`,
      [paciente_id, evaluacion_id, objetivo, sesiones_plan, notas || null]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  }catch(error){
    console.error('Error al crear plan desde evaluacion', error);
    res.status(500).json({error: 'Error al crear el plan'});
  }
}


export const getSesionesPlan = async (req, res) => {
  const {id: plan_id} = req.params;

  try{
    const result = await query(
      `SELECT 
        s.id, 
        s.plan_id, 
        s.cita_id,
        s.fecha_sesion, 
        s.profesional_id,
        s.estado, 
        s.notas,
        s.creado_en,
        p.nombre || ' ' || p.apellido as profesional_nombre,
        c.inicio as cita_inicio,
        c.fin as cita_fin,
        c.estado as cita_estado
       FROM sesiones s
       LEFT JOIN profesionales p ON s.profesional_id = p.id
       LEFT JOIN citas c ON s.cita_id = c.id
       WHERE s.plan_id = $1
       ORDER BY s.fecha_sesion ASC`,
      [plan_id]
    );
    res.json(result.rows);
  }catch(error){
    console.error('Error al obtener sesiones del plan', error);
    res.status(500).json({error: 'Error al obtener las sesiones del plan'});
  }
}

// Generar sesiones pendientes simples (sin citas asociadas)
export const generarSesionesPendientes = async (req, res) => {
  try {
    const { id: plan_id } = req.params;
    const { cantidad_sesiones } = req.body;

    // Obtener datos del plan
    const planResult = await query(
      `SELECT sesiones_plan, sesiones_completadas, paciente_id FROM planes_tratamiento WHERE id = $1`,
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }

    const { sesiones_plan, sesiones_completadas, paciente_id } = planResult.rows[0];
    
    // Usar cantidad del parámetro o la cantidad del plan
    const cantidad = cantidad_sesiones || (sesiones_plan - (sesiones_completadas || 0));

    if (cantidad <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No hay sesiones por generar o la cantidad es inválida' 
      });
    }

    // Crear sesiones pendientes sin cita asociada
    const sesionesCreadas = [];
    for (let i = 0; i < cantidad; i++) {
      const result = await query(
        `INSERT INTO sesiones (plan_id, paciente_id, profesional_id, estado, fecha_sesion)
         VALUES ($1, $2, NULL, 'pendiente', NOW())
         RETURNING id, plan_id, paciente_id, profesional_id, cita_id, fecha_sesion, estado, notas`,
        [plan_id, paciente_id]
      );
      sesionesCreadas.push(result.rows[0]);
    }

    return res.status(201).json({ 
      success: true, 
      data: sesionesCreadas,
      message: `${cantidad} sesiones pendientes creadas exitosamente` 
    });
  } catch (err) {
    console.error('generarSesionesPendientes error', err);
    return res.status(500).json({ success: false, message: 'Error al generar sesiones', error: err.message });
  }
};

export const generarSesionesAutomaticamente = async (req, res) => {
  const {id: plan_id} = req.params;
  const {fecha_inicio, dias_semana, hora, profesional_id, duracion_minutos} = req.body;

  try{
    //Validaciones 
    if(!fecha_inicio || !dias_semana || !hora || !profesional_id){
      return res.status(400).json({
        error: 'Faltan datos requeridos: fecha_inicio, dias_semana, hora, profesional_id'
      })
    }
    
    if (!Array.isArray(dias_semana) || dias_semana.length === 0) {
      return res.status(400).json({ 
        error: 'dias_semana debe ser un array con al menos un día' 
      });
    }

    const plan = await query(
      `SELECT sesiones_plan, sesiones_completadas, paciente_id FROM planes_tratamiento WHERE id = $1`,
      [plan_id]
    );

    if(plan.rows.length === 0){
      return res.status(404).json({error: 'Plan no encontrado'});
    }

    const {sesiones_plan, sesiones_completadas, paciente_id} = plan.rows[0];
    const sesionesRestantes = sesiones_plan - (sesiones_completadas || 0);
    
    if(sesionesRestantes <= 0) {
      return res.status(400).json({error: 'El plan ya tiene todas las sesiones completadas'});
    }

    // Duración por defecto: 45 minutos
    const duracion = duracion_minutos || 45;

    //Generar fechas 
    const fechaInicio = new Date(fecha_inicio);
    const sesionesGeneradas = []; 
    let sesionesCreadas = 0;
    let fechaActual = new Date(fechaInicio);

    while(sesionesCreadas < sesionesRestantes){
      const diaSemana = fechaActual.getDay(); // 0=Domingo, 1=Lunes, etc.

      if (dias_semana.includes(diaSemana)){
        // Crear fecha con hora especifica 
        const fechaSesion = new Date(fechaActual);
        const [horas, minutos] = hora.split(':');
        fechaSesion.setHours(parseInt(horas), parseInt(minutos), 0, 0);

        // Calcular fecha de fin (inicio + duración)
        const fechaFin = new Date(fechaSesion);
        fechaFin.setMinutes(fechaFin.getMinutes() + duracion);

        sesionesGeneradas.push({
          plan_id,
          paciente_id,
          fecha_sesion: fechaSesion.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          profesional_id,
          estado: 'programada'
        });
        sesionesCreadas++;
      }
      //Avanzar un dia 
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    // Insertar sesiones y citas en paralelo
    const insertPromises = sesionesGeneradas.map(async (sesion, index) => {
      // 1. Crear la cita primero
      const citaResult = await query(
        `INSERT INTO citas (paciente_id, profesional_id, inicio, fin, titulo, estado)
         VALUES ($1, $2, $3, $4, $5, 'programada')
         RETURNING id`,
        [
          sesion.paciente_id, 
          sesion.profesional_id, 
          sesion.fecha_sesion, 
          sesion.fecha_fin,
          `Sesión ${index + 1} de ${sesionesRestantes}`
        ]
      );

      const cita_id = citaResult.rows[0].id;

      // 2. Crear la sesión vinculada a la cita
      const sesionResult = await query(
        `INSERT INTO sesiones (plan_id, paciente_id, fecha_sesion, profesional_id, estado, cita_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [sesion.plan_id, sesion.paciente_id, sesion.fecha_sesion, sesion.profesional_id, sesion.estado, cita_id]
      );

      return {
        sesion: sesionResult.rows[0],
        cita_id
      };
    });

    const results = await Promise.all(insertPromises);

    res.status(201).json({
      message: 'Sesiones y citas generadas exitosamente',
      total: results.length,
      sesiones: results.map(r => r.sesion),
      citas_creadas: results.map(r => r.cita_id)
    });

  }catch(error){  
    console.error('Error al generar sesiones automaticamente', error);
    res.status(500).json({
      error: 'Error al generar sesiones',
      message: error.message
    });
  }
}

// Finalizar un plan de tratamiento
export const finalizarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas_cierre } = req.body;
    
    // Verificar que el plan existe
    const planCheck = await query(
      `SELECT id, estado FROM planes_tratamiento WHERE id = $1`,
      [id]
    );
    
    if (planCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }
    
    if (planCheck.rows[0].estado === 'finalizado') {
      return res.status(400).json({ success: false, message: 'El plan ya está finalizado' });
    }
    
    // Actualizar estado a finalizado
    const { rows } = await query(
      `UPDATE planes_tratamiento SET
        estado = 'finalizado',
        activo = false,
        notas = CASE 
          WHEN $2 IS NOT NULL THEN COALESCE(notas, '') || E'\n--- Notas de cierre ---\n' || $2
          ELSE notas
        END,
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, paciente_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo, creado_en, actualizado_en`,
      [id, notas_cierre || null]
    );
    
    return res.json({ 
      success: true, 
      data: rows[0],
      message: 'Plan finalizado exitosamente' 
    });
  } catch (err) {
    console.error('finalizarPlan error', err);
    return res.status(500).json({ success: false, message: 'Error al finalizar plan' });
  }
};

// Cambiar estado de un plan (activo, finalizado, cancelado)
export const cambiarEstadoPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo } = req.body;
    
    const estadosValidos = ['activo', 'finalizado', 'cancelado'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false, 
        message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` 
      });
    }
    
    // Verificar que el plan existe
    const planCheck = await query(
      `SELECT id, estado as estado_actual FROM planes_tratamiento WHERE id = $1`,
      [id]
    );
    
    if (planCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }
    
    const estadoActual = planCheck.rows[0].estado_actual;
    
    // Actualizar estado
    const { rows } = await query(
      `UPDATE planes_tratamiento SET
        estado = $2,
        activo = CASE WHEN $2 = 'activo' THEN true ELSE false END,
        notas = CASE 
          WHEN $3 IS NOT NULL THEN COALESCE(notas, '') || E'\n--- ' || UPPER($2) || ' ---\n' || $3
          ELSE notas
        END,
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, paciente_id, objetivo, sesiones_plan, sesiones_completadas, estado, notas, activo, creado_en, actualizado_en`,
      [id, estado, motivo || null]
    );
    
    return res.json({ 
      success: true, 
      data: rows[0],
      message: `Estado del plan cambiado de '${estadoActual}' a '${estado}'` 
    });
  } catch (err) {
    console.error('cambiarEstadoPlan error', err);
    return res.status(500).json({ success: false, message: 'Error al cambiar estado del plan' });
  }
};

// Eliminar plan de tratamiento y sus sesiones asociadas
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // Si force=true, elimina aunque tenga sesiones completadas

    // Verificar que el plan existe
    const planCheck = await query(
      `SELECT pt.id, pt.estado, pt.sesiones_completadas,
              (SELECT COUNT(*) FROM sesiones s WHERE s.plan_id = pt.id) as total_sesiones
       FROM planes_tratamiento pt 
       WHERE pt.id = $1`,
      [id]
    );

    if (planCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }

    const plan = planCheck.rows[0];

    // Prevenir eliminación si tiene sesiones completadas (a menos que force=true)
    if (plan.sesiones_completadas > 0 && force !== 'true') {
      return res.status(400).json({ 
        success: false, 
        message: `El plan tiene ${plan.sesiones_completadas} sesiones completadas. Use force=true para eliminar de todas formas.`,
        sesiones_completadas: plan.sesiones_completadas,
        total_sesiones: parseInt(plan.total_sesiones)
      });
    }

    // Obtener citas asociadas a las sesiones del plan
    const citasResult = await query(
      `SELECT DISTINCT cita_id FROM sesiones WHERE plan_id = $1 AND cita_id IS NOT NULL`,
      [id]
    );
    const citaIds = citasResult.rows.map(r => r.cita_id);

    // Eliminar sesiones del plan
    const sesionesEliminadas = await query(
      `DELETE FROM sesiones WHERE plan_id = $1 RETURNING id`,
      [id]
    );

    // Eliminar citas asociadas (si las hay)
    let citasEliminadas = { rowCount: 0 };
    if (citaIds.length > 0) {
      citasEliminadas = await query(
        `DELETE FROM citas WHERE id = ANY($1) RETURNING id`,
        [citaIds]
      );
    }

    // Eliminar el plan
    const { rows } = await query(
      `DELETE FROM planes_tratamiento WHERE id = $1 RETURNING id, paciente_id, objetivo`,
      [id]
    );

    return res.json({ 
      success: true, 
      data: rows[0],
      eliminados: {
        sesiones: sesionesEliminadas.rowCount,
        citas: citasEliminadas.rowCount
      },
      message: `Plan eliminado junto con ${sesionesEliminadas.rowCount} sesiones y ${citasEliminadas.rowCount} citas`
    });
  } catch (err) {
    console.error('deletePlan error', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar plan', error: err.message });
  }
};