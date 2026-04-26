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

// Conexão Segura com Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
if (!supabaseUrl || !supabaseKey) {
    console.error("AVISO: Chaves do Supabase não encontradas. O salvamento não funcionará.");
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!supabase) {
      return res.json({ token: "modo_offline", user: { email, name: "Usuário Offline" } });
  }

  try {
    let { data: user } = await supabase.from('usuarios').select('*').eq('email', email).single();
    if (!user) {
      const { data: newUser } = await supabase.from('usuarios').insert([{ email, password }]).select().single();
      user = newUser;
    }
    res.json({ token: "logado", user: { email: user.email } });
  } catch (err) {
    res.json({ token: "modo_erro", user: { email } });
  }
});

// Rotas das páginas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/gestao_desempenho_v3.html', (req, res) => res.sendFile(path.join(__dirname, 'gestao_desempenho_v3.html')));

module.exports = app;
