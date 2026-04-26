const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexão com Supabase usando as chaves que vimos no seu print
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota para SALVAR os colaboradores
app.post('/api/salvar', async (req, res) => {
  const { email, colaboradores } = req.body;
  const { error } = await supabase
    .from('registros')
    .upsert([{ usuario_email: email, dados: colaboradores }], { onConflict: 'usuario_email' });
  
  if (error) return res.status(500).json(error);
  res.json({ message: "Salvo com sucesso!" });
});

// Rota para CARREGAR os colaboradores ao abrir o site
app.get('/api/carregar/:email', async (req, res) => {
  const { data, error } = await supabase
    .from('registros')
    .select('dados')
    .eq('usuario_email', req.params.email)
    .single();

  res.json(data ? data.dados : []);
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  let { data: user } = await supabase.from('usuarios').select('*').eq('email', email).single();
  if (!user) {
    const { data: newUser } = await supabase.from('usuarios').insert([{ email, password }]).select().single();
    user = newUser;
  }
  res.json({ token: "logado", user: { email: user.email } });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/gestao_desempenho_v3.html', (req, res) => res.sendFile(path.join(__dirname, 'gestao_desempenho_v3.html')));

module.exports = app;
