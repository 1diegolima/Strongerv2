const { Router } = require('express');
const treinosController = require('../controllers/treinos.controller');

const router = Router();

router.get('/exercicios', treinosController.getExercicios);
router.get('/', treinosController.getTreinos);
router.get('/:id', treinosController.getTreinoById);
router.post('/', treinosController.createTreino);
router.post('/:id/exercicios', treinosController.addExercicio);
router.put('/:id/exercicios/reorder', treinosController.reorderExercicios);
router.delete('/:id/exercicios/:exercicio_id', treinosController.removeExercicio);
router.put('/:id/exercicios/:exercicio_id', treinosController.updateExercicio);
router.put('/:id', treinosController.updateTreino);
router.delete('/:id', treinosController.deleteTreino);

module.exports = router;
