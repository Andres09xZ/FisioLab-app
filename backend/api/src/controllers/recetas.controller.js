import { query } from '../config/database.js';

/**
 * ==========================================
 * RECETAS MÉDICAS CONTROLLER v1.0
 * ==========================================
 * Controlador para gestionar recetas médicas
 * Solo DOCTORES pueden crear y gestionar recetas
 * 
 * Endpoints:
 * - POST /api/recetas - Crear receta
 * - GET /api/recetas - Listar recetas del doctor
 * - GET /api/recetas/:id - Ver receta específica
 * - PATCH /api/recetas/:id - Actualizar receta
 * - DELETE /api/recetas/:id - Anular receta
 * - GET /api/recetas/:id/pdf - Descargar PDF
 * - POST /api/recetas/:id/duplicate - Duplicar receta
 */

// ====== HELPER: Generar código único de receta ======
const generateCodigoReceta = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `RX-${timestamp}-${random}`;
};

// ====== HELPER: Calcular fecha de vencimiento ======
const calcularFechaVencimiento = (vigenciaDias = 30) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + vigenciaDias);
  return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
};

// ====== HELPER: Validar estructura de medicamentos ======
const validarMedicamentos = (medicamentos) => {
  if (!Array.isArray(medicamentos) || medicamentos.length === 0) {
    return { valid: false, message: 'Debe incluir al menos un medicamento' };
  }

  const camposRequeridos = ['nombre', 'presentacion', 'dosis', 'duracion', 'via_administracion'];
  
  for (let i = 0; i < medicamentos.length; i++) {
    const med = medicamentos[i];
    for (const campo of camposRequeridos) {
      if (!med[campo] || med[campo].trim() === '') {
        return {
          valid: false,
          message: `Medicamento ${i + 1}: campo "${campo}" es requerido`
        };
      }
    }
  }

  return { valid: true };
};

// ====== CREATE RECETA ======
export const createReceta = async (req, res) => {
  try {
    // Verificar que el usuario es DOCTOR
    if (req.user.rol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden crear recetas médicas'
      });
    }

    const {
      historia_clinica_id,
      paciente_id,
      medicamentos,
      indicaciones_generales,
      recomendaciones,
      diagnostico_principal,
      vigencia_dias = 30,
      firma_doctor,
      numero_registro_medico
    } = req.body;

    const doctor_id = req.user.id;

    // Validaciones básicas
    if (!paciente_id) {
      return res.status(400).json({
        success: false,
        message: 'El ID del paciente es requerido'
      });
    }

    if (!diagnostico_principal) {
      return res.status(400).json({
        success: false,
        message: 'El diagnóstico principal es requerido'
      });
    }

    // Validar medicamentos
    const validacionMeds = validarMedicamentos(medicamentos);
    if (!validacionMeds.valid) {
      return res.status(400).json({
        success: false,
        message: validacionMeds.message
      });
    }

    // Validar que el paciente existe
    const pacienteCheck = await query(
      'SELECT id, nombres, apellidos, documento, fecha_nacimiento, sexo FROM pacientes WHERE id = $1',
      [paciente_id]
    );

    if (pacienteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El paciente no existe'
      });
    }

    const paciente = pacienteCheck.rows[0];

    // Si se proporciona historia_clinica_id, validar que pertenece al doctor
    if (historia_clinica_id) {
      const hcCheck = await query(
        'SELECT doctor_id, paciente_id FROM historias_clinicas WHERE id = $1',
        [historia_clinica_id]
      );

      if (hcCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Historia clínica no encontrada'
        });
      }

      if (hcCheck.rows[0].doctor_id !== doctor_id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes crear recetas desde tus propias historias clínicas'
        });
      }

      if (hcCheck.rows[0].paciente_id !== paciente_id) {
        return res.status(400).json({
          success: false,
          message: 'El paciente no coincide con la historia clínica'
        });
      }
    }

    // Calcular edad del paciente
    const edad = paciente.fecha_nacimiento
      ? Math.floor((new Date() - new Date(paciente.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Generar código único
    const codigo_receta = generateCodigoReceta();

    // Calcular fecha de vencimiento
    const fecha_vencimiento = calcularFechaVencimiento(vigencia_dias);

    // Construir nombre completo del paciente
    const paciente_nombre_completo = `${paciente.nombres} ${paciente.apellidos}`;

    // Nombre del doctor
    const nombre_doctor = `Dr. ${req.user.nombre} ${req.user.apellido}`;

    // Insertar en base de datos
    const insertQuery = `
      INSERT INTO recetas_medicas (
        historia_clinica_id,
        paciente_id,
        doctor_id,
        codigo_receta,
        paciente_nombre_completo,
        paciente_documento,
        paciente_edad,
        paciente_sexo,
        medicamentos,
        indicaciones_generales,
        recomendaciones,
        diagnostico_principal,
        firma_doctor,
        numero_registro_medico,
        nombre_doctor,
        vigencia_dias,
        fecha_vencimiento
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING id, codigo_receta, fecha_emision, fecha_vencimiento, estado;
    `;

    const params = [
      historia_clinica_id || null,
      paciente_id,
      doctor_id,
      codigo_receta,
      paciente_nombre_completo,
      paciente.documento,
      edad,
      paciente.sexo,
      JSON.stringify(medicamentos),
      indicaciones_generales || null,
      recomendaciones || null,
      diagnostico_principal,
      firma_doctor || null,
      numero_registro_medico || null,
      nombre_doctor,
      vigencia_dias,
      fecha_vencimiento
    ];

    const result = await query(insertQuery, params);

    res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente',
      data: {
        id: result.rows[0].id,
        codigo_receta: result.rows[0].codigo_receta,
        fecha_emision: result.rows[0].fecha_emision,
        fecha_vencimiento: result.rows[0].fecha_vencimiento,
        estado: result.rows[0].estado
      }
    });
  } catch (error) {
    console.error('Error creating receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la receta médica',
      error: error.message
    });
  }
};

