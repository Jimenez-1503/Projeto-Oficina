let API = 'http://localhost:3000';
const apiPronta = (async () => {
  const candidatos = location.protocol === 'file:' ? ['http://localhost:3000'] : ['', 'http://localhost:3000'];
  for (const base of candidatos) {
    try {
      const r = await fetch(base + '/status-api');
      if (r.ok && (await r.json()).api === 'oficina') { API = base; return; }
    } catch { /* tenta o próximo */ }
  }
})();

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let token = localStorage.getItem('token');
let abaAtual = 'agendamentos';
let dados = { clientes: [], veiculos: [], agendamentos: [] };
let editando = null;

/* ---------- API ---------- */
async function api(metodo, url, corpo) {
  await apiPronta;
  const res = await fetch(API + url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (res.status === 401 && url !== '/login') { sair(); throw new Error('Sessão expirada. Entre novamente.'); }
  const texto = await res.text();
  let json = null;
  try { json = texto ? JSON.parse(texto) : null; } catch { /* resposta sem JSON */ }
  if (!res.ok) {
    const detalhe = json?.mensagem || json?.erro;
    throw new Error(detalhe || `Erro ${res.status} em ${metodo} ${res.url} — a API da oficina não respondeu nesse endereço. Abra o site por http://localhost:3000 com o servidor rodando.`);
  }
  return json;
}

function toast(msg, erro = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast' + (erro ? ' erro-toast' : '');
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.add('oculto'), 3000);
}

/* ---------- Login / Cadastro ---------- */
let modoCadastro = false;
$('#login-alternar').onclick = () => {
  modoCadastro = !modoCadastro;
  document.querySelector('.campo-nome').classList.toggle('oculto', !modoCadastro);
  $('#login-nome').required = modoCadastro;
  $('#login-btn').textContent = modoCadastro ? 'Cadastrar' : 'Entrar';
  $('#login-alternar').textContent = modoCadastro ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se';
  $('#login-sub').textContent = modoCadastro ? 'Crie sua conta' : 'Entre para gerenciar os agendamentos';
  $('#login-erro').classList.add('oculto');
};

$('#form-login').onsubmit = async (e) => {
  e.preventDefault();
  const btn = $('#login-btn'), erro = $('#login-erro');
  erro.classList.add('oculto');
  btn.disabled = true;
  const email = $('#login-email').value.trim(), senha = $('#login-senha').value;
  try {
    if (modoCadastro) {
      await api('POST', '/usuarios', { nome: $('#login-nome').value.trim(), email, senha });
      toast('Conta criada! Entrando...');
    }
    const r = await api('POST', '/login', { email, senha });
    token = r.token;
    localStorage.setItem('token', token);
    localStorage.setItem('nome', r.nome || '');
    iniciarApp();
  } catch (err) {
    erro.textContent = err.message === 'Failed to fetch'
      ? 'Não foi possível conectar à API. O servidor está rodando?'
      : err.message;
    erro.classList.remove('oculto');
  } finally {
    btn.disabled = false;
  }
};

function sair() {
  token = null;
  localStorage.removeItem('token');
  localStorage.removeItem('nome');
  $('#tela-app').classList.add('oculto');
  $('#tela-login').classList.remove('oculto');
}
$('#btn-sair').onclick = sair;

/* ---------- App ---------- */
function iniciarApp() {
  $('#tela-login').classList.add('oculto');
  $('#tela-app').classList.remove('oculto');
  $('#usuario-nome').textContent = localStorage.getItem('nome') || '';
  carregarTudo();
}

async function carregarTudo() {
  try {
    const [c, v, a] = await Promise.all([api('GET', '/clientes'), api('GET', '/veiculos'), api('GET', '/agendamentos')]);
    dados = { clientes: c || [], veiculos: v || [], agendamentos: a || [] };
    render();
  } catch (err) { toast(err.message, true); }
}

