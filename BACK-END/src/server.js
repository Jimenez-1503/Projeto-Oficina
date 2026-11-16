const express = require('express');
const path = require('path');
require('dotenv').config();

const authMiddleware = require('./middlewares/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();
app.use(express.json());

// CORS: permite abrir o front por outro servidor (ex.: Live Server na porta 5500)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Front-end estático (HTML/CSS/JS) — acessível em http://localhost:PORT
app.use(express.static(path.join(__dirname, '../../FRONT-END'), {
  etag: false,
  setHeaders: (res) => res.set('Cache-Control', 'no-store') // sempre carrega a versão mais nova do site
}));

// Usado pelo front-end para descobrir onde a API está
app.get('/status-api', (req, res) => res.json({ api: 'oficina' }));

// Rotas públicas e de usuários
app.use('/', authRoutes);
app.use('/', usuarioRoutes);

// Proteção JWT global para todas as rotas declaradas abaixo
app.use(authMiddleware);

// Rotas protegidas (registadas na raiz '/', pois o caminho completo já está dentro de cada ficheiro de rotas)
app.use('/', clienteRoutes);
app.use('/', veiculoRoutes);
app.use('/', agendamentoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});