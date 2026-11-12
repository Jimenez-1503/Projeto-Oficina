const usuarioService = require('../services/usuarioService');

class UsuarioController {
  async cadastrar(req, res) {
    try {
      const novoUsuario = await usuarioService.cadastrar(req.body);
      return res.status(201).json(novoUsuario);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async login(req, res) {
    try {
      const resultado = await usuarioService.login(req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(401).json({ erro: error.message });
    }
  }

  async listar(req, res) {
    try {
      const usuarios = await usuarioService.listarTodos();
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno ao buscar usuários.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const usuario = await usuarioService.buscarPorId(req.params.id);
      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const usuarioAtualizado = await usuarioService.atualizar(req.params.id, req.body);
      return res.status(200).json(usuarioAtualizado);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async deletar(req, res) {
    try {
      await usuarioService.deletar(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }
}

module.exports = new UsuarioController();