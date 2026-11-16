
const agendamentoRepository = require('../repositories/agendamentoRepository');
const clienteRepository = require('../repositories/clienteRepository');
const veiculoRepository = require('../repositories/veiculoRepository');

class AgendamentoService {

  async listarTodos() {
    return await agendamentoRepository.findAllWithDetails();
  }

  validarDados(dados) {
    const {
      tipo_agendamento,
      data_agendamento,
      horario_agendamento,
      local_agendamento,
      id_cliente,
      id_veiculo
    } = dados;

    if (
      !tipo_agendamento ||
      !data_agendamento ||
      !horario_agendamento ||
      !local_agendamento ||
      !id_cliente ||
      !id_veiculo
    ) {
      throw {
        status: 400,
        mensagem: 'Preencha todos os campos do agendamento'
      };
    }
  }

  async validarRelacionamentos(id_cliente, id_veiculo) {
    const cliente = await clienteRepository.findById(id_cliente);

    if (!cliente) {
      throw {
        status: 400,
        mensagem: 'Cliente informado não existe'
      };
    }

    const veiculo = await veiculoRepository.findById(id_veiculo);

    if (!veiculo) {
      throw {
        status: 400,
        mensagem: 'Veículo informado não existe'
      };
    }

    if (String(veiculo.id_cliente) !== String(id_cliente)) {
      throw {
        status: 400,
        mensagem: 'O veículo selecionado não pertence ao cliente informado'
      };
    }
  }

  async criar(dados) {
    this.validarDados(dados);

    await this.validarRelacionamentos(
      dados.id_cliente,
      dados.id_veiculo
    );

    const id = await agendamentoRepository.create(dados);

    return {
      id_agendamento: id,
      ...dados
    };
  }

  async atualizar(id, dados) {
    this.validarDados(dados);

    const agendamento = await agendamentoRepository.findById(id);

    if (!agendamento) {
      throw {
        status: 404,
        mensagem: 'Agendamento não encontrado'
      };
    }

    await this.validarRelacionamentos(
      dados.id_cliente,
      dados.id_veiculo
    );

    await agendamentoRepository.update(id, dados);

    return {
      id_agendamento: id,
      ...dados
    };
  }

  async deletar(id) {
    const agendamento = await agendamentoRepository.findById(id);

    if (!agendamento) {
      throw {
        status: 404,
        mensagem: 'Agendamento não encontrado'
      };
    }

    await agendamentoRepository.delete(id);
  }
}

module.exports = new AgendamentoService();
