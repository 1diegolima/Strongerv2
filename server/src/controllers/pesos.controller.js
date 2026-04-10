const pesosService = require('../services/pesos.service');
const perfilService = require('../services/perfil.service');

const pesosController = {
  async getPesos(req, res) {
    try {
      const pesos = await pesosService.getPesos();
      res.json(pesos);
    } catch (err) {
      console.error('Erro ao buscar histórico de peso:', err);
      res.status(500).json({ error: 'Erro interno ao buscar histórico de peso' });
    }
  },

  async addPeso(req, res) {
    try {
      const { peso_kg, observacao, data_registro } = req.body;

      if (!peso_kg || isNaN(parseFloat(peso_kg))) {
        return res.status(400).json({ error: 'Peso inválido' });
      }

      const novoPeso = await pesosService.addPeso({ peso_kg: parseFloat(peso_kg), observacao, data_registro });

      // Atualiza peso atual no perfil
      await perfilService.updatePesoAtual(parseFloat(peso_kg));

      res.status(201).json(novoPeso);
    } catch (err) {
      console.error('Erro ao adicionar peso:', err);
      res.status(500).json({ error: 'Erro interno ao adicionar peso' });
    }
  },

  async deletePeso(req, res) {
    try {
      const { id } = req.params;
      const deleted = await pesosService.deletePeso(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }

      res.json({ message: 'Registro removido com sucesso', id });
    } catch (err) {
      console.error('Erro ao remover peso:', err);
      res.status(500).json({ error: 'Erro interno ao remover peso' });
    }
  },
};

module.exports = pesosController;
