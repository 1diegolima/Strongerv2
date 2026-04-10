const { Router } = require('express');
const pesosController = require('../controllers/pesos.controller');

const router = Router();

router.get('/', pesosController.getPesos);
router.post('/', pesosController.addPeso);
router.delete('/:id', pesosController.deletePeso);

module.exports = router;
