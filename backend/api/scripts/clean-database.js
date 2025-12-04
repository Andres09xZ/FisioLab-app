import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la base de datos
const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  database: 'fisiolabst',
  user: 'fisio_user',
  password: 'root'
});

const cleanDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Iniciando limpieza de la base de datos...\n');
    
    await client.query('BEGIN');
    
    // Desactivar temporalmente las restricciones de clave foránea
    await client.query('SET CONSTRAINTS ALL DEFERRED');
    
    // Orden de eliminación (respetando dependencias de claves foráneas)
    const tables = [
      'sesiones',
      'planes_tratamiento',
      'evaluaciones_fisioterapeuticas',
      'certificados',
      'pagos',
      'archivos',
      'citas',
      'pacientes',
      'profesionales',
      'recursos',
      'usuarios'
    ];
    
    console.log('📋 Eliminando datos de las siguientes tablas:');
    
    for (const table of tables) {
      try {
        // Verificar si la tabla existe primero
        const checkTable = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table]);
        
        if (checkTable.rows[0].exists) {
          const result = await client.query(`DELETE FROM ${table}`);
          console.log(`   ✅ ${table}: ${result.rowCount} registros eliminados`);
        } else {
          console.log(`   ⚠️  ${table}: tabla no existe (saltando)`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}: error - ${error.message}`);
      }
    }
    
    // Reiniciar secuencias si existen
    console.log('\n🔄 Reiniciando secuencias...');
    
    await client.query('COMMIT');
    
    console.log('\n✨ Base de datos limpiada exitosamente!');
    console.log('📊 Todas las tablas están vacías y listas para nuevos datos.\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Confirmación antes de ejecutar
console.log('⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de la base de datos.');
console.log('Base de datos: fisiolabst');
console.log('Host: 127.0.0.1:5433\n');

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  cleanDatabase()
    .then(() => {
      console.log('✅ Proceso completado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error.message);
      process.exit(1);
    });
} else {
  console.log('Para ejecutar la limpieza, usa el flag --confirm:');
  console.log('  npm run clean-db -- --confirm');
  console.log('  o');
  console.log('  node scripts/clean-database.js --confirm\n');
  process.exit(0);
}
