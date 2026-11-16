
const db = require('../config/database');

class ClienteRepository {
  async findAll(busca) {
    let sql = 'SELECT * FROM Clientes';
    const params = [];

    if (busca) {
      sql += ' WHERE nome_completo LIKE ? OR registro_geral LIKE ?';
      params.push(`%${busca}%`, `%${busca}%`);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM Clientes WHERE id_cliente = ?',
      [id]
    );

    return rows[0];
  }

  async create(cliente) {
    const {
      nome_completo,
      telefone,
      registro_geral,
      endereco
    } = cliente;

    const [result] = await db.query(
      `INSERT INTO Clientes
      (nome_completo, telefone, registro_geral, endereco)
      VALUES (?, ?, ?, ?)`,
      [nome_completo, telefone, registro_geral, endereco]
    );

    return result.insertId;
  }

  async update(id, cliente) {
    const {
      nome_completo,
      telefone,
      registro_geral,
      endereco
    } = cliente;

    await db.query(
      `UPDATE Clientes
       SET nome_completo = ?,
           telefone = ?,
           registro_geral = ?,
           endereco = ?
       WHERE id_cliente = ?`,
      [nome_completo, telefone, registro_geral, endereco, id]
    );
  }

  // Verifica se existem veículos e agendamentos vinculados
  async verificarVinculos(id) {
    const [veiculos] = await db.query(
      'SELECT COUNT(*) AS total FROM Veiculos WHERE id_cliente = ?',
      [id]
    );

    const [agendamentos] = await db.query(
      'SELECT COUNT(*) AS total FROM Agendamentos WHERE id_cliente = ?',
      [id]
    );

    return {
      veiculos: Number(veiculos[0].total),
      agendamentos: Number(agendamentos[0].total)
    };
  }

  async delete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM Clientes WHERE id_cliente = ?',
        [id]
      );

      return result.affectedRows;

    } catch (err) {
      if (
        err.code === 'ER_ROW_IS_REFERENCED_2' ||
        err.code === 'ER_ROW_IS_REFERENCED'
      ) {
        throw {
          status: 409,
          mensagem: 'Não é possível excluir: existem registros vinculados a este cliente.'
        };
      }

      throw err;
    }
  }
}

module.exports = new ClienteRepository();
