
# 🔧 Projeto Oficina

Sistema web para **cadastro de clientes e veículos e agendamento de serviços** (vistoria veicular, transferência de propriedade e licenciamento). Possui API REST com autenticação JWT e uma interface web simples para o dia a dia da oficina.

> Projeto acadêmico desenvolvido no curso de Análise e Desenvolvimento de Sistemas (SENAI Itu).

## ✨ Funcionalidades

- Cadastro e login de usuários com senha criptografada (bcrypt) e token JWT
- CRUD de **Clientes** (o CPF/RG é armazenado criptografado com AES-256-CBC)
- CRUD de **Veículos**, sempre vinculados a um cliente
- CRUD de **Agendamentos**, com validação de que o veículo pertence ao cliente escolhido
- Busca na listagem e formulário em modal no front-end
- Proteção de todas as rotas (exceto login e cadastro de usuário) por middleware de autenticação

## 🧰 Tecnologias

| Camada          | Tecnologias                                                      |
| --------------- | ---------------------------------------------------------------- |
| Front-end       | HTML, CSS e JavaScript puro                                      |
| Back-end        | Node.js, Express 5                                               |
| Banco de dados  | MySQL (`mysql2`)                                               |
| Segurança      | JWT (`jsonwebtoken`), `bcryptjs`, módulo `crypto` do Node |
| Desenvolvimento | `nodemon`, `dotenv`                                          |

## 📁 Estrutura do projeto

```
Projeto-Oficina/
├── BACK-END/
│   ├── src/
│   │   ├── config/          # Conexão com o MySQL
│   │   ├── controllers/     # Recebem a requisição e devolvem a resposta
│   │   ├── services/        # Regras de negócio e validações
│   │   ├── repositories/    # Consultas SQL
│   │   ├── routes/          # Definição das rotas
│   │   ├── middlewares/     # Verificação do token JWT
│   │   ├── utils/           # Criptografia (crypto.js)
│   │   └── server.js        # Ponto de entrada da API
│   └── package.json
├── FRONT-END/
│   ├── index.html
│   ├── app.js
│   └── style.css
└── Modelos-Conceitual/
    ├── sistema_agendamento.sql          # Script de criação do banco
    ├── Modelo-lógico-Pedro_Jimenez.png  # Modelo lógico
    └── Documentação de Software.docx
```

O back-end segue a arquitetura em camadas: **Route → Controller → Service → Repository**.

## 🗄️ Modelo de dados

```
Usuarios      (id_usuario, nome, email*, senha)
Clientes      (id_cliente, nome_completo, telefone, registro_geral, endereco)
Veiculos      (id_veiculo, nome_modelo, placa*, tipo_modelo, id_cliente → Clientes)
Agendamentos  (id_agendamento, id_cliente → Clientes, id_veiculo → Veiculos,
               tipo_agendamento, data_agendamento, horario_agendamento, local_agendamento)
```

`*` = valor único. O diagrama completo está em `Modelos-Conceitual/Modelo-lógico-Pedro_Jimenez.png`.

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [MySQL](https://dev.mysql.com/downloads/) 8 ou superior

### 1. Clonar o repositório

```bash
git clone https://github.com/Jimenez-1503/Projeto-Oficina.git
cd Projeto-Oficina
```

### 2. Criar o banco de dados

Execute o script no MySQL (Workbench ou terminal):

```bash
mysql -u SEU_USUARIO -p < Modelos-Conceitual/sistema_agendamento.sql
```

O script cria o banco `sistema_agendamento_B`, as tabelas e alguns dados de exemplo.

### 3. Configurar as variáveis de ambiente

Dentro de `BACK-END/`, crie um arquivo `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=sistema_agendamento_B

JWT_SECRET=troque_por_uma_chave_longa_e_aleatoria
# Precisa ter exatamente 32 caracteres (ou 64 caracteres hexadecimais)
ENCRYPTION_KEY=troque_por_uma_chave_de_32_chars
```

> ⚠️ Nunca publique o `.env` no GitHub. Ele já deve estar no `.gitignore`.

### 4. Instalar dependências e iniciar

```bash
cd BACK-END
npm install
npm run dev     # com recarregamento automático (nodemon)
# ou
npm start       # execução normal
```

### 5. Acessar o sistema

Abra **http://localhost:3000** no navegador. O próprio servidor entrega o front-end. Crie um usuário na tela de login e entre no sistema.

## 🔌 Endpoints da API

Todas as rotas, exceto as duas primeiras, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método            | Rota                             | Descrição                                                 |
| ------------------ | -------------------------------- | ----------------------------------------------------------- |
| POST               | `/usuarios`                    | Cadastra um usuário                                        |
| POST               | `/login`                       | Autentica e retorna o token                                 |
| GET / PUT / DELETE | `/usuarios`, `/usuarios/:id` | Gerencia usuários                                          |
| GET / POST         | `/clientes`                    | Lista (aceita `?busca=`) e cadastra clientes              |
| PUT / DELETE       | `/clientes/:id`                | Atualiza e remove cliente                                   |
| GET / POST         | `/veiculos`                    | Lista e cadastra veículos                                  |
| PUT / DELETE       | `/veiculos/:id`                | Atualiza e remove veículo                                  |
| GET / POST         | `/agendamentos`                | Lista (com dados de cliente e veículo) e cria agendamentos |
| PUT / DELETE       | `/agendamentos/:id`            | Atualiza e remove agendamento                               |

### Exemplo: cadastrar um veículo

```bash
curl -X POST http://localhost:3000/veiculos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome_modelo": "Honda Civic",
    "placa": "XYZ9K88",
    "tipo_modelo": "Sedan",
    "id_cliente": 1
  }'
```

## 📏 Regras de negócio

- A **placa** do veículo é única no sistema.
- Todo veículo precisa estar vinculado a um cliente existente.
- Um agendamento só é aceito se o veículo selecionado **pertencer ao cliente** informado.
- Um cliente **não pode ser excluído** enquanto tiver veículos ou agendamentos vinculados.
- O CPF/RG é gravado criptografado e descriptografado apenas na listagem.

## 🛠️ Problemas comuns

| Sintoma                               | Possível causa                                        |
| ------------------------------------- | ------------------------------------------------------ |
| `ECONNREFUSED 127.0.0.1:3306`       | MySQL não está em execução                         |
| `Token inválido ou expirado`       | Faça login novamente ou confira o `JWT_SECRET`      |
| Erro ao cadastrar veículo            | Placa já cadastrada ou cliente inexistente            |
| Erro de `ENCRYPTION_KEY` ao iniciar | A chave precisa ter 32 caracteres (ou 64 hexadecimais) |

## 👤 Autor

**Pedro Jimenez**
Estudante de Análise e Desenvolvimento de Sistemas, SENAI Itu
GitHub: [@Jimenez-1503](https://github.com/Jimenez-1503)
