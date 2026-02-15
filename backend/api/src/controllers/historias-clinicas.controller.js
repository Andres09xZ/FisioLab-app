import { query } from '../config/database.js';

/**
 * ==========================================
 * HISTORIAS CLÍNICAS CONTROLLER v2.0
 * ==========================================
 * Controlador para gestionar historias clínicas
 * DOCTOR: Crea Historia Clínica Traumatológica
 * FISIOTERAPEUTA: Crea Historia Clínica Fisioterapéutica
 * 
 * VISIBILIDAD:
 * - DOCTOR: Ve sus HC traumatológicas + todas las HC fisioterapéuticas
 * - FISIOTERAPEUTA: Ve sus HC fisioterapéuticas + todas las HC traumatológicas
 */

// ====== HELPER: Generar código único ======
const generateCodigoUnico = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `HC-${timestamp}-${random}`;
};

// ====== CREATE HISTORIA CLÍNICA ======
export const createHistoriaClinica = async (req, res) => {
  try {
    // Verificar que el usuario es DOCTOR o FISIOTERAPEUTA
    if (!['DOCTOR', 'FISIOTERAPEUTA'].includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo doctores y fisioterapeutas pueden crear historias clínicas' 
      });
    }

    const { body } = req;
    const userId = req.user.id;
    const userRol = req.user.rol;

    // Determinar tipo de historia: priorizar lo que envía el frontend, sino usar el rol
    const tiposValidos = ['traumatologica', 'fisioterapeutica'];
    const tipoHistoria = (body.tipo_historia && tiposValidos.includes(body.tipo_historia))
      ? body.tipo_historia
      : (userRol === 'DOCTOR' ? 'traumatologica' : 'fisioterapeutica');
    const doctor_id = userRol === 'DOCTOR' ? userId : null;
    const fisioterapeuta_id = userRol === 'FISIOTERAPEUTA' ? userId : null;

    // Validaciones de campos obligatorios
    const requiredFields = [
      'paciente_id',
      'primer_apellido_paciente',
      'primer_nombre_paciente',
      'sexo_paciente',
      'edad_anos',
      'fecha_consulta',
      'hora_consulta',
      'descripcion_enfermedad',
      'intensidad_eva',
      'peso',
      'talla',
      'diagnostico_principal',
      'plan_diagnostico',
      'plan_terapeutico'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo requerido faltante: ${field}`
        });
      }
    }

    // Validaciones de formato
    if (body.sexo_paciente && !['M', 'F', 'O'].includes(body.sexo_paciente)) {
      return res.status(400).json({
        success: false,
        message: 'Sexo debe ser M, F u O'
      });
    }

    if (body.intensidad_eva && (body.intensidad_eva < 0 || body.intensidad_eva > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Intensidad EVA debe estar entre 0 y 10'
      });
    }

    if (body.peso && body.peso <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El peso debe ser mayor a 0'
      });
    }

    if (body.talla && body.talla <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La talla debe ser mayor a 0'
      });
    }

    // Validar que el paciente existe
    const pacienteCheck = await query('SELECT id FROM pacientes WHERE id = $1', [body.paciente_id]);
    if (pacienteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El paciente no existe'
      });
    }

    // Verificar que el paciente no tenga ya una HC de este tipo
    const duplicateCheck = await query(
      'SELECT id FROM historias_clinicas WHERE paciente_id = $1 AND tipo_historia = $2 AND deleted_at IS NULL',
      [body.paciente_id, tipoHistoria]
    );
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Este paciente ya tiene una historia clínica ${tipoHistoria === 'traumatologica' ? 'traumatológica' : 'fisioterapéutica'}`
      });
    }

    // Calcular IMC si no está proporcionado
    const imc = body.imc || parseFloat((body.peso / ((body.talla / 100) ** 2)).toFixed(2));

    // Validar presión arterial
    if (body.presion_arterial_sistolica && body.presion_arterial_diastolica) {
      if (body.presion_arterial_sistolica < body.presion_arterial_diastolica) {
        return res.status(400).json({
          success: false,
          message: 'La presión sistólica no puede ser menor a la diastólica'
        });
      }
    }

    // Generar código único
    const codigo_unico = generateCodigoUnico();

    // Insertar en base de datos
    const insertQuery = `
      INSERT INTO historias_clinicas (
        paciente_id, doctor_id, fisioterapeuta_id,
        tipo_historia, creador_rol, codigo_unico,
        primer_apellido_paciente, segundo_apellido_paciente,
        primer_nombre_paciente, segundo_nombre_paciente,
        sexo_paciente, edad_anos,
        institucion_del_sistema, establecimiento_de_salud,
        motivo_consulta_primera, motivo_consulta_subsecuente, es_primera_consulta,
        fecha_consulta, hora_consulta,
        antecedente_cardiopatia, antecedente_hipertension, antecedente_enf_cardiovascular,
        antecedente_endocrino, antecedente_cancer, antecedente_tuberculosis,
        antecedente_enf_infecciosa, antecedente_mal_formacion, antecedente_otro,
        datos_clinico_quirurgicos, datos_obstetricos, datos_alergicos_relevantes,
        descripcion_enfermedad, cronologia, localizacion, caracteristicas,
        intensidad_eva, factores_agravantes, factores_alivio,
        fecha_constantes, hora_constantes, temperatura,
        presion_arterial_sistolica, presion_arterial_diastolica,
        pulso, frecuencia_respiratoria, peso, talla, imc, perimetro_abdominal,
        hemoglobina, glucosa_capilar, pleusovolumerico,
        sistema_piel_anexos, sistema_organos_sentidos, sistema_respiratorio,
        sistema_cardiovascular, sistema_digestivo, sistema_genito_urinario,
        sistema_musculo_esqueletico, sistema_endocrino, sistema_hemo_linfatico,
        sistema_nervioso, hallazgos_sistemas,
        examen_piel_panecas, examen_cabeza, examen_ojos, examen_oidos, examen_nariz,
        examen_cuello, examen_boca, examen_garganta, examen_abdomen,
        examen_axlas_mamas, examen_supereores, examen_abdomen_completo,
        examen_urogenital, examen_respiratorio, examen_vascular, examen_digestivo,
        examen_hemo_linfatico, examen_esqueletico, examen_neurologico,
        diagnostico_principal, codigo_diagnostico_principal, clasificacion_principal,
        diagnostico_secundario_1, codigo_diagnostico_secundario_1, clasificacion_secundario_1,
        diagnostico_secundario_2, codigo_diagnostico_secundario_2, clasificacion_secundario_2,
        plan_diagnostico, plan_terapeutico, plan_educacional,
        nombre_doctor, primer_apellido_doctor, segundo_apellido_doctor,
        numero_documento_doctor, firma_doctor, sello_doctor
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
        $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
        $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
        $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,
        $81, $82, $83, $84, $85, $86, $87, $88, $89, $90,
        $91, $92, $93, $94, $95, $96, $97, $98, $99, $100
      )
      RETURNING id, codigo_unico, creado_en, tipo_historia;
    `;

    const params = [
      body.paciente_id, doctor_id, fisioterapeuta_id,
      tipoHistoria, userRol, codigo_unico,
      body.primer_apellido_paciente, body.segundo_apellido_paciente || null,
      body.primer_nombre_paciente, body.segundo_nombre_paciente || null,
      body.sexo_paciente, body.edad_anos,
      body.institucion_del_sistema || null, body.establecimiento_de_salud || null,
      body.motivo_consulta_primera || null, body.motivo_consulta_subsecuente || null,
      body.es_primera_consulta !== false,
      body.fecha_consulta, body.hora_consulta,
      body.antecedente_cardiopatia || false,
      body.antecedente_hipertension || false,
      body.antecedente_enf_cardiovascular || false,
      body.antecedente_endocrino || false,
      body.antecedente_cancer || false,
      body.antecedente_tuberculosis || false,
      body.antecedente_enf_infecciosa || false,
      body.antecedente_mal_formacion || false,
      body.antecedente_otro || null,
      body.datos_clinico_quirurgicos || null,
      body.datos_obstetricos || null,
      body.datos_alergicos_relevantes || null,
      body.descripcion_enfermedad,
      body.cronologia || null,
      body.localizacion || null,
      body.caracteristicas || null,
      body.intensidad_eva,
      body.factores_agravantes || null,
      body.factores_alivio || null,
      body.fecha_constantes || body.fecha_consulta,
      body.hora_constantes || body.hora_consulta,
      body.temperatura || null,
      body.presion_arterial_sistolica || null,
      body.presion_arterial_diastolica || null,
      body.pulso || null,
      body.frecuencia_respiratoria || null,
      body.peso, body.talla, imc,
      body.perimetro_abdominal || null,
      body.hemoglobina || null,
      body.glucosa_capilar || null,
      body.pleusovolumerico || null,
      body.sistema_piel_anexos || null,
      body.sistema_organos_sentidos || null,
      body.sistema_respiratorio || null,
      body.sistema_cardiovascular || null,
      body.sistema_digestivo || null,
      body.sistema_genito_urinario || null,
      body.sistema_musculo_esqueletico || null,
      body.sistema_endocrino || null,
      body.sistema_hemo_linfatico || null,
      body.sistema_nervioso || null,
      body.hallazgos_sistemas || null,
      body.examen_piel_panecas || null,
      body.examen_cabeza || null,
      body.examen_ojos || null,
      body.examen_oidos || null,
      body.examen_nariz || null,
      body.examen_cuello || null,
      body.examen_boca || null,
      body.examen_garganta || null,
      body.examen_abdomen || null,
      body.examen_axlas_mamas || null,
      body.examen_supereores || null,
      body.examen_abdomen_completo || null,
      body.examen_urogenital || null,
      body.examen_respiratorio || null,
      body.examen_vascular || null,
      body.examen_digestivo || null,
      body.examen_hemo_linfatico || null,
      body.examen_esqueletico || null,
      body.examen_neurologico || null,
      body.diagnostico_principal,
      body.codigo_diagnostico_principal || null,
      body.clasificacion_principal || null,
      body.diagnostico_secundario_1 || null,
      body.codigo_diagnostico_secundario_1 || null,
      body.clasificacion_secundario_1 || null,
      body.diagnostico_secundario_2 || null,
      body.codigo_diagnostico_secundario_2 || null,
      body.clasificacion_secundario_2 || null,
      body.plan_diagnostico,
      body.plan_terapeutico,
      body.plan_educacional || null,
      body.nombre_doctor,
      body.primer_apellido_doctor,
      body.segundo_apellido_doctor || null,
      body.numero_documento_doctor,
      body.firma_doctor || null,
      body.sello_doctor || null
    ];

    const result = await query(insertQuery, params);

    res.status(201).json({
      success: true,
      message: `Historia clínica ${tipoHistoria} creada exitosamente`,
      data: {
        id: result.rows[0].id,
        codigo_unico: result.rows[0].codigo_unico,
        creado_en: result.rows[0].creado_en,
        tipo_historia: result.rows[0].tipo_historia
      }
    });
  } catch (error) {
    console.error('Error creating historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la historia clínica',
      error: error.message
    });
  }
};

