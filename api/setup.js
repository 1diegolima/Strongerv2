// ONE-TIME setup endpoint — run schema migrations and seed on the remote DB
// Access: POST /api/setup?secret=<SETUP_SECRET>
// Delete this file after running migrations in production!

const db = require('../server/src/config/database');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfil (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL DEFAULT '',
  data_nascimento DATE,
  altura_cm INTEGER,
  sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
  objetivo VARCHAR(255) DEFAULT 'Hipertrofia',
  peso_atual DECIMAL(5,2),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historico_peso (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  peso_kg DECIMAL(5,2) NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercicios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  grupo_muscular VARCHAR(100),
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treinos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treino_exercicios (
  id SERIAL PRIMARY KEY,
  treino_id INTEGER REFERENCES treinos(id) ON DELETE CASCADE,
  exercicio_id INTEGER REFERENCES exercicios(id) ON DELETE SET NULL,
  ordem INTEGER DEFAULT 1,
  series_planejadas JSONB DEFAULT '[]',
  criado_em TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_historico_peso_usuario ON historico_peso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_treinos_usuario ON treinos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes_treino(usuario_id);
CREATE INDEX IF NOT EXISTS idx_treino_exercicios_treino ON treino_exercicios(treino_id);
`;

const SEED_SQL = `
INSERT INTO usuarios (id, email) VALUES (1, 'usuario@strongerapp.com') ON CONFLICT DO NOTHING;

INSERT INTO perfil (usuario_id, nome) VALUES (1, '') ON CONFLICT DO NOTHING;

INSERT INTO exercicios (id, nome, grupo_muscular) VALUES
  (1,  'Supino Reto',        'Peito'),
  (2,  'Supino Inclinado',   'Peito'),
  (3,  'Crucifixo',          'Peito'),
  (4,  'Puxada Frontal',     'Costas'),
  (5,  'Remada Curvada',     'Costas'),
  (6,  'Remada Sentada',     'Costas'),
  (7,  'Agachamento',        'Pernas'),
  (8,  'Leg Press',          'Pernas'),
  (9,  'Cadeira Extensora',  'Pernas'),
  (10, 'Rosca Direta',       'Bíceps'),
  (11, 'Rosca Martelo',      'Bíceps'),
  (12, 'Tríceps Testa',      'Tríceps'),
  (13, 'Desenvolvimento',    'Ombros'),
  (14, 'Elevação Lateral',   'Ombros'),
  (15, 'Panturrilha em Pé',  'Pernas'),
  (16, 'Abdominal Crunch',   'Core'),
  (17, 'Barra Fixa',         'Costas'),
  (18, 'Mergulho',           'Peito')
ON CONFLICT DO NOTHING;

SELECT setval('exercicios_id_seq', 20, true);
SELECT setval('usuarios_id_seq', 1, true);
`;

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Secret protection
  const secret = req.query.secret || req.body?.secret;
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Provide ?secret=<SETUP_SECRET>' });
  }

  try {
    console.log('Running schema migrations...');
    await db.query(SCHEMA_SQL);
    console.log('Schema done. Running seed...');
    await db.query(SEED_SQL);
    console.log('Seed done.');
    res.json({ success: true, message: 'Database initialized successfully!' });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ error: err.message });
  }
};
