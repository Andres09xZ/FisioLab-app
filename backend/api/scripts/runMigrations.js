/**
 * Script para ejecutar migraciones de base de datos
 * Ejecutar: node scripts/runMigrations.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando migraciones...\n');

    // 1. Verificar extensión pgcrypto
    console.log('📦 Verificando extensión pgcrypto...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('✅ Extensión pgcrypto disponible\n');

    // 2. Crear tabla de control de migraciones
    console.log('📋 Creando tabla de control de migraciones...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS migraciones (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        ejecutado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        descripcion TEXT
      );
    `);
    console.log('✅ Tabla de migraciones lista\n');

    // 3. Verificar si la migración ya fue ejecutada
    const migrationName = '003_arquitectura_v2_nuevas_tablas.sql';
    const checkResult = await client.query(
      'SELECT * FROM migraciones WHERE nombre = $1',
      [migrationName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`⚠️  Migración ${migrationName} ya fue ejecutada en: ${checkResult.rows[0].ejecutado_en}`);
      console.log('   Saltando ejecución...\n');
      return;
    }

    // 4. Leer archivo de migración
    console.log(`📄 Leyendo migración: ${migrationName}...`);
    const migrationPath = join(__dirname, '../../dbService', migrationName);
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log(`   Tamaño: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

    // 5. Ejecutar migración en transacción
    console.log('🚀 Ejecutando migración...');
    await client.query('BEGIN');

    try {
      await client.query(migrationSQL);

      // Registrar migración exitosa
      await client.query(
        `INSERT INTO migraciones (nombre, descripcion) 
         VALUES ($1, $2)`,
        [
          migrationName,
          'Arquitectura V2: evaluaciones_v2, planes_v2, sesiones_v2, logs_actividad'
        ]
      );

      await client.query('COMMIT');
      console.log('✅ Migración ejecutada exitosamente\n');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    // 6. Verificar tablas creadas
    console.log('🔍 Verificando estructura de base de datos...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tablas creadas:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // 7. Verificar vistas
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n👁️  Vistas creadas:');
    viewsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // 8. Verificar triggers
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name;
    `);

    if (triggersResult.rows.length > 0) {
      console.log('\n⚡ Triggers creados:');
      triggersResult.rows.forEach(row => {
        console.log(`   ✓ ${row.trigger_name} en ${row.event_object_table}`);
      });
    }

    console.log('\n✨ ¡Migración completada con éxito!\n');

  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migraciones
runMigrations();