// ====== GET ALL RECETAS ======
export const getRecetas = async (req, res) => {
  try {
    // Solo DOCTORES pueden ver recetas
    if (req.user.rol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden ver recetas médicas'
      });
    }

    const doctor_id = req.user.id;
    const { status, paciente_id, page = 1, page_size = 20, search } = req.query;

    // Construir WHERE clause
    let whereConditions = ['r.doctor_id = $1', 'r.deleted_at IS NULL'];
    let params = [doctor_id];
    let paramIndex = 2;

    // Filtro por estado
    if (status && ['activa', 'vencida', 'anulada'].includes(status)) {
      whereConditions.push(`r.estado = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filtro por paciente
    if (paciente_id) {
      whereConditions.push(`r.paciente_id = $${paramIndex}`);
      params.push(paciente_id);
      paramIndex++;
    }

    // Búsqueda
    if (search) {
      whereConditions.push(`(
        r.codigo_receta ILIKE $${paramIndex} OR
        r.paciente_nombre_completo ILIKE $${paramIndex} OR
        r.diagnostico_principal ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Obtener total de recetas
    const countQuery = `
      SELECT COUNT(*) as total
      FROM recetas_medicas r
      WHERE ${whereClause}
    `;

    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Calcular paginación
    const pageNum = parseInt(page);
    const pageSizeNum = Math.min(parseInt(page_size), 100); // Max 100 por página
    const offset = (pageNum - 1) * pageSizeNum;
    const totalPages = Math.ceil(total / pageSizeNum);

    // Obtener recetas paginadas
    const selectQuery = `
      SELECT 
        r.id,
        r.codigo_receta,
        r.paciente_nombre_completo,
        r.paciente_documento,
        r.diagnostico_principal,
        r.fecha_emision,
        r.fecha_vencimiento,
        r.estado,
        r.historia_clinica_id,
        jsonb_array_length(r.medicamentos) as cantidad_medicamentos
      FROM recetas_medicas r
      WHERE ${whereClause}
      ORDER BY r.fecha_emision DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(pageSizeNum, offset);
    const result = await query(selectQuery, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: pageNum,
        page_size: pageSizeNum,
        total,
        pages: totalPages,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error getting recetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas',
      error: error.message
    });
  }
};

// ====== GET RECETA BY ID ======
export const getReceta = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor_id = req.user.id;
    const userRol = req.user.rol;

    // Obtener la receta
    const result = await query(
      `SELECT * FROM recetas_medicas WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    const receta = result.rows[0];

    // Solo el doctor creador puede ver la receta
    if (userRol === 'DOCTOR' && receta.doctor_id !== doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta receta'
      });
    }

    // Si no es doctor, denegar acceso
    if (userRol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden ver recetas médicas'
      });
    }

    res.status(200).json({
      success: true,
      data: receta
    });
  } catch (error) {
    console.error('Error getting receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener receta',
      error: error.message
    });
  }
};

