const treinosService = require('../services/treinos.service');

const treinosController = {
  async getTreinos(req, res) {
    try {
      const treinos = await treinosService.getTreinos();
      res.json(treinos);
    } catch (err) {
      console.error('Erro ao buscar treinos:', err);
      res.status(500).json({ error: 'Erro interno ao buscar treinos' });
    }
  },

  async getTreinoById(req, res) {
    try {
      const { id } = req.params;
      const treino = await treinosService.getTreinoById(id);

      if (!treino) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      res.json(treino);
    } catch (err) {
      console.error('Erro ao buscar treino:', err);
      res.status(500).json({ error: 'Erro interno ao buscar treino' });
    }
  },

  async createTreino(req, res) {
    try {
      const { nome, dia_semana, observacoes } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'O campo nome é obrigatório' });
      }

      const treino = await treinosService.createTreino({ nome, dia_semana, observacoes });
      res.status(201).json(treino);
    } catch (err) {
      console.error('Erro ao criar treino:', err);
      res.status(500).json({ error: 'Erro interno ao criar treino' });
    }
  },

  async updateTreino(req, res) {
    try {
      const { id } = req.params;
      const { nome, dia_semana, observacoes } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'O campo nome é obrigatório' });
      }

      const treino = await treinosService.updateTreino(id, { nome, dia_semana, observacoes });

      if (!treino) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      res.json(treino);
    } catch (err) {
      console.error('Erro ao atualizar treino:', err);
      res.status(500).json({ error: 'Erro interno ao atualizar treino' });
    }
  },

  async deleteTreino(req, res) {
    try {
      const { id } = req.params;
      const deleted = await treinosService.deleteTreino(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      res.json({ message: 'Treino removido com sucesso', id });
    } catch (err) {
      console.error('Erro ao remover treino:', err);
      res.status(500).json({ error: 'Erro interno ao remover treino' });
    }
  },

  async getExercicios(req, res) {
    try {
      const exercicios = await treinosService.getExercicios();
      res.json(exercicios);
    } catch (err) {
      console.error('Erro ao buscar exercícios:', err);
      res.status(500).json({ error: 'Erro interno ao buscar exercícios' });
    }
  },

  async addExercicio(req, res) {
    try {
      const { id } = req.params;
      const { exercicioId, seriesPlanejadas } = req.body;

      if (!exercicioId || !seriesPlanejadas) {
        return res.status(400).json({ error: 'exercicioId e seriesPlanejadas são obrigatórios' });
      }

      const novoTreinoExercicio = await treinosService.addExercicioAoTreino(id, exercicioId, seriesPlanejadas);
      res.status(201).json(novoTreinoExercicio);
    } catch (err) {
      console.error('Erro ao adicionar exercício:', err);
      res.status(500).json({ error: 'Erro interno ao adicionar exercício ao treino' });
    }
  },
  async removeExercicio(req, res) {
    try {
      const { id, exercicio_id } = req.params;
      const deleted = await treinosService.removeExercicioDoTreino(id, exercicio_id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Exercício não encontrado no treino' });
      }

      res.json({ message: 'Exercício removido do treino com sucesso' });
    } catch (err) {
      console.error('Erro ao remover exercício:', err);
      res.status(500).json({ error: 'Erro interno ao remover exercício' });
    }
  },

  async updateExercicio(req, res) {
    try {
      const { id, exercicio_id } = req.params;
      const { seriesPlanejadas, exercicioId: novoExercicioId } = req.body;

      if (!seriesPlanejadas) {
        return res.status(400).json({ error: 'Séries planejadas são obrigatórias' });
      }

      const atualizado = await treinosService.updateExercicioDoTreino(
        id, 
        exercicio_id, 
        seriesPlanejadas, 
        novoExercicioId
      );
      res.json(atualizado);
    } catch (err) {
      console.error('Erro ao atualizar exercício:', err);
      res.status(500).json({ error: 'Erro interno ao atualizar exercício' });
    }
  },

  async reorderExercicios(req, res) {
    try {
      const { id } = req.params;
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items inválidos para reordenação' });
      }

      await treinosService.reorderExercicios(id, items);
      res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao reordenar exercícios:', err);
      res.status(500).json({ error: 'Erro interno ao reordenar exercícios' });
    }
  },
};

module.exports = treinosController;
