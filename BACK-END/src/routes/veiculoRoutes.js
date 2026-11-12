const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/veiculos', verificarToken, veiculoController.listar);
router.post('/veiculos', verificarToken, veiculoController.criar);
router.put('/veiculos/:id', verificarToken, veiculoController.atualizar);
router.delete('/veiculos/:id', verificarToken, veiculoController.deletar);

module.exports = router;