/**
 * Validadores de Datos
 * Implementa validaciones según los requisitos de negocio
 */

/**
 * Validar que la fecha de nacimiento es válida
 */
export const validarFechaNacimiento = (fechaNacimiento) => {
  const fecha = new Date(fechaNacimiento);
  const hoy = new Date();

  if (fecha >= hoy) {
    return {
      valido: false,
      mensaje: 'La fecha de nacimiento debe ser anterior a hoy'
    };
  }

  const anioMinimo = new Date('1900-01-01');
  if (fecha < anioMinimo) {
    return {
      valido: false,
      mensaje: 'La fecha de nacimiento no puede ser anterior a 1900'
    };
  }

  return { valido: true };
};

/**
 * Validar EVA Score (0-10)
 */
export const validarEvaScore = (score) => {
  const num = parseInt(score);

  if (isNaN(num)) {
    return {
      valido: false,
      mensaje: 'EVA score debe ser un número'
    };
  }

  if (num < 0 || num > 10) {
    return {
      valido: false,
      mensaje: 'EVA score debe estar entre 0 y 10'
    };
  }

  return { valido: true };
};

/**
 * Validar documento único
 */
export const validarDocumentoUnico = async (numeroDocumento, pacienteId = null) => {
  const { query } = await import('../config/database.js');

  const whereClause = pacienteId
    ? `numero_documento = $1 AND id != $2`
    : `numero_documento = $1`;

  const params = pacienteId ? [numeroDocumento, pacienteId] : [numeroDocumento];

  const resultado = await query(
    `SELECT id FROM pacientes WHERE ${whereClause} LIMIT 1`,
    params
  );

  if (resultado.rows.length > 0) {
    return {
      valido: false,
      mensaje: `Ya existe un paciente con el documento ${numeroDocumento}`,
      pacienteExistente: resultado.rows[0].id
    };
  }

  return { valido: true };
};

/**
 * Validar email único
 */
export const validarEmailUnico = async (email, pacienteId = null) => {
  if (!email) {
    return { valido: true }; // Email es opcional
  }

  const { query } = await import('../config/database.js');

  const whereClause = pacienteId
    ? `email = $1 AND id != $2`
    : `email = $1`;

  const params = pacienteId ? [email, pacienteId] : [email];

  const resultado = await query(
    `SELECT id FROM pacientes WHERE ${whereClause} LIMIT 1`,
    params
  );

  if (resultado.rows.length > 0) {
    return {
      valido: false,
      mensaje: `El email ${email} ya está registrado`,
      pacienteExistente: resultado.rows[0].id
    };
  }

  return { valido: true };
};

/**
 * Validar formato de teléfono (9 dígitos para Perú)
 */
export const validarTelefono = (telefono) => {
  const regex = /^9\d{8}$/;

  if (!regex.test(telefono)) {
    return {
      valido: false,
      mensaje: 'El teléfono debe tener 9 dígitos y comenzar con 9'
    };
  }

  return { valido: true };
};

/**
 * Validar datos de paciente completos
 */
