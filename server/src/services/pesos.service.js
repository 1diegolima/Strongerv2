const db = require('../config/database');

const USUARIO_ID = 1;

const pesosService = {
  /**
   * Lista todo o histórico de peso ordenado por data
   */
  async getPesos() {
    const result = await db.query(
      `SELECT * FROM historico_peso 
       WHERE usuario_id = $1 
       ORDER BY data_registro ASC`,
      [USUARIO_ID]
    );
    return result.rows;
  },

  /**
   * Adiciona novo registro de peso
   */
  async addPeso({ peso_kg, observacao, data_registro }) {
    const result = await db.query(
      `INSERT INTO historico_peso (usuario_id, peso_kg, observacao, data_registro)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [USUARIO_ID, peso_kg, observacao || null, data_registro || new Date().toISOString().split('T')[0]]
    );
    return result.rows[0];
  },

  /**
   * Remove um registro de peso
   */
  async deletePeso(id) {
    const result = await db.query(
      'DELETE FROM historico_peso WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, USUARIO_ID]
    );
    return result.rows[0];
  },
};

module.exports = pesosService;
