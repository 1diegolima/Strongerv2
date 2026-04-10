const db = require('../config/database');

const USUARIO_ID = 1;

const sessoesService = {
  /**
   * Lista todas as sessões de treino ordenadas por data decrescente
   */
  async getSessoes() {
    const result = await db.query(
      `SELECT s.*, t.nome AS treino_nome
       FROM sessoes_treino s
       LEFT JOIN treinos t ON t.id = s.treino_id
       WHERE s.usuario_id = $1
       ORDER BY s.data_sessao DESC, s.criado_em DESC`,
      [USUARIO_ID]
    );
    return result.rows;
  },

  /**
   * Busca sessões da última semana
   */
  async getSessoesRecentes(dias = 7) {
    const result = await db.query(
      `SELECT s.*, t.nome AS treino_nome
       FROM sessoes_treino s
       LEFT JOIN treinos t ON t.id = s.treino_id
       WHERE s.usuario_id = $1 AND s.data_sessao >= CURRENT_DATE - $2
       ORDER BY s.data_sessao DESC`,
      [USUARIO_ID, dias]
    );
    return result.rows;
  },

  /**
   * Cria nova sessão de treino
   */
  async createSessao({ treino_id, data_sessao, exercicios_executados, completo, duracao_minutos }) {
    const result = await db.query(
      `INSERT INTO sessoes_treino 
        (usuario_id, treino_id, data_sessao, exercicios_executados, completo, duracao_minutos)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        USUARIO_ID,
        treino_id || null,
        data_sessao || new Date().toISOString().split('T')[0],
        JSON.stringify(exercicios_executados || []),
        completo || false,
        duracao_minutos || null,
      ]
    );
    return result.rows[0];
  },
};

module.exports = sessoesService;
