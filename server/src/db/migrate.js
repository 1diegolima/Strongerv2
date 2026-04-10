/**
 * Script para criar o banco de dados app_treino se não existir
 * e em seguida rodar as migrações.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
// Load .env from server/ root (two levels up from src/db/)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function createDatabaseAndMigrate() {
  // Primeiro conecta no banco default "postgres" para criar app_treino
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔍 Verificando banco de dados app_treino...');
    const check = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'app_treino'"
    );
    if (check.rows.length === 0) {
      await adminPool.query('CREATE DATABASE app_treino');
      console.log('✅ Banco app_treino criado!');
    } else {
      console.log('ℹ️  Banco app_treino já existe.');
    }
  } catch (err) {
    console.error('❌ Erro ao criar banco:', err.message);
  } finally {
    await adminPool.end();
  }

  // Agora conecta no app_treino para rodar o schema e seed
  const appPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'app_treino',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  const client = await appPool.connect();
  try {
    console.log('\n🚀 Iniciando migração...');
    
    // Limpar o banco antes de recriar
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSQL);
    console.log('✅ Schema criado!');

    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await client.query(seedSQL);
    console.log('✅ Dados iniciais inseridos!');

    console.log('\n🎉 Tudo pronto! Banco configurado com sucesso.');
  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
  } finally {
    client.release();
    await appPool.end();
  }
}

createDatabaseAndMigrate();
