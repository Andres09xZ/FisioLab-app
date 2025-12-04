import { query } from '../config/database.js';

// PLANES DE TRATAMIENTO
// Columns assumed: id, paciente_id, objetivo, sesiones_plan, notas, activo

export const listPlanesPorPaciente = async (req, res) => {
  try {
    const { id } = req.params; // paciente id
    const { rows } = await query(
      'SELECT id, paciente_id, objetivo, sesiones_plan, notas, activo FROM planes_tratamiento WHERE paciente_id = $1 AND activo = true ORDER BY id DESC',
      [id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listPlanesPorPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al listar planes' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { id } = req.params; // paciente id
    const { objetivo, sesiones_plan, notas } = req.body;
    if (!objetivo || !sesiones_plan) {
      return res.status(400).json({ success: false, message: 'objetivo y sesiones_plan son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO planes_tratamiento (paciente_id, objetivo, sesiones_plan, notas, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, paciente_id, objetivo, sesiones_plan, notas, activo`,
      [id, objetivo, sesiones_plan, notas || null]
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
    const { objetivo, sesiones_plan, notas, activo } = req.body;
    const { rows } = await query(
      `UPDATE planes_tratamiento SET
        objetivo = COALESCE($2, objetivo),
        sesiones_plan = COALESCE($3, sesiones_plan),
        notas = COALESCE($4, notas),
        activo = COALESCE($5, activo),
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, paciente_id, objetivo, sesiones_plan, notas, activo`,
      [id, objetivo || null, sesiones_plan || null, notas || null, typeof activo === 'boolean' ? activo : null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updatePlan error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar plan' });
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

    // Creamos el plan de tratamiento
    const result = await query(
      `INSERT INTO planes_tratamiento (paciente_id, objetivo, sesiones_plan, notas, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, paciente_id, objetivo, sesiones_plan, notas, activo`,
      [paciente_id, objetivo, sesiones_plan, notas || null]
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
        s.fecha_sesion, 
        s.profesional_id,
        s.estado, 
        s.notas,
        s.creado_en,
        p.nombre || ' ' || p.apellido as profesional_nombre
       FROM sesiones s
       LEFT JOIN profesionales p ON s.profesional_id = p.id
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

export const generarSesionesAutomaticamente = async (req, res) => {
  const {id: plan_id} = req.params;
  const {fecha_inicio, dias_semana, hora, profesional_id} = req.body;

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

        sesionesGeneradas.push({
          plan_id,
          paciente_id,
          fecha_sesion: fechaSesion.toISOString(),
          profesional_id,
          estado: 'programada'
        });
        sesionesCreadas++;
      }
      //Avanzar un dia 
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    //Insertar todas las sesiones 
    const insertValues = sesionesGeneradas.map(sesion =>
      query(
        `INSERT INTO sesiones (plan_id, paciente_id, fecha_sesion, profesional_id, estado)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [sesion.plan_id, sesion.paciente_id, sesion.fecha_sesion, sesion.profesional_id, sesion.estado]
      )
    );
    const results = await Promise.all(insertValues);
    const sesiones = results.map(r => r.rows[0]);

    res.status(201).json({
      message: 'Sesiones generadas exitosamente',
      sesiones
    });

  }catch(error){  
    console.error('Error al generar sesiones automaticamente', error);
  }
}