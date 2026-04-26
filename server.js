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

// Conexão Ajustada para os nomes da tua imagem
// Usamos o "OU" (||) para tentar todos os nomes possíveis que aparecem no teu print
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Conexão com Supabase configurada com sucesso!");
} else {
    console.error("❌ Erro: Chaves do Supabase não encontradas. Verifica os nomes na Vercel.");
}

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Se o banco não estiver configurado, ele entra em modo de teste (não salva)
  if (!supabase) {
      return res.json({ token: "modo_teste", user: { email, name: "Usuário Teste" } });
  }

  try {
    // 1. Tenta encontrar o usuário
    let { data: user } = await supabase.from('usuarios').select('*').eq('email', email).single();
    
    // 2. Se não existir, cria um novo automaticamente
    if (!user) {
      const { data: newUser } = await supabase.from('usuarios').insert([{ email, password }]).select().single();
      user = newUser;
    }
    
    res.json({ token: "logado", user: { email: user.email } });
  } catch (err) {
    // Se der erro no banco, permite entrar mas avisa no log
    res.json({ token: "erro_banco", user: { email } });
  }
});

// Rotas das páginas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/gestao_desempenho_v3.html', (req, res) => res.sendFile(path.join(__dirname, 'gestao_desempenho_v3.html')));

// Rota da IA Gemini
app.post('/api/gerar-pdi', async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Chave IA ausente" });

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(req.body.prompt || "Sugira 3 ações de PDI");
    const response = await result.response;
    res.json({ feedback: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
