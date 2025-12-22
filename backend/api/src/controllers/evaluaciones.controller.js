import { query } from '../config/database.js';

// EVALUACIONES FISIOTERAPÉUTICAS
// Múltiples evaluaciones por paciente a lo largo del tiempo

export const listEvaluaciones = async (req, res) => {
  try {
    const { paciente_id } = req.query;
    const params = [];
    let sql = `SELECT 
      e.id, e.paciente_id, e.fecha_evaluacion,
      e.escala_eva,
      e.motivo_consulta, e.desde_cuando,
      e.asimetria, e.atrofias_musculares, e.inflamacion, e.equimosis, e.edema, e.otros_hallazgos, e.observaciones_inspeccion,
      e.contracturas, e.irradiacion, e.hacia_donde, e.intensidad, e.sensacion,
      e.limitacion_izquierdo, e.limitacion_derecho, e.crujidos, e.amplitud_movimientos,
      e.diagnostico, e.tratamientos_anteriores,
      e.creado_en, e.actualizado_en,
      p.nombres, p.apellidos, p.documento
    FROM evaluaciones_fisioterapeuticas e
    JOIN pacientes p ON p.id = e.paciente_id
    WHERE 1=1`;
    
    if (paciente_id) {
      params.push(paciente_id);
      sql += ` AND e.paciente_id = $${params.length}`;
    }
    
    sql += ' ORDER BY e.fecha_evaluacion DESC, e.creado_en DESC';
    const { rows } = await query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listEvaluaciones error', err);
    return res.status(500).json({ success: false, message: 'Error al listar evaluaciones' });
  }
};

export const getEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT 
        e.*,
        p.nombres, p.apellidos, p.documento, p.celular, p.email
      FROM evaluaciones_fisioterapeuticas e
      JOIN pacientes p ON p.id = e.paciente_id
      WHERE e.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getEvaluacion error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener evaluación' });
  }
};