document.querySelectorAll('.aba').forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll('.aba').forEach((x) => x.classList.remove('ativa'));
    b.classList.add('ativa');
    abaAtual = b.dataset.aba;
    $('#busca').value = '';
    render();
  };
});
$('#busca').oninput = render;

const fmtData = (d) => { const s = String(d || '').slice(0, 10).split('-'); return s.length === 3 ? `${s[2]}/${s[1]}/${s[0]}` : ''; };
const fmtHora = (h) => String(h || '').slice(0, 5);

/* Definição de cada aba: colunas, linhas e campos do formulário */
const abas = {
  clientes: {
    titulo: 'Clientes', id: 'id_cliente', rota: '/clientes',
    cols: ['Nome', 'Telefone', 'CPF/RG', 'Endereço'],
    linha: (r) => [r.nome_completo, r.telefone, r.registro_geral, r.endereco],
    campos: () => [
      { n: 'nome_completo', l: 'Nome completo', req: true },
      { n: 'telefone', l: 'Telefone', tipo: 'tel' },
      { n: 'registro_geral', l: 'CPF/RG', req: true },
      { n: 'endereco', l: 'Endereço' },
    ],
  },
  veiculos: {
    titulo: 'Veículos', id: 'id_veiculo', rota: '/veiculos',
    cols: ['Modelo', 'Placa', 'Tipo', 'Cliente'],
    linha: (r) => [r.nome_modelo, r.placa, r.tipo_modelo, nomeCliente(r.id_cliente)],
    campos: () => [
      { n: 'nome_modelo', l: 'Modelo', req: true },
      { n: 'placa', l: 'Placa', req: true, max: 10 },
      { n: 'tipo_modelo', l: 'Tipo (Sedan, Hatch...)' },
      { n: 'id_cliente', l: 'Cliente', req: true, opcoes: opcoesClientes() },
    ],
  },
  agendamentos: {
    titulo: 'Agendamentos', id: 'id_agendamento', rota: '/agendamentos',
    cols: ['Data', 'Horário', 'Tipo', 'Local', 'Cliente', 'Veículo'],
    linha: (r) => [fmtData(r.data_agendamento), fmtHora(r.horario_agendamento), r.tipo_agendamento, r.local_agendamento, r.nome_cliente, `${r.modelo_veiculo || ''} (${r.placa_veiculo || ''})`],
    campos: () => [
      { n: 'tipo_agendamento', l: 'Tipo', req: true, opcoes: ['Vistoria veicular', 'Transferencia de propriedade', 'Licenciamento'].map((x) => [x, x]) },
      { n: 'data_agendamento', l: 'Data', tipo: 'date', req: true },
      { n: 'horario_agendamento', l: 'Horário', tipo: 'time', req: true },
      { n: 'local_agendamento', l: 'Local', req: true },
      { n: 'id_cliente', l: 'Cliente', req: true, opcoes: opcoesClientes() },
      { n: 'id_veiculo', l: 'Veículo', req: true, opcoes: [] },
    ],
  },
};

const nomeCliente = (id) => dados.clientes.find((c) => c.id_cliente == id)?.nome_completo || id;
function opcoesClientes() { return dados.clientes.map((c) => [c.id_cliente, c.nome_completo]); }

function render() {
  const cfg = abas[abaAtual];
  $('#titulo-aba').textContent = cfg.titulo;
  $('#thead').innerHTML = '<tr>' + cfg.cols.map((c) => `<th>${c}</th>`).join('') + '<th></th></tr>';

  const q = $('#busca').value.toLowerCase();
  const linhas = dados[abaAtual].filter((r) => cfg.linha(r).join(' ').toLowerCase().includes(q));

  $('#tbody').innerHTML = linhas.map((r) =>
    '<tr>' + cfg.linha(r).map((v) => `<td>${esc(v)}</td>`).join('') +
    `<td class="acoes-td">
       <button class="btn btn-sec btn-sm" data-ed="${r[cfg.id]}">Editar</button>
       <button class="btn btn-perigo btn-sm" data-del="${r[cfg.id]}">Excluir</button>
     </td></tr>`).join('');
  $('#vazio').classList.toggle('oculto', linhas.length > 0);

  document.querySelectorAll('[data-ed]').forEach((b) => (b.onclick = () => abrirModal(b.dataset.ed)));
  document.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => excluir(b.dataset.del)));
}

