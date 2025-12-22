import { query, getClient } from '../config/database.js';

// CITAS
// Columns assumed: id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado, notas

export const listCitas = async (req, res) => {
  try {
    const { desde, hasta, profesional_id, paciente_id } = req.query;
    const params = [];
    let sql = 'SELECT id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado FROM citas WHERE 1=1';
    if (desde) { params.push(desde); sql += ` AND inicio >= $${params.length}`; }
    if (hasta) { params.push(hasta); sql += ` AND fin <= $${params.length}`; }
    if (profesional_id) { params.push(profesional_id); sql += ` AND profesional_id = $${params.length}`; }
    if (paciente_id) { params.push(paciente_id); sql += ` AND paciente_id = $${params.length}`; }
    sql += ' ORDER BY inicio ASC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listCitas error', err);
    return res.status(500).json({ success: false, message: 'Error al listar citas' });
  }
};

export const listCalendario = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const params = [];
    let sql = 'SELECT id, titulo as title, inicio as start, fin as end, estado FROM citas WHERE 1=1';
    if (desde) { params.push(desde); sql += ` AND inicio >= $${params.length}`; }
    if (hasta) { params.push(hasta); sql += ` AND fin <= $${params.length}`; }
    sql += ' ORDER BY inicio ASC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listCalendario error', err);
    return res.status(500).json({ success: false, message: 'Error al listar calendario' });
  }
};

export const createCita = async (req, res) => {
  try {
    const { paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado, notas } = req.body;
    // Requeridos mínimos para programar: paciente_id, inicio, fin
    if (!paciente_id || !inicio || !fin) {
      return res.status(400).json({ success: false, message: 'paciente_id, inicio y fin son requeridos' });
    }
    const { rows } = await query(
      `INSERT INTO citas (paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado, notas)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::estado_cita,'programada'::estado_cita), $8)
       RETURNING id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado`,
      [paciente_id, profesional_id || null, recurso_id || null, inicio, fin, titulo || null, estado || null, notas || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createCita error', err);
    return res.status(500).json({ success: false, message: 'Error al crear cita' });
  }
};

export const bulkCitas = async (req, res) => {
  try {
    const { paciente_id, profesional_id, recurso_id, inicio, duracion_min, cantidad } = req.body;
    const n = Number(cantidad) || 10;
    if (!paciente_id || !profesional_id || !inicio || !duracion_min) {
      return res.status(400).json({ success: false, message: 'paciente_id, profesional_id, inicio y duracion_min son requeridos' });
    }
    const start = new Date(inicio);
    const results = [];
    const client = await getClient();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < n; i++) {
        const s = new Date(start.getTime() + i * (duracion_min * 60000));
        const e = new Date(s.getTime() + duracion_min * 60000);
        const { rows } = await client.query(
          `INSERT INTO citas (paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado)
           VALUES ($1, $2, $3, $4, $5, $6, 'programada'::estado_cita)
           RETURNING id, inicio, fin`,
          [paciente_id, profesional_id, recurso_id || null, s.toISOString(), e.toISOString(), `Cita ${i + 1}`]
        );
        results.push(rows[0]);
      }
      await client.query('COMMIT');
      client.release();
      return res.status(201).json({ success: true, created: results.length, items: results });
    } catch (e) {
      await client.query('ROLLBACK');
      client.release();
      throw e;
    }
  } catch (err) {
    console.error('bulkCitas error', err);
    return res.status(500).json({ success: false, message: 'Error al crear citas masivas' });
  }
};

export const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { inicio, fin, titulo, estado, notas, recurso_id } = req.body;
    const { rows } = await query(
      `UPDATE citas SET
        inicio = COALESCE($2, inicio),
        fin = COALESCE($3, fin),
        titulo = COALESCE($4, titulo),
        estado = COALESCE($5::estado_cita, estado),
        notas = COALESCE($6, notas),
        recurso_id = COALESCE($7, recurso_id),
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING id, paciente_id, profesional_id, recurso_id, inicio, fin, titulo, estado`,
      [id, inicio || null, fin || null, titulo || null, estado || null, notas || null, recurso_id || null]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateCita error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar cita' });
  }
};

