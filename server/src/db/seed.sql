-- ============================================================
-- Stronger App — Seed SQL
-- Dados iniciais para o banco app_treino
-- ============================================================

-- Usuário padrão (single-user por enquanto)
INSERT INTO usuarios (id, email) VALUES (1, 'usuario@strongerapp.com')
ON CONFLICT DO NOTHING;

-- Resetar sequência
SELECT setval('usuarios_id_seq', 1, true);

-- Perfil padrão (Zereado para acionar o Onboarding)
INSERT INTO perfil (usuario_id, nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual)
VALUES (1, '', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Exercícios padrão globais (Mantenha para poder montar o treino)
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
  (14, 'Elevação Lateral',   'Ombros')
ON CONFLICT DO NOTHING;

SELECT setval('exercicios_id_seq', 20, true);

-- FIM (Nenhum histórico, treino ou meta inicial)
