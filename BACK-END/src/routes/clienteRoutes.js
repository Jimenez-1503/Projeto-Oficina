
const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/clientes', verificarToken, clienteController.listar);
router.post('/clientes', verificarToken, clienteController.criar);
router.put('/clientes/:id', verificarToken, clienteController.atualizar);
router.delete('/clientes/:id', verificarToken, clienteController.deletar);

module.exports = router;
