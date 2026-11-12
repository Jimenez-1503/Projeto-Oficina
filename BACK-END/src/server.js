const express = require('express');
require('dotenv').config();

const authMiddleware = require('./middlewares/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();
app.use(express.json());

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