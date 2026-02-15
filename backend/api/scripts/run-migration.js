/**
 * Script para ejecutar migración de recetas médicas
 * Usa las credenciales del .env automáticamente
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

// Crear pool de conexión
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de recetas médicas...\n');
    console.log(`📊 Conectando a: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`);
    console.log(`👤 Usuario: ${process.env.POSTGRES_USER}\n`);

    // Leer archivo de migración
    const migrationPath = join(__dirname, '../../dbService/migration-recetas-medicas.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Ejecutando migración...\n');

    // Ejecutar migración
    await client.query(migrationSQL);

    console.log('✅ Migración ejecutada exitosamente!\n');

    // Verificar que la tabla fue creada
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recetas_medicas'
      ORDER BY ordinal_position
      LIMIT 5
    `);

    console.log('📋 Tabla recetas_medicas creada con las siguientes columnas (primeras 5):');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    // Contar índices
    const indexResult = await client.query(`
      SELECT COUNT(*) as total
      FROM pg_indexes
      WHERE tablename = 'recetas_medicas'
    `);

    console.log(`\n🔍 Total de índices creados: ${indexResult.rows[0].total}`);

    console.log('\n🎉 ¡Migración completada exitosamente!\n');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error('\nDetalles del error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
runMigration();