// ====== GET ALL HISTORIAS CLÍNICAS ======
export const getHistoriasClinicas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRol = req.user.rol;

    // Solo DOCTOR y FISIOTERAPEUTA pueden acceder
    if (!['DOCTOR', 'FISIOTERAPEUTA'].includes(userRol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver historias clínicas'
      });
    }

    // LÓGICA DE FILTRADO:
    // - DOCTOR: Ve su propia HC traumatológica + todas las HC fisioterapéuticas
    // - FISIOTERAPEUTA: Ve su propia HC fisioterapéutica + todas las HC traumatológicas

    let whereCondition = '1=1';
    let params = [];

    if (userRol === 'DOCTOR') {
      // Doctor ve: Sus propias HCs traumatológicas + todas las HCs fisioterapéuticas
      whereCondition += ` AND ((hc.doctor_id = $1 AND hc.tipo_historia = 'traumatologica') OR hc.tipo_historia = 'fisioterapeutica')`;
      params.push(userId);
    } else if (userRol === 'FISIOTERAPEUTA') {
      // Fisioterapeuta ve: Sus propias HCs fisioterapéuticas + todas las HCs traumatológicas
      whereCondition += ` AND ((hc.fisioterapeuta_id = $1 AND hc.tipo_historia = 'fisioterapeutica') OR hc.tipo_historia = 'traumatologica')`;
      params.push(userId);
    }

    // Obtener total
    const countQuery = `
      SELECT COUNT(*) as total FROM historias_clinicas hc
      WHERE ${whereCondition}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Obtener historias
    const selectQuery = `
      SELECT 
        hc.id, hc.codigo_unico, hc.tipo_historia, hc.creador_rol,
        hc.paciente_id, hc.doctor_id, hc.fisioterapeuta_id,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.documento as paciente_documento,
        hc.creado_en, hc.actualizado_en,
        hc.diagnostico_principal
      FROM historias_clinicas hc
      JOIN pacientes p ON hc.paciente_id = p.id
      WHERE ${whereCondition}
      ORDER BY hc.creado_en DESC
      LIMIT 50
    `;
    const result = await query(selectQuery, params);

    res.status(200).json({
      success: true,
      total,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting historias clínicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historias clínicas',
      error: error.message
    });
  }
};

// ====== GET HISTORIA CLÍNICA POR ID ======
export const getHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRol = req.user.rol;

    // Obtener la historia
    const result = await query(
      `SELECT * FROM historias_clinicas WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    const historia = result.rows[0];

    // Validar permisos de acceso
    const esDocAndOwnHistoria = userRol === 'DOCTOR' && historia.doctor_id === userId && historia.tipo_historia === 'traumatologica';
    const esFisioAndOwnHistoria = userRol === 'FISIOTERAPEUTA' && historia.fisioterapeuta_id === userId && historia.tipo_historia === 'fisioterapeutica';
    const esDocViewingFisioHistoria = userRol === 'DOCTOR' && historia.tipo_historia === 'fisioterapeutica';
    const esFisioViewingDocHistoria = userRol === 'FISIOTERAPEUTA' && historia.tipo_historia === 'traumatologica';

    const tieneAcceso = esDocAndOwnHistoria || esFisioAndOwnHistoria || esDocViewingFisioHistoria || esFisioViewingDocHistoria;

    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta historia clínica'
      });
    }

    res.status(200).json({
      success: true,
      data: historia
    });
  } catch (error) {
    console.error('Error getting historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historia clínica',
      error: error.message
    });
  }
};

