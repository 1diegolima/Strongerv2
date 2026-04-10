const perfilService = require('../services/perfil.service');

const perfilController = {
  async getPerfil(req, res) {
    try {
      const perfil = await perfilService.getPerfil();
      if (!perfil) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }
      res.json(perfil);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      res.status(500).json({ error: 'Erro interno ao buscar perfil' });
    }
  },

  async savePerfil(req, res) {
    try {
      const { nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'O campo nome é obrigatório' });
      }

      const perfil = await perfilService.savePerfil({
        nome,
        data_nascimento,
        altura_cm,
        sexo,
        objetivo,
        peso_atual,
      });

      res.status(201).json(perfil);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      res.status(500).json({ error: 'Erro interno ao salvar perfil' });
    }
  },

  async updatePerfil(req, res) {
    try {
      const { nome, data_nascimento, altura_cm, sexo, objetivo, peso_atual } = req.body;

      const perfil = await perfilService.savePerfil({
        nome,
        data_nascimento,
        altura_cm,
        sexo,
        objetivo,
        peso_atual,
      });

      res.json(perfil);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      res.status(500).json({ error: 'Erro interno ao atualizar perfil' });
    }
  },
};

module.exports = perfilController;