export const deleteCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query('DELETE FROM citas WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Cita no encontrada' });
    return res.status(204).send();
  } catch (err) {
    console.error('deleteCita error', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar cita' });
  }
};

// Verificar disponibilidad de horario (anti-solapamiento)
export const checkDisponibilidad = async (req, res) => {
  try {
    const { profesional_id, inicio, fin, cita_id } = req.query;
    
    if (!profesional_id || !inicio || !fin) {
      return res.status(400).json({ 
        success: false, 
        message: 'profesional_id, inicio y fin son requeridos' 
      });
    }

    // Buscar citas que se solapen con el horario solicitado
    const params = [profesional_id, inicio, fin];
    let sql = `
      SELECT id, inicio, fin, titulo
      FROM citas 
      WHERE profesional_id = $1
      AND (
        (inicio < $3 AND fin > $2) -- La cita existente se solapa con el rango
      )
      AND estado != 'cancelada'
    `;
    
    // Excluir la cita actual si estamos editando
    if (cita_id) {
      params.push(cita_id);
      sql += ` AND id != $${params.length}`;
    }

    const { rows } = await query(sql, params);
    
    const disponible = rows.length === 0;
    
    return res.json({ 
      success: true, 
      disponible,
      conflictos: disponible ? [] : rows,
      message: disponible 
        ? 'Horario disponible' 
        : `Hay ${rows.length} cita(s) que se solapan con este horario`
    });
  } catch (err) {
    console.error('checkDisponibilidad error', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al verificar disponibilidad' 
    });
  }
};

// Completar cita y actualizar sesión asociada
export const completarCita = async (req, res) => {
  const client = await getClient();
  
  try {
    const { id } = req.params;
    const { notas } = req.body;

    await client.query('BEGIN');

    // Actualizar estado de la cita a 'completada'
    const citaResult = await client.query(
      `UPDATE citas 
       SET estado = 'completada', 
           notas = COALESCE($2, notas),
           actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, paciente_id, profesional_id, inicio, fin, titulo, estado`,
      [id, notas || null]
    );

    if (citaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ 
        success: false, 
        message: 'Cita no encontrada' 
      });
    }

    const cita = citaResult.rows[0];

    // Buscar si hay una sesión asociada a esta cita
    const sesionResult = await client.query(
      `SELECT id, plan_id, estado 
       FROM sesiones 
       WHERE cita_id = $1`,
      [id]
    );

    let planActualizado = null;

    if (sesionResult.rows.length > 0) {
      const sesion = sesionResult.rows[0];
      
      // Actualizar estado de la sesión a 'completada'
      await client.query(
        `UPDATE sesiones 
         SET estado = 'completada',
             notas = COALESCE($2, notas),
             actualizado_en = NOW()
         WHERE id = $1`,
        [sesion.id, notas || null]
      );

      // Incrementar sesiones_completadas en el plan
      if (sesion.plan_id) {
        const planResult = await client.query(
          `UPDATE planes_tratamiento 
           SET sesiones_completadas = sesiones_completadas + 1,
               actualizado_en = NOW()
           WHERE id = $1
           RETURNING id, sesiones_plan, sesiones_completadas, estado`,
          [sesion.plan_id]
        );

        if (planResult.rows.length > 0) {
          planActualizado = planResult.rows[0];
          
          // Si completó todas las sesiones, actualizar estado del plan
          if (planActualizado.sesiones_completadas >= planActualizado.sesiones_plan) {
            await client.query(
              `UPDATE planes_tratamiento 
               SET estado = 'completado', actualizado_en = NOW()
               WHERE id = $1`,
              [sesion.plan_id]
            );
            planActualizado.estado = 'completado';
          }
        }
      }
    }

    await client.query('COMMIT');
    client.release();

    return res.json({ 
      success: true, 
      data: {
        cita,
        plan: planActualizado,
        message: planActualizado 
          ? `Cita completada. Progreso del plan: ${planActualizado.sesiones_completadas}/${planActualizado.sesiones_plan}`
          : 'Cita completada exitosamente'
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('completarCita error', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al completar cita' 
    });
  }
};

