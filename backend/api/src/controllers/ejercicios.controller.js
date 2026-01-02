import { query } from '../config/database.js';

// EJERCICIOS - Biblioteca de ejercicios terapéuticos
// Tabla: ejercicios (id, nombre, descripcion, categoria, zona_corporal, dificultad, instrucciones, imagen_url, video_url, activo, creado_en, actualizado_en)

// Listar ejercicios con filtros
export const listEjercicios = async (req, res) => {
  try {
    const { categoria, zona_corporal, dificultad, q, activo } = req.query;
    const params = [];
    let whereClauses = [];

    if (categoria) {
      params.push(categoria);
      whereClauses.push(`categoria = $${params.length}`);
    }

    if (zona_corporal) {
      params.push(zona_corporal);
      whereClauses.push(`zona_corporal = $${params.length}`);
    }

    if (dificultad) {
      params.push(dificultad);
      whereClauses.push(`dificultad = $${params.length}`);
    }

    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      whereClauses.push(`(LOWER(nombre) LIKE $${params.length} OR LOWER(descripcion) LIKE $${params.length})`);
    }

    if (activo !== undefined) {
      params.push(activo === 'true');
      whereClauses.push(`activo = $${params.length}`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT id, nombre, descripcion, categoria, zona_corporal, dificultad, 
              instrucciones, imagen_url, video_url, activo, creado_en
       FROM ejercicios ${whereSQL}
       ORDER BY categoria, nombre`,
      params
    );

    // Obtener categorías y zonas únicas para filtros
    const { rows: categorias } = await query(
      `SELECT DISTINCT categoria FROM ejercicios WHERE activo = true ORDER BY categoria`
    );
    const { rows: zonas } = await query(
      `SELECT DISTINCT zona_corporal FROM ejercicios WHERE activo = true ORDER BY zona_corporal`
    );

    return res.json({ 
      success: true, 
      data: rows,
      filtros: {
        categorias: categorias.map(c => c.categoria).filter(Boolean),
        zonas_corporales: zonas.map(z => z.zona_corporal).filter(Boolean),
        dificultades: ['facil', 'medio', 'dificil']
      }
    });
  } catch (err) {
    console.error('listEjercicios error', err);
    return res.status(500).json({ success: false, message: 'Error al listar ejercicios' });
  }
};

// Obtener ejercicio por ID
export const getEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await query(
      `SELECT * FROM ejercicios WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getEjercicio error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener ejercicio' });
  }
};

// Crear ejercicio
export const createEjercicio = async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      categoria, 
      zona_corporal, 
      dificultad, 
      instrucciones, 
      imagen_url, 
      video_url 
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'nombre es requerido' });
    }

    // Validar dificultad
    const dificultadesValidas = ['facil', 'medio', 'dificil'];
    if (dificultad && !dificultadesValidas.includes(dificultad)) {
      return res.status(400).json({ 
        success: false, 
        message: `dificultad inválida. Valores permitidos: ${dificultadesValidas.join(', ')}` 
      });
    }

    const { rows } = await query(
      `INSERT INTO ejercicios (nombre, descripcion, categoria, zona_corporal, dificultad, instrucciones, imagen_url, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nombre,
        descripcion || null,
        categoria || null,
        zona_corporal || null,
        dificultad || 'medio',
        instrucciones || null,
        imagen_url || null,
        video_url || null
      ]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createEjercicio error', err);
    return res.status(500).json({ success: false, message: 'Error al crear ejercicio' });
  }
};

// Actualizar ejercicio
export const updateEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      descripcion, 
      categoria, 
      zona_corporal, 
      dificultad, 
      instrucciones, 
      imagen_url, 
      video_url,
      activo 
    } = req.body;

    // Validar dificultad
    const dificultadesValidas = ['facil', 'medio', 'dificil'];
    if (dificultad && !dificultadesValidas.includes(dificultad)) {
      return res.status(400).json({ 
        success: false, 
        message: `dificultad inválida. Valores permitidos: ${dificultadesValidas.join(', ')}` 
      });
    }

    const { rows } = await query(
      `UPDATE ejercicios SET
        nombre = COALESCE($2, nombre),
        descripcion = COALESCE($3, descripcion),
        categoria = COALESCE($4, categoria),
        zona_corporal = COALESCE($5, zona_corporal),
        dificultad = COALESCE($6, dificultad),
        instrucciones = COALESCE($7, instrucciones),
        imagen_url = COALESCE($8, imagen_url),
        video_url = COALESCE($9, video_url),
        activo = COALESCE($10, activo),
        actualizado_en = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, nombre, descripcion, categoria, zona_corporal, dificultad, instrucciones, imagen_url, video_url, activo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateEjercicio error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar ejercicio' });
  }
};

// Eliminar ejercicio (soft delete)
export const deleteEjercicio = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      `UPDATE ejercicios SET activo = false, actualizado_en = NOW()
       WHERE id = $1
       RETURNING id, nombre, activo`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ejercicio no encontrado' });
    }

    return res.json({ success: true, data: rows[0], message: 'Ejercicio desactivado' });
  } catch (err) {
    console.error('deleteEjercicio error', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar ejercicio' });
  }
};

// Asignar ejercicios a un plan de tratamiento
export const asignarEjerciciosAPlan = async (req, res) => {
  try {
    const { plan_id } = req.params;
    const { ejercicios } = req.body; // Array de { ejercicio_id, series, repeticiones, notas }

    if (!Array.isArray(ejercicios) || ejercicios.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ejercicios debe ser un array con al menos un ejercicio' 
      });
    }

    // Verificar que el plan existe
    const planCheck = await query('SELECT id FROM planes_tratamiento WHERE id = $1', [plan_id]);
    if (planCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }

    // Insertar asignaciones
    const asignaciones = [];
    for (const ej of ejercicios) {
      const { rows } = await query(
        `INSERT INTO plan_ejercicios (plan_id, ejercicio_id, series, repeticiones, notas)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (plan_id, ejercicio_id) 
         DO UPDATE SET series = $3, repeticiones = $4, notas = $5, actualizado_en = NOW()
         RETURNING *`,
        [plan_id, ej.ejercicio_id, ej.series || 3, ej.repeticiones || 10, ej.notas || null]
      );
      asignaciones.push(rows[0]);
    }

    return res.status(201).json({ 
      success: true, 
      data: asignaciones,
      message: `${asignaciones.length} ejercicios asignados al plan`
    });
  } catch (err) {
    console.error('asignarEjerciciosAPlan error', err);
    return res.status(500).json({ success: false, message: 'Error al asignar ejercicios' });
  }
};

// Obtener ejercicios de un plan
export const getEjerciciosDePlan = async (req, res) => {
  try {
    const { plan_id } = req.params;

    const { rows } = await query(
      `SELECT pe.*, e.nombre, e.descripcion, e.categoria, e.zona_corporal, 
              e.dificultad, e.instrucciones, e.imagen_url, e.video_url
       FROM plan_ejercicios pe
       JOIN ejercicios e ON pe.ejercicio_id = e.id
       WHERE pe.plan_id = $1 AND e.activo = true
       ORDER BY e.categoria, e.nombre`,
      [plan_id]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getEjerciciosDePlan error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener ejercicios del plan' });
  }
};
