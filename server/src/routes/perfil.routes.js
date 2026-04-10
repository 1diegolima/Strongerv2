const { Router } = require('express');
const perfilController = require('../controllers/perfil.controller');

const router = Router();

router.get('/', perfilController.getPerfil);
router.post('/', perfilController.savePerfil);
router.put('/:id', perfilController.updatePerfil);

module.exports = router;
