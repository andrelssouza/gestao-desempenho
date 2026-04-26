const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexão com o Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rota de Login e Criação de Usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let { data: user } = await supabase.from('usuarios').select('*').eq('email', email).single();

    if (!user) {
      const { data: newUser } = await supabase.from('usuarios').insert([{ email, password }]).select().single();
      user = newUser;
    }
    res.json({ token: "logado", user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});

// IA Gemini - Corrigida para evitar erro 500
app.post('/api/gerar-pdi', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("Chave da IA não configurada");
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const { prompt } = req.body;
    
    const result = await model.generateContent(prompt || "Sugira ações de PDI");
    const response = await result.response;
    res.json({ feedback: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Rotas para as páginas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/gestao_desempenho_v3.html', (req, res) => res.sendFile(path.join(__dirname, 'gestao_desempenho_v3.html')));

module.exports = app;
