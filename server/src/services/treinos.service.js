const db = require('../config/database');

const USUARIO_ID = 1;

const treinosService = {
  /**
   * Lista todos os treinos com seus exercícios
   */
  async getTreinos() {
    // Busca treinos
    const treinosResult = await db.query(
      `SELECT t.*, 
        json_agg(
          json_build_object(
            'id', te.id,
            'exercicioId', te.exercicio_id,
            'exercicioNome', e.nome,
            'grupoMuscular', e.grupo_muscular,
            'ordem', te.ordem,
            'seriesPlanejadas', te.series_planejadas
          ) ORDER BY te.ordem
        ) FILTER (WHERE te.id IS NOT NULL) AS exercicios
       FROM treinos t
       LEFT JOIN treino_exercicios te ON te.treino_id = t.id
       LEFT JOIN exercicios e ON e.id = te.exercicio_id
       WHERE t.usuario_id = $1
       GROUP BY t.id
       ORDER BY t.dia_semana`,
      [USUARIO_ID]
    );
    return treinosResult.rows;
  },

  /**
   * Busca um treino específico por ID
   */
  async getTreinoById(id) {
    const result = await db.query(
      `SELECT t.*, 
        json_agg(
          json_build_object(
            'id', te.id,
            'exercicioId', te.exercicio_id,
            'exercicioNome', e.nome,
            'grupoMuscular', e.grupo_muscular,
            'ordem', te.ordem,
            'seriesPlanejadas', te.series_planejadas
          ) ORDER BY te.ordem
        ) FILTER (WHERE te.id IS NOT NULL) AS exercicios
       FROM treinos t
       LEFT JOIN treino_exercicios te ON te.treino_id = t.id
       LEFT JOIN exercicios e ON e.id = te.exercicio_id
       WHERE t.id = $1 AND t.usuario_id = $2
       GROUP BY t.id`,
      [id, USUARIO_ID]
    );
    return result.rows[0] || null;
  },

  /**
   * Cria um novo treino
   */
  async createTreino({ nome, dia_semana, observacoes }) {
    const result = await db.query(
      `INSERT INTO treinos (usuario_id, nome, dia_semana, observacoes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [USUARIO_ID, nome, dia_semana, observacoes || null]
    );
    return result.rows[0];
  },

  /**
   * Atualiza um treino existente
   */
  async updateTreino(id, { nome, dia_semana, observacoes }) {
    const result = await db.query(
      `UPDATE treinos SET nome = $1, dia_semana = $2, observacoes = $3, atualizado_em = NOW()
       WHERE id = $4 AND usuario_id = $5
       RETURNING *`,
      [nome, dia_semana, observacoes || null, id, USUARIO_ID]
    );
    return result.rows[0];
  },

  /**
   * Remove um treino
   */
  async deleteTreino(id) {
    const result = await db.query(
      'DELETE FROM treinos WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, USUARIO_ID]
    );
    return result.rows[0];
  },

  /**
   * Lista todos os exercícios disponíveis
   */
  async getExercicios() {
    const result = await db.query(
      'SELECT * FROM exercicios ORDER BY grupo_muscular, nome'
    );
    return result.rows;
  },

  /**
   * Adiciona um exercício a um treino existente
   */
  async addExercicioAoTreino(treinoId, exercicioId, seriesPlanejadas) {
    const ordemResult = await db.query(
      'SELECT COALESCE(MAX(ordem), 0) + 1 as proxima_ordem FROM treino_exercicios WHERE treino_id = $1',
      [treinoId]
    );
    const ordem = ordemResult.rows[0].proxima_ordem;

    const result = await db.query(
      `INSERT INTO treino_exercicios (treino_id, exercicio_id, ordem, series_planejadas)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [treinoId, exercicioId, ordem, JSON.stringify(seriesPlanejadas)]
    );
    return result.rows[0];
  },
  /**
   * Remove um exercício de um treino
   */
  async removeExercicioDoTreino(treinoId, treinoExercicioId) {
    const result = await db.query(
      'DELETE FROM treino_exercicios WHERE id = $1 AND treino_id = $2 RETURNING *',
      [treinoExercicioId, treinoId]
    );
    return result.rows[0];
  },

  /**
   * Atualiza as séries planejadas de um exercício no treino e qual é o exercício
   */
  async updateExercicioDoTreino(treinoId, treinoExercicioId, seriesPlanejadas, novoExercicioId) {
    if (novoExercicioId) {
      const result = await db.query(
        `UPDATE treino_exercicios SET exercicio_id = $1, series_planejadas = $2 WHERE id = $3 AND treino_id = $4 RETURNING *`,
        [novoExercicioId, JSON.stringify(seriesPlanejadas), treinoExercicioId, treinoId]
      );
      return result.rows[0];
    } else {
      const result = await db.query(
        `UPDATE treino_exercicios SET series_planejadas = $1 WHERE id = $2 AND treino_id = $3 RETURNING *`,
        [JSON.stringify(seriesPlanejadas), treinoExercicioId, treinoId]
      );
      return result.rows[0];
    }
  },

  /**
   * Reordena os exercícios de um treino em lote
   */
  async reorderExercicios(treinoId, items) {
    // items é um array [{ id: number, ordem: number }]
    for (const item of items) {
      await db.query(
        'UPDATE treino_exercicios SET ordem = $1 WHERE id = $2 AND treino_id = $3',
        [item.ordem, item.id, treinoId]
      );
    }
    return true;
  },
};

module.exports = treinosService;