// ====== UPDATE RECETA ======
export const updateReceta = async (req, res) => {
  try {
    if (req.user.rol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden actualizar recetas'
      });
    }

    const { id } = req.params;
    const doctor_id = req.user.id;
    const { medicamentos, indicaciones_generales, recomendaciones } = req.body;

    // Verificar que la receta existe y pertenece al doctor
    const checkResult = await query(
      'SELECT doctor_id, estado, fecha_vencimiento FROM recetas_medicas WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    const receta = checkResult.rows[0];

    if (receta.doctor_id !== doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes editar tus propias recetas'
      });
    }

    // No permitir editar recetas vencidas o anuladas
    if (receta.estado === 'vencida' || receta.estado === 'anulada') {
      return res.status(400).json({
        success: false,
        message: `No puedes editar una receta ${receta.estado}`
      });
    }

    // Validar medicamentos si se proporcionan
    if (medicamentos) {
      const validacionMeds = validarMedicamentos(medicamentos);
      if (!validacionMeds.valid) {
        return res.status(400).json({
          success: false,
          message: validacionMeds.message
        });
      }
    }

    // Construir UPDATE dinámico
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (medicamentos) {
      updates.push(`medicamentos = $${paramIndex++}`);
      values.push(JSON.stringify(medicamentos));
    }

    if (indicaciones_generales !== undefined) {
      updates.push(`indicaciones_generales = $${paramIndex++}`);
      values.push(indicaciones_generales);
    }

    if (recomendaciones !== undefined) {
      updates.push(`recomendaciones = $${paramIndex++}`);
      values.push(recomendaciones);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    values.push(id);
    const updateQuery = `
      UPDATE recetas_medicas
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, codigo_receta, updated_at;
    `;

    const result = await query(updateQuery, values);

    res.status(200).json({
      success: true,
      message: 'Receta actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar receta',
      error: error.message
    });
  }
};

// ====== DELETE/ANULAR RECETA ======
export const deleteReceta = async (req, res) => {
  try {
    if (req.user.rol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden anular recetas'
      });
    }

    const { id } = req.params;
    const doctor_id = req.user.id;

    // Verificar que la receta existe y pertenece al doctor
    const checkResult = await query(
      'SELECT doctor_id, estado FROM recetas_medicas WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    const receta = checkResult.rows[0];

    if (receta.doctor_id !== doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes anular tus propias recetas'
      });
    }

    // Cambiar estado a 'anulada' (soft delete)
    await query(
      `UPDATE recetas_medicas 
       SET estado = 'anulada', deleted_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Receta anulada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al anular receta',
      error: error.message
    });
  }
};

// ====== DUPLICATE RECETA ======
export const duplicateReceta = async (req, res) => {
  try {
    if (req.user.rol !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Solo doctores pueden duplicar recetas'
      });
    }

    const { id } = req.params;
    const doctor_id = req.user.id;

    // Obtener la receta original
    const originalResult = await query(
      'SELECT * FROM recetas_medicas WHERE id = $1 AND doctor_id = $2 AND deleted_at IS NULL',
      [id, doctor_id]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada o no tienes permisos'
      });
    }

    const original = originalResult.rows[0];

    // Generar nuevo código y fechas
    const codigo_receta = generateCodigoReceta();
    const fecha_vencimiento = calcularFechaVencimiento(original.vigencia_dias);

    // Insertar nueva receta con los mismos datos
    const insertQuery = `
      INSERT INTO recetas_medicas (
        historia_clinica_id, paciente_id, doctor_id, codigo_receta,
        paciente_nombre_completo, paciente_documento, paciente_edad, paciente_sexo,
        medicamentos, indicaciones_generales, recomendaciones, diagnostico_principal,
        firma_doctor, numero_registro_medico, nombre_doctor,
        vigencia_dias, fecha_vencimiento
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING id, codigo_receta, fecha_emision;
    `;

    const params = [
      original.historia_clinica_id,
      original.paciente_id,
      doctor_id,
      codigo_receta,
      original.paciente_nombre_completo,
      original.paciente_documento,
      original.paciente_edad,
      original.paciente_sexo,
      JSON.stringify(original.medicamentos), // Convertir JSONB a JSON string
      original.indicaciones_generales,
      original.recomendaciones,
      original.diagnostico_principal,
      original.firma_doctor,
      original.numero_registro_medico,
      original.nombre_doctor,
      original.vigencia_dias,
      fecha_vencimiento
    ];

    const result = await query(insertQuery, params);

    res.status(201).json({
      success: true,
      message: 'Receta duplicada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error duplicating receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al duplicar receta',
      error: error.message
    });
  }
};

// ====== GET PDF PLACEHOLDER ======
export const getRecetaPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor_id = req.user.id;

    // Verificar que la receta existe y pertenece al doctor
    const result = await query(
      'SELECT * FROM recetas_medicas WHERE id = $1 AND doctor_id = $2 AND deleted_at IS NULL',
      [id, doctor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // TODO: Implementar generación real de PDF con pdfkit o puppeteer
    // Por ahora retornar JSON con los datos
    res.status(200).json({
      success: true,
      message: 'Generación de PDF pendiente de implementación',
      data: result.rows[0],
      note: 'Implementar con pdfkit o puppeteer en producción'
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF',
      error: error.message
    });
  }
};