export const validarDatosPaciente = async (datos, esActualizacion = false, pacienteId = null) => {
  const errores = [];

  // Validaciones obligatorias (solo en creación)
  if (!esActualizacion) {
    if (!datos.nombres || datos.nombres.trim().length < 2) {
      errores.push({
        field: 'nombres',
        message: 'Nombres es requerido (mínimo 2 caracteres)'
      });
    }

    if (!datos.apellidos || datos.apellidos.trim().length < 2) {
      errores.push({
        field: 'apellidos',
        message: 'Apellidos es requerido (mínimo 2 caracteres)'
      });
    }

    if (!datos.numero_documento) {
      errores.push({
        field: 'numero_documento',
        message: 'Número de documento es requerido'
      });
    }

    if (!datos.fecha_nacimiento) {
      errores.push({
        field: 'fecha_nacimiento',
        message: 'Fecha de nacimiento es requerida'
      });
    }

    if (!datos.sexo) {
      errores.push({
        field: 'sexo',
        message: 'Sexo es requerido'
      });
    }

    if (!datos.celular) {
      errores.push({
        field: 'celular',
        message: 'Celular es requerido'
      });
    }
  }

  // Validar fecha de nacimiento
  if (datos.fecha_nacimiento) {
    const validacionFecha = validarFechaNacimiento(datos.fecha_nacimiento);
    if (!validacionFecha.valido) {
      errores.push({
        field: 'fecha_nacimiento',
        message: validacionFecha.mensaje
      });
    }
  }

  // Validar documento único
  if (datos.numero_documento) {
    const validacionDocumento = await validarDocumentoUnico(
      datos.numero_documento,
      pacienteId
    );
    if (!validacionDocumento.valido) {
      errores.push({
        field: 'numero_documento',
        message: validacionDocumento.mensaje
      });
    }
  }

  // Validar email único
  if (datos.email) {
    const validacionEmail = await validarEmailUnico(datos.email, pacienteId);
    if (!validacionEmail.valido) {
      errores.push({
        field: 'email',
        message: validacionEmail.mensaje
      });
    }
  }

  // Validar teléfono
  if (datos.celular) {
    const validacionTelefono = validarTelefono(datos.celular);
    if (!validacionTelefono.valido) {
      errores.push({
        field: 'celular',
        message: validacionTelefono.mensaje
      });
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Validar datos de evaluación
 */
export const validarDatosEvaluacion = (datos) => {
  const errores = [];

  if (!datos.paciente_id) {
    errores.push({
      field: 'paciente_id',
      message: 'ID de paciente es requerido'
    });
  }

  if (!datos.motivo_consulta || datos.motivo_consulta.trim().length < 10) {
    errores.push({
      field: 'motivo_consulta',
      message: 'Motivo de consulta es requerido (mínimo 10 caracteres)'
    });
  }

  if (!datos.diagnostico_fisio || datos.diagnostico_fisio.trim().length < 10) {
    errores.push({
      field: 'diagnostico_fisio',
      message: 'Diagnóstico fisioterapéutico es requerido (mínimo 10 caracteres)'
    });
  }

  if (datos.eva_score !== undefined && datos.eva_score !== null) {
    const validacionEva = validarEvaScore(datos.eva_score);
    if (!validacionEva.valido) {
      errores.push({
        field: 'eva_score',
        message: validacionEva.mensaje
      });
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Validar datos de plan de tratamiento
 */
export const validarDatosPlan = (datos) => {
  const errores = [];

  if (!datos.evaluacion_id) {
    errores.push({
      field: 'evaluacion_id',
      message: 'ID de evaluación es requerido'
    });
  }

  if (!datos.objetivos || datos.objetivos.trim().length < 20) {
    errores.push({
      field: 'objetivos',
      message: 'Objetivos son requeridos (mínimo 20 caracteres)'
    });
  }

  if (!datos.total_sesiones || datos.total_sesiones < 1) {
    errores.push({
      field: 'total_sesiones',
      message: 'Total de sesiones debe ser mayor a 0'
    });
  }

  if (!datos.frecuencia_semanal || datos.frecuencia_semanal < 1 || datos.frecuencia_semanal > 7) {
    errores.push({
      field: 'frecuencia_semanal',
      message: 'Frecuencia semanal debe estar entre 1 y 7'
    });
  }

  if (!datos.fecha_inicio) {
    errores.push({
      field: 'fecha_inicio',
      message: 'Fecha de inicio es requerida'
    });
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Validar días de la semana
 */
export const validarDiasSemana = (diasSemana) => {
  if (!Array.isArray(diasSemana)) {
    return {
      valido: false,
      mensaje: 'diasSemana debe ser un array'
    };
  }

  if (diasSemana.length === 0) {
    return {
      valido: false,
      mensaje: 'Debe especificar al menos un día de la semana'
    };
  }

  const validos = diasSemana.every((dia) => {
    return Number.isInteger(dia) && dia >= 0 && dia <= 6;
  });

  if (!validos) {
    return {
      valido: false,
      mensaje: 'Los días deben ser números entre 0 (Domingo) y 6 (Sábado)'
    };
  }

  return { valido: true };
};

/**
 * Sanitizar datos de entrada (prevenir XSS)
 */
export const sanitizarDatos = (datos) => {
  if (typeof datos !== 'object' || datos === null) {
    return datos;
  }

  // Si es un array, procesar cada elemento
  if (Array.isArray(datos)) {
    return datos.map(item => sanitizarDatos(item));
  }

  const sanitizado = {};

  for (const [key, value] of Object.entries(datos)) {
    if (typeof value === 'string') {
      // Eliminar tags HTML y scripts
      sanitizado[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    } else if (typeof value === 'object') {
      sanitizado[key] = sanitizarDatos(value);
    } else {
      sanitizado[key] = value;
    }
  }

  return sanitizado;
};
