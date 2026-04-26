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

// Rota de Login (Verifica no Banco)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Busca usuário no banco
  let { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  // Se não existe, cria um para facilitar seu acesso inicial
  if (!user) {
    const { data: newUser } = await supabase
      .from('usuarios')
      .insert([{ email, password }])
      .select()
      .single();
    user = newUser;
  }

  res.json({ token: "logado", user: { email: user.email } });
});

// SALVAR DADOS (Memória Permanente)
app.post('/api/salvar', async (req, res) => {
  const { email, conteudo } = req.body;
  const { error } = await supabase
    .from('registros')
    .insert([{ usuario_email: email, conteudo }]);
  
  if (error) return res.status(500).json(error);
  res.json({ message: "Salvo com sucesso!" });
});

// CARREGAR DADOS
app.get('/api/carregar/:email', async (req, res) => {
  const { data, error } = await supabase
    .from('registros')
    .select('conteudo')
    .eq('usuario_email', req.params.email)
    .order('created_at', { ascending: false });

  res.json(data || []);
});

// IA Gemini
app.post('/api/gerar-pdi', async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(req.body.prompt);
  const response = await result.response;
  res.json({ feedback: response.text() });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

module.exports = app;
