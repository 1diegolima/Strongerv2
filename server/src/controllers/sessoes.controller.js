const sessoesService = require('../services/sessoes.service');

const sessoesController = {
  async getSessoes(req, res) {
    try {
      const sessoes = await sessoesService.getSessoes();
      res.json(sessoes);
    } catch (err) {
      console.error('Erro ao buscar sessões:', err);
      res.status(500).json({ error: 'Erro interno ao buscar sessões' });
    }
  },

  async createSessao(req, res) {
    try {
      const { treino_id, data_sessao, exercicios_executados, completo, duracao_minutos } = req.body;

      const sessao = await sessoesService.createSessao({
        treino_id,
        data_sessao,
        exercicios_executados,
        completo,
        duracao_minutos,
      });

      res.status(201).json(sessao);
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
      res.status(500).json({ error: 'Erro interno ao criar sessão' });
    }
  },
};

module.exports = sessoesController;