export const createEvaluacion = async (req, res) => {
  try {
    const {
      paciente_id,
      fecha_evaluacion,
      // Escala EVA (0-10)
      escala_eva,
      // 2. Motivo de la consulta
      motivo_consulta,
      desde_cuando,
      // 3. Inspección
      asimetria,
      atrofias_musculares,
      inflamacion,
      equimosis,
      edema,
      otros_hallazgos,
      observaciones_inspeccion,
      // 4. Palpación y dolor
      contracturas,
      irradiacion,
      hacia_donde,
      intensidad,
      sensacion,
      // 5. Limitación de la movilidad
      limitacion_izquierdo,
      limitacion_derecho,
      crujidos,
      amplitud_movimientos,
      // 6. Diagnóstico
      diagnostico,
      tratamientos_anteriores
    } = req.body;

    if (!paciente_id) {
      return res.status(400).json({ success: false, message: 'paciente_id es requerido' });
    }
    
    // Validar escala_eva (0-10)
    if (escala_eva !== undefined && escala_eva !== null) {
      const evaNum = parseInt(escala_eva);
      if (isNaN(evaNum) || evaNum < 0 || evaNum > 10) {
        return res.status(400).json({ success: false, message: 'escala_eva debe ser un número entre 0 y 10' });
      }
    }

    // Verificar que el paciente existe
    const p = await query('SELECT id FROM pacientes WHERE id = $1', [paciente_id]);
    if (p.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    const { rows } = await query(
      `INSERT INTO evaluaciones_fisioterapeuticas (
        paciente_id, fecha_evaluacion,
        escala_eva,
        motivo_consulta, desde_cuando,
        asimetria, atrofias_musculares, inflamacion, equimosis, edema, otros_hallazgos, observaciones_inspeccion,
        contracturas, irradiacion, hacia_donde, intensidad, sensacion,
        limitacion_izquierdo, limitacion_derecho, crujidos, amplitud_movimientos,
        diagnostico, tratamientos_anteriores
      ) VALUES (
        $1, COALESCE($2, NOW()),
        $3,
        $4, $5,
        $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23
      )
      RETURNING *`,
      [
        paciente_id, fecha_evaluacion || null,
        escala_eva || null,
        motivo_consulta || null, desde_cuando || null,
        asimetria || null, atrofias_musculares || null, inflamacion || null, equimosis || null, edema || null, otros_hallazgos || null, observaciones_inspeccion || null,
        contracturas || null, irradiacion || null, hacia_donde || null, intensidad || null, sensacion || null,
        limitacion_izquierdo || null, limitacion_derecho || null, crujidos || null, amplitud_movimientos || null,
        diagnostico || null, tratamientos_anteriores || null
      ]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createEvaluacion error', err);
    return res.status(500).json({ success: false, message: 'Error al crear evaluación' });
  }
};

export const updateEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_evaluacion,
      escala_eva,
      motivo_consulta, desde_cuando,
      asimetria, atrofias_musculares, inflamacion, equimosis, edema, otros_hallazgos, observaciones_inspeccion,
      contracturas, irradiacion, hacia_donde, intensidad, sensacion,
      limitacion_izquierdo, limitacion_derecho, crujidos, amplitud_movimientos,
      diagnostico, tratamientos_anteriores
    } = req.body;
    
    // Validar escala_eva (0-10) si se envía
    if (escala_eva !== undefined && escala_eva !== null) {
      const evaNum = parseInt(escala_eva);
      if (isNaN(evaNum) || evaNum < 0 || evaNum > 10) {
        return res.status(400).json({ success: false, message: 'escala_eva debe ser un número entre 0 y 10' });
      }
    }

    const { rows } = await query(
      `UPDATE evaluaciones_fisioterapeuticas SET
        fecha_evaluacion = COALESCE($2, fecha_evaluacion),
        escala_eva = COALESCE($3, escala_eva),
        motivo_consulta = COALESCE($4, motivo_consulta),
        desde_cuando = COALESCE($5, desde_cuando),
        asimetria = COALESCE($6, asimetria),
        atrofias_musculares = COALESCE($7, atrofias_musculares),
        inflamacion = COALESCE($8, inflamacion),
        equimosis = COALESCE($9, equimosis),
        edema = COALESCE($10, edema),
        otros_hallazgos = COALESCE($11, otros_hallazgos),
        observaciones_inspeccion = COALESCE($12, observaciones_inspeccion),
        contracturas = COALESCE($13, contracturas),
        irradiacion = COALESCE($14, irradiacion),
        hacia_donde = COALESCE($15, hacia_donde),
        intensidad = COALESCE($16, intensidad),
        sensacion = COALESCE($17, sensacion),
        limitacion_izquierdo = COALESCE($18, limitacion_izquierdo),
        limitacion_derecho = COALESCE($19, limitacion_derecho),
        crujidos = COALESCE($20, crujidos),
        amplitud_movimientos = COALESCE($21, amplitud_movimientos),
        diagnostico = COALESCE($22, diagnostico),
        tratamientos_anteriores = COALESCE($23, tratamientos_anteriores),
        actualizado_en = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        fecha_evaluacion || null,
        escala_eva || null,
        motivo_consulta || null, desde_cuando || null,
        asimetria || null, atrofias_musculares || null, inflamacion || null, equimosis || null, edema || null, otros_hallazgos || null, observaciones_inspeccion || null,
        contracturas || null, irradiacion || null, hacia_donde || null, intensidad || null, sensacion || null,
        limitacion_izquierdo || null, limitacion_derecho || null, crujidos || null, amplitud_movimientos || null,
        diagnostico || null, tratamientos_anteriores || null
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateEvaluacion error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar evaluación' });
  }
};

export const deleteEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query('DELETE FROM evaluaciones_fisioterapeuticas WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('deleteEvaluacion error', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar evaluación' });
  }
};

// Listar evaluaciones de un paciente específico (ruta anidada)
export const listEvaluacionesByPaciente = async (req, res) => {
  try {
    const { id } = req.params; // paciente_id
    
    const { rows } = await query(
      `SELECT e.*
       FROM evaluaciones_fisioterapeuticas e
       WHERE e.paciente_id = $1
       ORDER BY e.fecha_evaluacion DESC, e.creado_en DESC`,
      [id]
    );
    
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listEvaluacionesByPaciente error', err);
    return res.status(500).json({ success: false, message: 'Error al listar evaluaciones del paciente' });
  }
};
