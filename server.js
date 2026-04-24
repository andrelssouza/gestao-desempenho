const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configurações de ambiente
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Banco de dados em memória (Atenção: Na Vercel, isso reinicia com frequência)
let users = [];
let verificationCodes = {};

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token de acesso necessário' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
};

// --- ROTAS DE NAVEGAÇÃO E AUTENTICAÇÃO ---

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, role, company, password } = req.body;
    if (!name || !email || !role || !company || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: 'Email já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now(),
      name, email, role, company,
      password: hashedPassword,
      verified: false,
      createdAt: new Date()
    };

    users.push(user);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    verificationCodes[email] = {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000,
      userId: user.id
    };

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verifique seu email - Gestão de Desempenho',
        html: `<h2>Bem-vindo!</h2><p>Seu código é: <b>${verificationCode}</b></p>`
      });
      res.json({ message: 'Usuário registrado. Verifique seu email.' });
    } catch (emailError) {
      res.status(201).json({ message: 'Usuário criado. Erro ao enviar email.', userId: user.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body;
  const verification = verificationCodes[email];

  if (!verification || verification.code !== code || Date.now() > verification.expires) {
    return res.status(400).json({ message: 'Código inválido ou expirado' });
  }

  const user = users.find(u => u.id === verification.userId);
  if (user) user.verified = true;
  delete verificationCodes[email];
  res.json({ message: 'Email verificado com sucesso' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  if (!user.verified) return res.status(401).json({ message: 'Email não verificado' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const { password, ...userSafe } = user;
  res.json(userSafe);
});

// --- ROTAS DE INTELIGÊNCIA ARTIFICIAL (GEMINI) ---

app.post('/api/gerar-pdi', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API Key ausente' });
    const { nome, cargo, area, softSkills, hardSkills, media } = req.body;

    const prompt = `Sugira 3 ações de PDI para: ${nome}, ${cargo}, ${area}. Soft: ${softSkills}, Hard: ${hardSkills}, Média: ${media}/4. Responda APENAS JSON: {"sugestoes":[{"competencia":"...","acao":"...","justificativa":"...","prazo":"2025-12-31"}]}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : { sugestoes: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analisar-funcionario', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API Key ausente' });
    const { funcionario } = req.body;

    const prompt = `Analise o desempenho de ${funcionario.nome} (${funcionario.cargo}). Média: ${funcionario.mediaGeral}/4. Posição Nine Box: ${funcionario.potencialLabel}/${funcionario.desempenhoLabel}. Forneça Diagnóstico, Forças, Melhorias e Recomendações.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const analise = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao gerar análise.';
    res.json({ analise });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); // <-- Agora devidamente fechado!

// --- INICIALIZAÇÃO DO SERVIDOR ---

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
