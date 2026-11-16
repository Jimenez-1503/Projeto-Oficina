const usuarioRepository = require('../repositories/usuarioRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  async login(email, senha) {
    if (!email || !senha) {
      throw { status: 400, mensagem: 'E-mail e senha são obrigatórios' };
    }

    const usuario = await usuarioRepository.findByEmail(email);

    const senhaValida = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

    if (!senhaValida) {
      throw { status: 401, mensagem: 'Credenciais inválidas' };
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email },
      process.env.JWT_SECRET, // Certifique-se de ter essa variável configurada
      { expiresIn: '1d' }
    );

    return { token, nome: usuario.nome };
  }
}

module.exports = new AuthService();