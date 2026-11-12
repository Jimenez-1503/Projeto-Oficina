const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/agendamentos', verificarToken, agendamentoController.listar);
router.post('/agendamentos', verificarToken, agendamentoController.criar);
router.put('/agendamentos/:id', verificarToken, agendamentoController.atualizarData);
router.delete('/agendamentos/:id', verificarToken, agendamentoController.deletar);

module.exports = router;