// Obtener cita por ID con datos relacionados
export const getCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT c.*, 
              p.nombres as paciente_nombres, 
              p.apellidos as paciente_apellidos,
              p.documento as paciente_documento,
              p.celular as paciente_celular,
              pr.nombre as profesional_nombre,
              pr.apellido as profesional_apellido,
              pr.especialidad as profesional_especialidad,
              r.nombre as recurso_nombre,
              s.id as sesion_id,
              s.plan_id,
              s.estado as sesion_estado
       FROM citas c
       LEFT JOIN pacientes p ON c.paciente_id = p.id
       LEFT JOIN profesionales pr ON c.profesional_id = pr.id
       LEFT JOIN recursos r ON c.recurso_id = r.id
       LEFT JOIN sesiones s ON s.cita_id = c.id
       WHERE c.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getCita error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener cita' });
  }
};

// Obtener la sesión asociada a una cita
export const getSesionDeCita = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await query(
      `SELECT s.*,
              pt.objetivo as plan_objetivo,
              pt.sesiones_plan,
              pt.sesiones_completadas,
              pt.estado as plan_estado,
              p.nombres || ' ' || p.apellidos as paciente_nombre,
              p.documento as paciente_documento,
              pr.nombre || ' ' || pr.apellido as profesional_nombre,
              c.inicio as cita_inicio,
              c.fin as cita_fin,
              c.titulo as cita_titulo,
              c.estado as cita_estado
       FROM sesiones s
       LEFT JOIN planes_tratamiento pt ON s.plan_id = pt.id
       LEFT JOIN pacientes p ON s.paciente_id = p.id
       LEFT JOIN profesionales pr ON s.profesional_id = pr.id
       LEFT JOIN citas c ON s.cita_id = c.id
       WHERE s.cita_id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No hay sesión asociada a esta cita' 
      });
    }
    
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getSesionDeCita error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener sesión de la cita' });
  }
};

// Cancelar cita y desvincular sesión asociada
export const cancelarCita = async (req, res) => {
  const client = await getClient();
  
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    await client.query('BEGIN');

    // Verificar que la cita existe y no está ya cancelada
    const checkResult = await client.query(
      'SELECT id, estado FROM citas WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    if (checkResult.rows[0].estado === 'cancelada') {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ success: false, message: 'La cita ya está cancelada' });
    }

    // Actualizar estado de la cita a 'cancelada'
    const citaResult = await client.query(
      `UPDATE citas 
       SET estado = 'cancelada', 
           notas = CASE 
             WHEN notas IS NULL OR notas = '' THEN $2
             ELSE notas || ' | Cancelada: ' || COALESCE($2, 'Sin motivo')
           END,
           actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, paciente_id, profesional_id, inicio, fin, titulo, estado`,
      [id, motivo || 'Sin motivo especificado']
    );

    // Buscar si hay una sesión asociada y desvincularla
    const sesionResult = await client.query(
      `UPDATE sesiones 
       SET cita_id = NULL,
           estado = 'pendiente',
           fecha_sesion = NULL,
           actualizado_en = NOW()
       WHERE cita_id = $1
       RETURNING id, plan_id, paciente_id`,
      [id]
    );

    await client.query('COMMIT');
    client.release();

    return res.json({ 
      success: true, 
      data: {
        cita: citaResult.rows[0],
        sesion_desvinculada: sesionResult.rows[0] || null
      },
      message: sesionResult.rows.length > 0 
        ? 'Cita cancelada. La sesión fue devuelta a estado pendiente y puede ser reagendada.'
        : 'Cita cancelada exitosamente'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('cancelarCita error', err);
    return res.status(500).json({ success: false, message: 'Error al cancelar cita' });
  }
};
