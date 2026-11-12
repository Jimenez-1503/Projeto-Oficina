const db = require('../config/database');

class UsuarioRepository {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id_usuario, nome, email FROM usuarios WHERE id_usuario = ?',
      [id]
    );
    return rows[0];
  }

  async findAll() {
    const [rows] = await db.query('SELECT id_usuario, nome, email FROM usuarios');
    return rows;
  }

  async create({ nome, email, senha }) {
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    return {
      id_usuario: result.insertId,
      nome,
      email
    };
  }

  async update(id, { nome, email }) {
    await db.query(
      'UPDATE usuarios SET nome = ?, email = ? WHERE id_usuario = ?',
      [nome, email, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new UsuarioRepository();