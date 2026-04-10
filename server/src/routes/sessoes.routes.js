const { Router } = require('express');
const sessoesController = require('../controllers/sessoes.controller');

const router = Router();

router.get('/', sessoesController.getSessoes);
router.post('/', sessoesController.createSessao);

module.exports = router;
