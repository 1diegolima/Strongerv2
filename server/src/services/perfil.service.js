const db = require('../config/database');

const USUARIO_ID = 1; // Single-user por enquanto (escalável para multi-user com JWT)

const perfilService = {
  /**
   * Busca o perfil do usuário padrão
   */
  async getPerfil() {
    const result = await db.query(
      'SELECT * FROM perfil WHERE usuario_id = $1 LIMIT 1',
      [USUARIO_ID]
    );
    return result.rows[0] || null;
  },

  /**
   * Cria ou atualiza o perfil (upsert)
   */
  async savePerfil({ nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual }) {
    const existing = await this.getPerfil();

    if (existing) {
      const result = await db.query(
        `UPDATE perfil 
         SET nome = $1, data_nascimento = $2, altura_cm = $3, sexo = $4, 
             objetivo = $5, peso_atual = $6, atualizado_em = NOW()
         WHERE usuario_id = $7
         RETURNING *`,
        [nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual, USUARIO_ID]
      );
      return result.rows[0];
    } else {
      const result = await db.query(
        `INSERT INTO perfil (usuario_id, nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [USUARIO_ID, nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual]
      );
      return result.rows[0];
    }
  },

  /**
   * Atualiza apenas o peso atual no perfil
   */
  async updatePesoAtual(pesoKg) {
    const result = await db.query(
      `UPDATE perfil SET peso_atual = $1, atualizado_em = NOW() 
       WHERE usuario_id = $2 RETURNING *`,
      [pesoKg, USUARIO_ID]
    );
    return result.rows[0];
  },
};

module.exports = perfilService;
