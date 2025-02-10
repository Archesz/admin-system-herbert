require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json()); // Permite receber JSON no body das requisições

// Conectar ao MongoDB usando a URI do Python
const uri = "mongodb+srv://Arches:Giovana12@herbert.vp2ett8.mongodb.net/?retryWrites=true&w=majority&appName=Herbert";
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.once("open", () => console.log("MongoDB conectado!"));

// Criar um modelo de Aluno no MongoDB
const AlunoSchema = new mongoose.Schema({
  nome: String,
  cpf: { type: String, unique: true },
  nascimento: String,
  email: String,
  cpf: String,
  cep: String,
  whatsapp: String,
  genero: String,
  etnia: String,
  periodo: String,
  curso: String,
  turma: String,
  ano: Number
});

const Aluno = mongoose.model("Aluno", AlunoSchema, "Alunos_2025");

// Modelo para Usuários (login)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

const users = {
  admin: {
    email: "admin@example.com",
    password: "senha123", // Normalmente, você usaria bcrypt aqui para hash da senha
  },
  // Adicione mais usuários se necessário
};


// Rota inicial
app.get("/", (req, res) => {
  res.json({ message: "API funcionando com Express.js!" });
});

// Rota de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Verificar se o usuário existe no dicionário
  const user = Object.values(users).find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });
    return res.json({ access_token: token });
  }

  res.status(401).json({ error: "Usuário ou senha inválidos" });
});

// Rota para cadastrar alunos
app.post("/cadastrar-aluno", async (req, res) => {
  try {
    const { cpf } = req.body;
    const alunoExiste = await Aluno.findOne({ cpf });

    if (alunoExiste) {
      return res.status(400).json({ error: "CPF já cadastrado" });
    }

    const novoAluno = new Aluno(req.body);
    await novoAluno.save();
    res.status(201).json({ message: "Aluno cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: `Erro ao cadastrar aluno: ${error.message}` });
  }
});

// Rota para listar alunos
app.get("/alunos", async (req, res) => {
  try {
    const alunos = await Aluno.find({}, { _id: 0 });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: `Erro ao buscar alunos: ${error.message}` });
  }
});

// Rota para remover aluno pelo CPF
app.delete("/aluno/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    const result = await Aluno.deleteOne({ cpf });

    if (result.deletedCount > 0) {
      res.json({ message: "Aluno desmatriculado com sucesso!" });
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: `Erro ao desmatricular aluno: ${error.message}` });
  }
});

// Rota para atualizar aluno pelo CPF
app.put("/aluno/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    const alunoAtualizado = await Aluno.findOneAndUpdate({ cpf }, req.body, { new: true });

    if (alunoAtualizado) {
      res.json({ message: "Aluno atualizado com sucesso!" });
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: `Erro ao atualizar aluno: ${error.message}` });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
