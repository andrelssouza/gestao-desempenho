const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota para a página de Login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota para a página principal do App
app.get('/gestao_desempenho_v3.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'gestao_desempenho_v3.html'));
});

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  res.json({ 
    token, 
    user: { name: "Usuário", email: email, role: "Gestor", company: "Empresa" } 
  });
});

// Rota da IA Gemini
app.post('/api/gerar-pdi', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const { prompt } = req.body;
    const result = await model.generateContent(prompt || "Sugira 3 ações de PDI");
    const response = await result.response;
    res.json({ sugestoes: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
