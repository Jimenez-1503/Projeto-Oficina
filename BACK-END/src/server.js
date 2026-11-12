const express = require('express');
require('dotenv').config();

const authMiddleware = require('./middlewares/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // 1. Importe o usuarioRoutes
const clienteRoutes = require('./routes/clienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();
app.use(express.json());

// Rotas públicas e de usuários (coloque antes do authMiddleware global para não bloquear o POST /usuarios)
app.use('/', authRoutes);
app.use('/', usuarioRoutes); // 2. Registre o usuarioRoutes

// Proteção JWT global para todas as rotas declaradas abaixo
app.use(authMiddleware);

// Rotas protegidas
app.use('/clientes', clienteRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/agendamentos', agendamentoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});