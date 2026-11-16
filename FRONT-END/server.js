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

// Front-end estático (HTML/CSS/JS) — acessível em http://localhost:PORT
app.use(express.static(path.join(__dirname, '../../FRONT-END')));

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

const cors = require('cors');
app.use(cors());