const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/login', usuarioController.login);
router.post('/usuarios', usuarioController.cadastrar);

// Rotas protegidas por JWT
router.get('/usuarios', verificarToken, usuarioController.listar);
router.get('/usuarios/:id', verificarToken, usuarioController.buscarPorId);
router.put('/usuarios/:id', verificarToken, usuarioController.atualizar);
router.delete('/usuarios/:id', verificarToken, usuarioController.deletar);

module.exports = router;