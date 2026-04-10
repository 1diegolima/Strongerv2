const { Pool } = require('pg');

// In Vercel, env vars are injected directly — dotenv not needed in production
// but safe to call since it silently fails if no .env file exists
try { require('dotenv').config(); } catch (_) {}

let pool;

if (process.env.DATABASE_URL) {
  // Cloud DB (Neon, Supabase, Render, Railway, etc.) via connection string
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Local development with individual credentials
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'app_treino',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: false,
  });
}

// Test connection (non-blocking — won't crash the app if DB is unavailable)
pool.connect()
  .then((client) => {
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
  });

module.exports = pool;
