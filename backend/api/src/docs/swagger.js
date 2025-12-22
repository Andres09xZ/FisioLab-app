import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'FisioLab API',
      version: '1.0.0',
      description: 'Documentación de la API de FisioLab (auth, profesionales, pacientes, citas, recursos, planes, sesiones, archivos, pagos, certificados, dashboard y reportes)'
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Desarrollo' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'nombre', 'apellido'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@test.com' },
            password: { type: 'string', minLength: 6, example: 'pass1234' },
            nombre: { type: 'string', example: 'Juan' },
            apellido: { type: 'string', example: 'Pérez' },
            avatar_url: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@tuclinica.com' },
            password: { type: 'string', example: 'Admin2025!' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            avatar_url: { type: 'string', nullable: true }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
        ,
        Profesional: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            documento: { type: 'string', nullable: true },
            telefono: { type: 'string', nullable: true },
            especialidad: { type: 'string', nullable: true },
            color_agenda: { type: 'string', example: '#10B981' },
            comision_porcentaje: { type: 'number', format: 'float', example: 0.0 },
            activo: { type: 'boolean', example: true },
            creado_por: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        CreateProfesionalRequest: {
          type: 'object',
          required: ['nombre', 'apellido'],
          properties: {
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'Gómez' },
            documento: { type: 'string', nullable: true },
            telefono: { type: 'string', nullable: true },
            especialidad: { type: 'string', nullable: true },
            color_agenda: { type: 'string', example: '#10B981' },
            comision_porcentaje: { type: 'number', example: 0.0 }
          }
        },
        UpdateProfesionalRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            documento: { type: 'string' },
            telefono: { type: 'string' },
            especialidad: { type: 'string' },
            color_agenda: { type: 'string' },
            comision_porcentaje: { type: 'number' },
            activo: { type: 'boolean' }
          }
        },
        Paciente: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombres: { type: 'string' },
            apellidos: { type: 'string' },
            tipo_documento: { type: 'string', description: 'Tipo de documento (ej: DNI, CE, PAS, RUC). Se almacena en mayúsculas.', example: 'DNI' },
            documento: { type: 'string', nullable: true },
            celular: { type: 'string', nullable: true },
            email: { type: 'string', format: 'email', nullable: true },
            direccion: { type: 'string', nullable: true },
            fecha_nacimiento: { type: 'string', format: 'date', nullable: true },
            sexo: { type: 'string', nullable: true, description: 'Acepta M/F/O o masculino/femenino/otro (normalizado a M/F/O)', example: 'M' },
            edad: { type: 'integer', nullable: true, example: 35 },
            emergencia_nombre: { type: 'string', nullable: true },
            emergencia_telefono: { type: 'string', nullable: true },
            antecedentes: {
              type: 'array',
              description: 'Antecedentes médicos del paciente (almacenados como JSONB)',
              items: {
                type: 'string',
                enum: [
                  'Cáncer', 'Hemopatías', 'Diabetes', 'Insuficiencia Renal', 'Cardiopatías', 'Endocarditis', 'Hipertensión',
                  'Marcapasos', 'Dispositivos Cardíacos', 'Heridas', 'Enfermedades de la piel', 'Trombosis', 'Hemorragias Activas',
                  'Epilepsias', 'Implantes Metálicos', 'Alteración de la sensibilidad', 'Tuberculosis', 'Bronquitis'
                ]
              },
              example: ['Cáncer', 'Hemopatías', 'Diabetes']
            },
            notas: { type: 'string', nullable: true, example: 'Notas adicionales del paciente' },
            profesion: { type: 'string', nullable: true, description: 'Profesión u ocupación del paciente', example: 'Enfermera' },
            tipo_trabajo: { type: 'string', nullable: true, description: 'Tipo de trabajo o jornada laboral', example: 'Turnos rotativos, oficina, trabajo físico' },
            activo: { type: 'boolean' }
          }
        },
        EvaluacionFisioterapeutica: {
          type: 'object',
          required: ['paciente_id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            paciente_id: { type: 'string', format: 'uuid' },
            fecha_evaluacion: { type: 'string', format: 'date-time', description: 'Fecha de la evaluación (por defecto NOW)' },
            // Escala EVA (Visual Analogue Scale) 0-10
            escala_eva: { 
              type: 'integer', 
              nullable: true, 
              minimum: 0, 
              maximum: 10,
              description: 'Escala Visual Analógica de dolor (0=sin dolor, 1-3=poco dolor, 4=moderado, 5-6=fuerte, 7-8=muy fuerte, 9-10=extremo)',
              example: 5
            },
            // 2. Motivo de la consulta
            motivo_consulta: { type: 'string', nullable: true, example: 'Dolor lumbar crónico' },
            desde_cuando: { type: 'string', nullable: true, example: '3 meses' },
            // 3. Inspección
            asimetria: { type: 'string', nullable: true },
            atrofias_musculares: { type: 'string', nullable: true },
            inflamacion: { type: 'string', nullable: true },
            equimosis: { type: 'string', nullable: true },
            edema: { type: 'string', nullable: true },
            otros_hallazgos: { type: 'string', nullable: true },
            observaciones_inspeccion: { type: 'string', nullable: true },
            // 4. Palpación y dolor
            contracturas: { type: 'string', nullable: true },
            irradiacion: { type: 'boolean', nullable: true },
            hacia_donde: { type: 'string', nullable: true },
            intensidad: { type: 'string', nullable: true, example: 'Izquierdo, Derecho' },
            sensacion: { type: 'string', nullable: true },
            // 5. Limitación de la movilidad
            limitacion_izquierdo: { type: 'string', nullable: true },
            limitacion_derecho: { type: 'string', nullable: true },
            crujidos: { type: 'string', nullable: true },
            amplitud_movimientos: { type: 'string', nullable: true },
            // 6. Diagnóstico
            diagnostico: { type: 'string', nullable: true },
            tratamientos_anteriores: { type: 'string', nullable: true },
            creado_en: { type: 'string', format: 'date-time' },
            actualizado_en: { type: 'string', format: 'date-time' }
          }
        },
        Recurso: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' },
            tipo: { type: 'string', example: 'sala' },
            descripcion: { type: 'string', nullable: true },
            activo: { type: 'boolean' }
          }
        },
        Cita: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            paciente_id: { type: 'string' },
            profesional_id: { type: 'string', nullable: true, description: 'Opcional para programar' },
            recurso_id: { type: 'string', nullable: true, description: 'Opcional para programar' },
            inicio: { type: 'string', format: 'date-time' },
            fin: { type: 'string', format: 'date-time' },
            titulo: { type: 'string', nullable: true },
            estado: { type: 'string', example: 'programada' }
          }
        },
        PlanTratamiento: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            paciente_id: { type: 'string' },
            objetivo: { type: 'string' },
            sesiones_plan: { type: 'integer' },
            notas: { type: 'string', nullable: true },
            activo: { type: 'boolean' }
          }
        },
        Sesion: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            cita_id: { type: 'string', nullable: true },
            paciente_id: { type: 'string' },
            profesional_id: { type: 'string', nullable: true, description: 'Opcional: ID del profesional que atendió la sesión' },
            fecha: { type: 'string', format: 'date-time' },
            notas: { type: 'string', nullable: true },
            estado: { type: 'string' }
          }
        },
        Pago: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            paciente_id: { type: 'string' },
            concepto: { type: 'string' },
            monto: { type: 'number' },
            moneda: { type: 'string', example: 'PEN' },
            fecha: { type: 'string', format: 'date-time' },
            medio: { type: 'string', nullable: true }
          }
        },
        Certificado: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            paciente_id: { type: 'string' },
            tipo: { type: 'string' },
            emitido_en: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
