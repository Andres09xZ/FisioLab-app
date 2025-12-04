import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'fisio_user'}:${process.env.POSTGRES_PASSWORD || 'fisio_pass_2025'}@${process.env.POSTGRES_HOST || '127.0.0.1'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'fisiolabst'}`,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Evento de error
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

// Función helper para queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    console.error('DB URL usada:', (process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`));
    throw error;
  }
};

// Función para obtener un cliente del pool (para transacciones)
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Timeout de 5 segundos
  const timeout = setTimeout(() => {
    console.error('Cliente ha estado en uso por más de 5 segundos!');
  }, 5000);

  // Monkey patch para limpiar el timeout
  client.query = (...args) => {
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as now, current_database() as database');
    console.log('✅ Conexión a PostgreSQL exitosa');
    console.log(`📊 Base de datos: ${result.rows[0].database}`);
    console.log(`⏰ Hora del servidor: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    return false;
  }
};

export default pool;
