const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');

const SECRET_KEY = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

class UsuarioService {
  async cadastrar({ nome, email, senha }) {
    if (!nome || !email || !senha) {
      throw Object.assign(new Error('Nome, e-mail e senha são obrigatórios.'), { status: 400 });
    }

    const usuarioExistente = await usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      throw Object.assign(new Error('Este e-mail já está cadastrado.'), { status: 409 });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    return await usuarioRepository.create({ nome, email, senha: senhaHash });
  }

  async login({ email, senha }) {
    if (!email || !senha) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const token = jwt.sign(
      { email: usuario.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    return {
      token,
      nome: usuario.nome
    };
  }

  async listarTodos() {
    return await usuarioRepository.findAll();
  }

  async buscarPorId(id) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }
    return usuario;
  }

  async atualizar(id, { nome, email }) {
    await this.buscarPorId(id);
    return await usuarioRepository.update(id, { nome, email });
  }

  async deletar(id) {
    const deletado = await usuarioRepository.delete(id);
    if (!deletado) {
      throw new Error('Usuário não encontrado.');
    }
  }
}

module.exports = new UsuarioService();