// ====== UPDATE HISTORIA CLÍNICA ======
export const updateHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRol = req.user.rol;
    const { body } = req;

    // Verificar que sea DOCTOR o FISIOTERAPEUTA
    if (!['DOCTOR', 'FISIOTERAPEUTA'].includes(userRol)) {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores y fisioterapeutas pueden editar historias clínicas'
      });
    }

    // Obtener la historia actual
    const currentResult = await query(
      'SELECT doctor_id, fisioterapeuta_id, tipo_historia FROM historias_clinicas WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    const historia = currentResult.rows[0];

    // Solo el creador puede editar
    const esDoctor = userRol === 'DOCTOR' && historia.doctor_id === userId;
    const esFisio = userRol === 'FISIOTERAPEUTA' && historia.fisioterapeuta_id === userId;

    if (!esDoctor && !esFisio) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes editar tus propias historias clínicas'
      });
    }

    // Construir UPDATE dinámico
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'motivo_consulta_primera', 'motivo_consulta_subsecuente',
      'descripcion_enfermedad', 'cronologia', 'localizacion', 'caracteristicas',
      'intensidad_eva', 'peso', 'talla', 'temperatura',
      'presion_arterial_sistolica', 'presion_arterial_diastolica',
      'pulso', 'frecuencia_respiratoria', 'diagnostico_principal',
      'plan_diagnostico', 'plan_terapeutico', 'plan_educacional'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    values.push(id);
    const updateQuery = `
      UPDATE historias_clinicas
      SET ${fields.join(', ')}, actualizado_en = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await query(updateQuery, values);

    res.status(200).json({
      success: true,
      message: 'Historia clínica actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar historia clínica',
      error: error.message
    });
  }
};

// ====== DELETE HISTORIA CLÍNICA (SOFT DELETE) ======
export const deleteHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRol = req.user.rol;

    // Verificar que sea DOCTOR o FISIOTERAPEUTA
    if (!['DOCTOR', 'FISIOTERAPEUTA'].includes(userRol)) {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores y fisioterapeutas pueden eliminar historias clínicas'
      });
    }

    // Obtener la historia
    const currentResult = await query(
      'SELECT doctor_id, fisioterapeuta_id FROM historias_clinicas WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    const historia = currentResult.rows[0];

    // Solo el creador puede eliminar
    const esDoctor = userRol === 'DOCTOR' && historia.doctor_id === userId;
    const esFisio = userRol === 'FISIOTERAPEUTA' && historia.fisioterapeuta_id === userId;

    if (!esDoctor && !esFisio) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes eliminar tus propias historias clínicas'
      });
    }

    // Soft delete
    await query(
      'DELETE FROM historias_clinicas WHERE id = $1',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Historia clínica eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar historia clínica',
      error: error.message
    });
  }
};

// ====== GET DATOS PARA RECETA ======
export const getDatosParaReceta = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRol = req.user.rol;

    // Solo DOCTORES pueden generar recetas
    if (userRol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden generar recetas'
      });
    }

    // Obtener la historia clínica
    const hcResult = await query(
      `SELECT 
        hc.id,
        hc.paciente_id,
        hc.doctor_id,
        hc.tipo_historia,
        hc.diagnostico_principal,
        hc.primer_nombre_paciente,
        hc.segundo_nombre_paciente,
        hc.primer_apellido_paciente,
        hc.segundo_apellido_paciente,
        hc.sexo_paciente,
        hc.edad_anos,
        p.documento as paciente_documento
      FROM historias_clinicas hc
      JOIN pacientes p ON hc.paciente_id = p.id
      WHERE hc.id = $1`,
      [id]
    );

    if (hcResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    const hc = hcResult.rows[0];

    // Solo el doctor creador puede generar recetas desde su HC
    if (hc.doctor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes generar recetas desde tus propias historias clínicas'
      });
    }

    // Construir nombre completo del paciente
    const nombreCompleto = [
      hc.primer_nombre_paciente,
      hc.segundo_nombre_paciente,
      hc.primer_apellido_paciente,
      hc.segundo_apellido_paciente
    ].filter(Boolean).join(' ');

    // Retornar datos necesarios para la receta
    res.status(200).json({
      success: true,
      data: {
        historia_clinica_id: hc.id,
        paciente_id: hc.paciente_id,
        paciente_nombre_completo: nombreCompleto,
        paciente_documento: hc.paciente_documento,
        paciente_edad: hc.edad_anos,
        paciente_sexo: hc.sexo_paciente,
        diagnostico_principal: hc.diagnostico_principal,
        tipo_historia: hc.tipo_historia
      }
    });
  } catch (error) {
    console.error('Error getting datos para receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos para receta',
      error: error.message
    });
  }
};
