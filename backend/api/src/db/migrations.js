import { query } from '../config/database.js';

export const runMigrations = async () => {
  // Run minimal, idempotent migrations needed by the API
  try {
    // Add antecedentes and notas columns to pacientes table
    await query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS antecedentes JSONB DEFAULT '[]'::jsonb`);
    await query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS notas TEXT`);
    
    // Add profesion and tipo_trabajo to pacientes (moved from evaluaciones)
    await query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS profesion TEXT`);
    await query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_trabajo TEXT`);
    
    // Add actualizado_en column to pacientes for tracking updates
    await query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW()`);

    // Ensure citas table and required columns exist
    await query(`
      CREATE TABLE IF NOT EXISTS citas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID NOT NULL,
        profesional_id UUID NULL,
        recurso_id UUID NULL,
        inicio TIMESTAMPTZ NOT NULL,
        fin TIMESTAMPTZ NOT NULL,
        titulo TEXT NULL,
        estado TEXT NOT NULL DEFAULT 'programada',
        notas TEXT NULL,
        creado_en TIMESTAMPTZ DEFAULT now(),
        actualizado_en TIMESTAMPTZ DEFAULT now()
      );
    `);
    // Add missing columns if table pre-existed
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS inicio TIMESTAMPTZ`);
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS fin TIMESTAMPTZ`);
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS titulo TEXT`);
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'programada'`);
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas TEXT`);
  // Notification columns: enabled by default, and flag to mark sent
  await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true`);
  await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false`);
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT now()`);
    await query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT now()`);

    // Foreign keys (best-effort) - check if constraint exists before adding
    const checkConstraint = async (table, constraint) => {
      try {
        const result = await query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = $1 AND constraint_name = $2
          ) as exists
        `, [table, constraint]);
        return result.rows[0].exists;
      } catch (e) {
        return false;
      }
    };

    if (!await checkConstraint('citas', 'citas_paciente_fk')) {
      try { await query(`ALTER TABLE citas ADD CONSTRAINT citas_paciente_fk FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE`); } catch (e) {}
    }
    if (!await checkConstraint('citas', 'citas_profesional_fk')) {
      try { await query(`ALTER TABLE citas ADD CONSTRAINT citas_profesional_fk FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE SET NULL`); } catch (e) {}
    }
    if (!await checkConstraint('citas', 'citas_recurso_fk')) {
      try { await query(`ALTER TABLE citas ADD CONSTRAINT citas_recurso_fk FOREIGN KEY (recurso_id) REFERENCES recursos(id) ON DELETE SET NULL`); } catch (e) {}
    }

    // Ensure profesional_id and recurso_id are nullable (drop NOT NULL if present)
    try { await query(`ALTER TABLE citas ALTER COLUMN profesional_id DROP NOT NULL`); } catch (e) {}
    try { await query(`ALTER TABLE citas ALTER COLUMN recurso_id DROP NOT NULL`); } catch (e) {}

    // Align estado column with enum type if it exists; otherwise keep TEXT
    // Create enum type if not exists
    try {
      await query(`DO $$ BEGIN
        CREATE TYPE estado_cita AS ENUM ('programada','confirmada','completada','cancelada');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
      // Alter column to use enum type if currently TEXT
      await query(`ALTER TABLE citas ALTER COLUMN estado TYPE estado_cita USING estado::estado_cita`);
    } catch (e) {
      // If enum/type change fails, keep TEXT and proceed
    }

    // Legacy column normalization for citas (silently skip if columns don't exist)
    // Check if legacy columns exist before attempting migration
    const checkColumn = async (table, column) => {
      try {
        const result = await query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = $2
          ) as exists
        `, [table, column]);
        return result.rows[0].exists;
      } catch (e) {
        return false;
      }
    };

    // Migrate fecha_hora_inicio to inicio if legacy column exists
    if (await checkColumn('citas', 'fecha_hora_inicio')) {
      try {
        await query(`UPDATE citas SET inicio = fecha_hora_inicio WHERE inicio IS NULL AND fecha_hora_inicio IS NOT NULL`);
        await query(`ALTER TABLE citas ALTER COLUMN fecha_hora_inicio DROP NOT NULL`);
        await query(`ALTER TABLE citas DROP COLUMN fecha_hora_inicio`);
      } catch (e) {}
    }

    // Migrate fecha_hora_fin to fin if legacy column exists
    if (await checkColumn('citas', 'fecha_hora_fin')) {
      try {
        await query(`UPDATE citas SET fin = fecha_hora_fin WHERE fin IS NULL AND fecha_hora_fin IS NOT NULL`);
        await query(`ALTER TABLE citas ALTER COLUMN fecha_hora_fin DROP NOT NULL`);
        await query(`ALTER TABLE citas DROP COLUMN fecha_hora_fin`);
      } catch (e) {}
    }

    // Migrate motivo to titulo if legacy column exists
    if (await checkColumn('citas', 'motivo')) {
      try {
        await query(`UPDATE citas SET titulo = motivo WHERE titulo IS NULL AND motivo IS NOT NULL`);
        await query(`ALTER TABLE citas DROP COLUMN motivo`);
      } catch (e) {}
    }
    // recordatorio_enviado left as-is (optional future use)

    // Drop historia_clinica table as it's now consolidated into pacientes
    try { await query(`DROP TABLE IF EXISTS historia_clinica CASCADE`); } catch (e) {}

    // Create evaluaciones_fisioterapeuticas table (NO DROP - preservar datos)
    await query(`
      CREATE TABLE IF NOT EXISTS evaluaciones_fisioterapeuticas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID NOT NULL,
        fecha_evaluacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        -- Escala EVA (Visual Analogue Scale) 0-10 para dolor
        escala_eva INTEGER CHECK (escala_eva >= 0 AND escala_eva <= 10),
        
        -- 2. Motivo de la consulta
        motivo_consulta TEXT,
        desde_cuando TEXT,
        
        -- 3. Inspección
        asimetria TEXT,
        atrofias_musculares TEXT,
        inflamacion TEXT,
        equimosis TEXT,
        edema TEXT,
        otros_hallazgos TEXT,
        observaciones_inspeccion TEXT,
        
        -- 4. Palpación y dolor
        contracturas TEXT,
        irradiacion BOOLEAN,
        hacia_donde TEXT,
        intensidad TEXT,
        sensacion TEXT,
        
        -- 5. Limitación de la movilidad
        limitacion_izquierdo TEXT,
        limitacion_derecho TEXT,
        crujidos TEXT,
        amplitud_movimientos TEXT,
        
        -- 6. Diagnóstico
        diagnostico TEXT,
        tratamientos_anteriores TEXT,
        
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT fk_evaluacion_paciente FOREIGN KEY (paciente_id) 
          REFERENCES pacientes(id) ON DELETE CASCADE
      );
    `);
    
    // Add escala_eva column if the table already existed
    await query(`ALTER TABLE evaluaciones_fisioterapeuticas ADD COLUMN IF NOT EXISTS escala_eva INTEGER CHECK (escala_eva >= 0 AND escala_eva <= 10)`);
    
    // Remove profesion and tipo_trabajo from evaluaciones (now in pacientes)
    // These columns will be safely dropped if they exist
    if (await checkColumn('evaluaciones_fisioterapeuticas', 'profesion')) {
      try { await query(`ALTER TABLE evaluaciones_fisioterapeuticas DROP COLUMN profesion`); } catch (e) {}
    }
    if (await checkColumn('evaluaciones_fisioterapeuticas', 'tipo_trabajo')) {
      try { await query(`ALTER TABLE evaluaciones_fisioterapeuticas DROP COLUMN tipo_trabajo`); } catch (e) {}
    }
    if (await checkColumn('evaluaciones_fisioterapeuticas', 'sedestacion_prolongada')) {
      try { await query(`ALTER TABLE evaluaciones_fisioterapeuticas DROP COLUMN sedestacion_prolongada`); } catch (e) {}
    }
    if (await checkColumn('evaluaciones_fisioterapeuticas', 'esfuerzo_fisico')) {
      try { await query(`ALTER TABLE evaluaciones_fisioterapeuticas DROP COLUMN esfuerzo_fisico`); } catch (e) {}
    }

    // Create indexes for faster lookups (silently skip if already exist)
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_evaluaciones_paciente ON evaluaciones_fisioterapeuticas(paciente_id)`);
    } catch (e) {
      // Index might already exist, skip
    }
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON evaluaciones_fisioterapeuticas(fecha_evaluacion DESC)`);
    } catch (e) {
      // Index might already exist, skip
    }

    // Ensure planes_tratamiento table exists with all required columns
    await query(`
      CREATE TABLE IF NOT EXISTS planes_tratamiento (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        paciente_id UUID NOT NULL,
        evaluacion_id UUID,
        objetivo TEXT NOT NULL,
        sesiones_plan INTEGER NOT NULL DEFAULT 0,
        sesiones_completadas INTEGER DEFAULT 0,
        estado TEXT DEFAULT 'activo',
        notas TEXT,
        activo BOOLEAN DEFAULT true,
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT fk_plan_paciente FOREIGN KEY (paciente_id) 
          REFERENCES pacientes(id) ON DELETE CASCADE
      );
    `);

    // Add missing columns to planes_tratamiento if table already existed
    try {
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS evaluacion_id UUID`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS objetivo TEXT`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS sesiones_plan INTEGER DEFAULT 0`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS sesiones_completadas INTEGER DEFAULT 0`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo'`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS notas TEXT`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT NOW()`);
      await query(`ALTER TABLE planes_tratamiento ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW()`);
    } catch (e) {
      console.log('Some columns already exist in planes_tratamiento:', e.message);
    }

    // Drop NOT NULL constraints from legacy columns if they exist
    try {
      await query(`ALTER TABLE planes_tratamiento ALTER COLUMN profesional_id DROP NOT NULL`);
    } catch (e) {
      console.log('profesional_id column might not exist or already nullable:', e.message);
    }
    try {
      await query(`ALTER TABLE planes_tratamiento ALTER COLUMN numero_sesion_total DROP NOT NULL`);
    } catch (e) {
      console.log('numero_sesion_total column might not exist or already nullable:', e.message);
    }

    // Add plan_id to sesiones table to link sessions to treatment plans
    try {
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS plan_id UUID`);
      // Add foreign key constraint
      if (!await checkConstraint('sesiones', 'fk_sesion_plan')) {
        await query(`
          ALTER TABLE sesiones 
          ADD CONSTRAINT fk_sesion_plan 
          FOREIGN KEY (plan_id) 
          REFERENCES planes_tratamiento(id) 
          ON DELETE SET NULL
        `);
      }
    } catch (e) {
      console.log('plan_id column or constraint already exists in sesiones:', e.message);
    }

    // Add foreign key constraint for evaluacion_id
    if (!await checkConstraint('planes_tratamiento', 'fk_plan_evaluacion')) {
      try {
        await query(`
          ALTER TABLE planes_tratamiento 
          ADD CONSTRAINT fk_plan_evaluacion 
          FOREIGN KEY (evaluacion_id) 
          REFERENCES evaluaciones_fisioterapeuticas(id) 
          ON DELETE SET NULL
        `);
      } catch (e) {
        console.log('Foreign key fk_plan_evaluacion already exists or error:', e.message);
      }
    }

    // Add foreign key constraint for paciente_id if not exists
    if (!await checkConstraint('planes_tratamiento', 'fk_plan_paciente')) {
      try {
        await query(`
          ALTER TABLE planes_tratamiento 
          ADD CONSTRAINT fk_plan_paciente 
          FOREIGN KEY (paciente_id) 
          REFERENCES pacientes(id) 
          ON DELETE CASCADE
        `);
      } catch (e) {
        console.log('Foreign key fk_plan_paciente already exists or error:', e.message);
      }
    }

    // Create sesiones table
    await query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id UUID NOT NULL,
        fecha_sesion TIMESTAMPTZ NOT NULL,
        profesional_id UUID,
        estado TEXT DEFAULT 'programada',
        notas TEXT,
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT fk_sesion_plan FOREIGN KEY (plan_id) 
          REFERENCES planes_tratamiento(id) ON DELETE CASCADE,
        CONSTRAINT fk_sesion_profesional FOREIGN KEY (profesional_id) 
          REFERENCES profesionales(id) ON DELETE SET NULL,
        CONSTRAINT chk_estado_sesion CHECK (estado IN ('programada', 'completada', 'cancelada'))
      );
    `);

    // Add missing columns to sesiones if table already existed with different structure
    try {
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS plan_id UUID`);
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS cita_id UUID`);
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS fecha_sesion TIMESTAMPTZ`);
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'programada'`);
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS notas TEXT`);
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ DEFAULT NOW()`);
      await query(`ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW()`);
    } catch (e) {
      console.log('Some columns already exist in sesiones:', e.message);
    }

    // Drop NOT NULL constraint from paciente_id in sesiones if it exists
    try {
      await query(`ALTER TABLE sesiones ALTER COLUMN paciente_id DROP NOT NULL`);
    } catch (e) {
      console.log('paciente_id column might not exist or already nullable in sesiones:', e.message);
    }

    // Add foreign key constraint for cita_id in sesiones
    if (!await checkConstraint('sesiones', 'fk_sesion_cita')) {
      try {
        await query(`
          ALTER TABLE sesiones 
          ADD CONSTRAINT fk_sesion_cita 
          FOREIGN KEY (cita_id) 
          REFERENCES citas(id) 
          ON DELETE SET NULL
        `);
      } catch (e) {
        console.log('Foreign key fk_sesion_cita already exists or error:', e.message);
      }
    }

    // Add foreign key constraints for sesiones if not exist
    if (!await checkConstraint('sesiones', 'fk_sesion_plan')) {
      try {
        await query(`
          ALTER TABLE sesiones 
          ADD CONSTRAINT fk_sesion_plan 
          FOREIGN KEY (plan_id) 
          REFERENCES planes_tratamiento(id) 
          ON DELETE CASCADE
        `);
      } catch (e) {
        console.log('Foreign key fk_sesion_plan already exists or error:', e.message);
      }
    }
    
    if (!await checkConstraint('sesiones', 'fk_sesion_profesional')) {
      try {
        await query(`
          ALTER TABLE sesiones 
          ADD CONSTRAINT fk_sesion_profesional 
          FOREIGN KEY (profesional_id) 
          REFERENCES profesionales(id) 
          ON DELETE SET NULL
        `);
      } catch (e) {
        console.log('Foreign key fk_sesion_profesional already exists or error:', e.message);
      }
    }

    // Create indexes for sesiones table
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_sesiones_plan ON sesiones(plan_id)`);
    } catch (e) {
      console.log('Index idx_sesiones_plan already exists or error:', e.message);
    }
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha_sesion)`);
    } catch (e) {
      console.log('Index idx_sesiones_fecha already exists or error:', e.message);
    }
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_sesiones_profesional ON sesiones(profesional_id)`);
    } catch (e) {
      console.log('Index idx_sesiones_profesional already exists or error:', e.message);
    }

    // =====================================
    // EJERCICIOS MODULE MIGRATIONS
    // =====================================
    
    // Create ejercicios table
    await query(`
      CREATE TABLE IF NOT EXISTS ejercicios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        descripcion TEXT,
        categoria TEXT,
        zona_corporal TEXT,
        dificultad TEXT DEFAULT 'medio' CHECK (dificultad IN ('facil', 'medio', 'dificil')),
        instrucciones TEXT,
        imagen_url TEXT,
        video_url TEXT,
        activo BOOLEAN DEFAULT true,
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create plan_ejercicios table (many-to-many relationship)
    await query(`
      CREATE TABLE IF NOT EXISTS plan_ejercicios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id UUID NOT NULL,
        ejercicio_id UUID NOT NULL,
        series INTEGER DEFAULT 3,
        repeticiones INTEGER DEFAULT 10,
        notas TEXT,
        creado_en TIMESTAMPTZ DEFAULT NOW(),
        actualizado_en TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_plan_ejercicio_plan FOREIGN KEY (plan_id) 
          REFERENCES planes_tratamiento(id) ON DELETE CASCADE,
        CONSTRAINT fk_plan_ejercicio_ejercicio FOREIGN KEY (ejercicio_id) 
          REFERENCES ejercicios(id) ON DELETE CASCADE,
        CONSTRAINT unique_plan_ejercicio UNIQUE (plan_id, ejercicio_id)
      );
    `);

    // Indexes for ejercicios
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_ejercicios_categoria ON ejercicios(categoria)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_ejercicios_zona ON ejercicios(zona_corporal)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_plan_ejercicios_plan ON plan_ejercicios(plan_id)`);
    } catch (e) {
      console.log('Ejercicios indexes already exist or error:', e.message);
    }

    // Add new states to estado_cita enum if not present
    try {
      await query(`ALTER TYPE estado_cita ADD VALUE IF NOT EXISTS 'no_asistio'`);
      await query(`ALTER TYPE estado_cita ADD VALUE IF NOT EXISTS 'en_progreso'`);
      await query(`ALTER TYPE estado_cita ADD VALUE IF NOT EXISTS 'completada'`);
    } catch (e) {
      // Enum values might already exist
    }

    console.log('✅ Migraciones completadas exitosamente');
  } catch (err) {
    console.error('Migrations error:', err);
    throw err;
  }
};
