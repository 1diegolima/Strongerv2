-- ============================================================
-- Stronger App — Schema SQL Inicial
-- Banco: app_treino
-- ============================================================

-- Habilitar extensão para UUIDs (opcional, usando SERIAL por padrão)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------
-- Tabela Base: usuarios
-- Preparada para múltiplos usuários futuramente
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Perfil do usuário
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS perfil (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL DEFAULT 'Usuário',
  data_nascimento DATE,
  altura_cm INTEGER,
  sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
  objetivo VARCHAR(255) DEFAULT 'Hipertrofia',
  peso_atual DECIMAL(5,2),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Histórico de Peso
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS historico_peso (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Exercícios (biblioteca global)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS exercicios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  grupo_muscular VARCHAR(100),
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Treinos
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS treinos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Exercícios de cada Treino (planejamento)
-- series_planejadas: JSONB com array de séries
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS treino_exercicios (
  id SERIAL PRIMARY KEY,
  treino_id INTEGER REFERENCES treinos(id) ON DELETE CASCADE,
  exercicio_id INTEGER REFERENCES exercicios(id) ON DELETE SET NULL,
  ordem INTEGER DEFAULT 1,
  series_planejadas JSONB DEFAULT '[]',
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Sessões de Treino Executadas
-- exercicios_executados: JSONB com dados completos da sessão
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS sessoes_treino (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  treino_id INTEGER REFERENCES treinos(id) ON DELETE SET NULL,
  data_sessao DATE NOT NULL DEFAULT CURRENT_DATE,
  exercicios_executados JSONB DEFAULT '[]',
  completo BOOLEAN DEFAULT false,
  duracao_minutos INTEGER,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Metas do usuário
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS metas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('peso', 'carga')),
  valor_alvo DECIMAL(8,2) NOT NULL,
  exercicio_id INTEGER REFERENCES exercicios(id) ON DELETE SET NULL,
  prazo DATE,
  atingida BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------
-- Índices para performance
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_historico_peso_usuario ON historico_peso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_peso_data ON historico_peso(data_registro);
CREATE INDEX IF NOT EXISTS idx_treinos_usuario ON treinos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes_treino(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data ON sessoes_treino(data_sessao);
CREATE INDEX IF NOT EXISTS idx_treino_exercicios_treino ON treino_exercicios(treino_id);
