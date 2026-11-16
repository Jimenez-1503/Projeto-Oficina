
const agendamentoService = require('../services/agendamentoService');

class AgendamentoController {

  async listar(req, res) {
    try {
      const agendamentos = await agendamentoService.listarTodos();

      return res.status(200).json(agendamentos);

    } catch (err) {
      console.error('Erro ao listar agendamentos:', err);

      return res.status(500).json({
        mensagem: 'Erro ao listar agendamentos'
      });
    }
  }

  async criar(req, res) {
    try {
      const novoAgendamento = await agendamentoService.criar(req.body);

      return res.status(201).json({
        mensagem: 'Agendamento cadastrado com sucesso!',
        agendamento: novoAgendamento
      });

    } catch (err) {
      console.error('Erro ao cadastrar agendamento:', err);

      return res.status(err.status || 500).json({
        mensagem: err.mensagem || 'Erro ao cadastrar agendamento'
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;

      const agendamentoAtualizado =
        await agendamentoService.atualizar(id, req.body);

      return res.status(200).json({
        mensagem: 'Agendamento atualizado com sucesso!',
        agendamento: agendamentoAtualizado
      });

    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);

      return res.status(err.status || 500).json({
        mensagem: err.mensagem || 'Erro ao atualizar agendamento'
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;

      await agendamentoService.deletar(id);

      return res.status(200).json({
        mensagem: 'Agendamento excluído com sucesso!'
      });

    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);

      return res.status(err.status || 500).json({
        mensagem: err.mensagem || 'Erro ao excluir agendamento'
      });
    }
  }
}

module.exports = new AgendamentoController();
