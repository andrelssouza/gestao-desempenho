const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Banco de dados em memória (limpa ao reiniciar)
let users = [];

// Rota inicial: Redireciona para o login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota de Login (Simplificada para teste)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Como o banco reseta, vamos permitir login direto se o usuário existir
  const user = users.find(u => u.email === email);
  
  if (user) {
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    return res.json({ token, user: { name: user.name, email: user.email } });
  }
  
  // Se não existe, cria um temporário apenas para você conseguir entrar agora
  const tempUser = { name: "Usuário Teste", email };
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  res.json({ token, user: tempUser });
});

// Exportação obrigatória para Vercel
module.exports = app;