/* ---------- Modal ---------- */
function abrirModal(id = null) {
  const cfg = abas[abaAtual];
  editando = id;
  const reg = id ? dados[abaAtual].find((r) => r[cfg.id] == id) : {};
  $('#modal-titulo').textContent = (id ? 'Editar ' : 'Novo(a) ') + cfg.titulo.toLowerCase();
  $('#modal-erro').classList.add('oculto');

  $('#modal-campos').innerHTML = cfg.campos().map((c) => {
    let valor = reg[c.n] ?? '';
    if (c.n === 'data_agendamento') valor = String(valor).slice(0, 10);
    if (c.n === 'horario_agendamento') valor = fmtHora(valor);
    if (c.n === 'registro_geral' && id && abaAtual === 'clientes') valor = reg.registro_geral || '';
    const attrs = `id="f-${c.n}" name="${c.n}" ${c.req ? 'required' : ''} ${c.max ? `maxlength="${c.max}"` : ''}`;
    const entrada = c.opcoes
      ? `<select ${attrs}><option value="">Selecione...</option>${c.opcoes.map(([v, t]) => `<option value="${esc(v)}" ${v == valor ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`
      : `<input ${attrs} type="${c.tipo || 'text'}" value="${esc(valor)}">`;
    return `<label>${c.l}${entrada}</label>`;
  }).join('');

  // Agendamento: o seletor de veículo mostra só os veículos do cliente escolhido
  if (abaAtual === 'agendamentos') {
    const selCli = $('#f-id_cliente'), selVei = $('#f-id_veiculo');
    const atualizarVeiculos = () => {
      const lista = dados.veiculos.filter((v) => v.id_cliente == selCli.value);
      selVei.innerHTML = '<option value="">Selecione...</option>' +
        lista.map((v) => `<option value="${v.id_veiculo}" ${v.id_veiculo == reg.id_veiculo ? 'selected' : ''}>${esc(v.nome_modelo)} (${esc(v.placa)})</option>`).join('');
    };
    selCli.onchange = () => { reg.id_veiculo = null; atualizarVeiculos(); };
    atualizarVeiculos();
    // A API só permite alterar a data de um agendamento existente
    if (id) {
      ['tipo_agendamento', 'horario_agendamento', 'local_agendamento', 'id_cliente', 'id_veiculo']
        .forEach((n) => { $('#f-' + n).disabled = true; });
    }
  }
  $('#modal').showModal();
}

$('#btn-novo').onclick = () => abrirModal();
$('#modal-cancelar').onclick = () => $('#modal').close();

$('#form-modal').onsubmit = async (e) => {
  e.preventDefault();
  const cfg = abas[abaAtual];
  const corpo = {};
  new FormData($('#form-modal')).forEach((v, k) => (corpo[k] = v));
  try {
    if (abaAtual === 'agendamentos') {
      if (editando) await api('PUT', `${cfg.rota}/${editando}`, { data_agendamento: corpo.data_agendamento });
      else await api('POST', cfg.rota, corpo);
    } else if (editando) await api('PUT', `${cfg.rota}/${editando}`, corpo);
    else await api('POST', cfg.rota, corpo);

    $('#modal').close();
    toast('Salvo com sucesso!');
    carregarTudo();
  } catch (err) {
    $('#modal-erro').textContent = err.message;
    $('#modal-erro').classList.remove('oculto');
  }
};

async function excluir(id) {
  if (!confirm('Deseja realmente excluir este registro?')) return;
  try {
    await api('DELETE', `${abas[abaAtual].rota}/${id}`);
    toast('Registro excluído.');
    carregarTudo();
  } catch (err) { toast(err.message, true); }
}

/* ---------- Início ---------- */
if (token) iniciarApp();