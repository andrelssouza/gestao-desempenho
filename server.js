const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'lideranca-dev-secret';
const storeDirectory = path.join(__dirname, 'data');
const storePath = path.join(storeDirectory, 'leader-store.json');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

function createDefaultState(user) {
  return {
    profile: {
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      objective: 'Conduzir conversas de feedback com seguranca e consistencia.',
      level: 'Primeira lideranca',
      weeklyIntention: 'Criar mais clareza nas expectativas da equipe.',
      nextMentoring: 'Sexta-feira, 10:00',
    },
    habits: [
      {
        id: crypto.randomUUID(),
        title: 'Check-in diario com foco',
        description: 'Definir a prioridade de lideranca do dia em 3 minutos.',
        completedToday: true,
      },
      {
        id: crypto.randomUUID(),
        title: 'Feedback de qualidade',
        description: 'Registrar ao menos um feedback especifico por semana.',
        completedToday: false,
      },
      {
        id: crypto.randomUUID(),
        title: 'Reflexao de encerramento',
        description: 'Anotar um aprendizado real ao final da semana.',
        completedToday: false,
      },
    ],
    tracks: [
      {
        id: crypto.randomUUID(),
        title: 'Conversas de feedback que movem gente',
        competency: 'Feedback',
        progress: 58,
        modules: [
          { title: 'Preparar a conversa', done: true },
          { title: 'Conduzir com clareza', done: true },
          { title: 'Fechar com compromisso', done: false },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Delegacao com autonomia',
        competency: 'Delegacao',
        progress: 34,
        modules: [
          { title: 'Definir resultado esperado', done: true },
          { title: 'Ajustar nivel de autonomia', done: false },
          { title: 'Acompanhar sem microgerenciar', done: false },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Inteligencia emocional em pressao',
        competency: 'Inteligencia emocional',
        progress: 71,
        modules: [
          { title: 'Nomear gatilhos', done: true },
          { title: 'Regular resposta emocional', done: true },
          { title: 'Transformar conflito em alinhamento', done: false },
        ],
      },
    ],
    competencies: [
      { id: crypto.randomUUID(), name: 'Comunicacao', current: 3, target: 4 },
      { id: crypto.randomUUID(), name: 'Delegacao', current: 2, target: 4 },
      { id: crypto.randomUUID(), name: 'Feedback', current: 4, target: 5 },
      { id: crypto.randomUUID(), name: 'Gestao de equipe', current: 3, target: 4 },
      { id: crypto.randomUUID(), name: 'Inteligencia emocional', current: 4, target: 5 },
    ],
    feedbacks: [
      {
        id: crypto.randomUUID(),
        author: 'Patricia Almeida',
        type: 'Fortaleca',
        context: 'Reuniao semanal da equipe',
        message: 'Voce trouxe clareza para as prioridades e destravou a conversa rapidamente.',
        nextStep: 'Repetir a mesma objetividade nas conversas individuais.',
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        author: 'Marcelo Santos',
        type: 'Desenvolva',
        context: 'Acompanhamento de projeto',
        message: 'Faltou combinar o nivel de autonomia esperado para evitar retrabalho.',
        nextStep: 'Explicitar resultado, prazo e checkpoints antes de delegar.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    actionPlan: [
      {
        id: crypto.randomUUID(),
        competency: 'Delegacao',
        action: 'Definir um template simples para delegacao com resultado, prazo e autonomia.',
        deadline: '2026-07-03',
        status: 'em andamento',
      },
      {
        id: crypto.randomUUID(),
        competency: 'Feedback',
        action: 'Realizar uma conversa de feedback estruturado com cada liderado-chave.',
        deadline: '2026-07-10',
        status: 'pendente',
      },
    ],
    reflections: [
      {
        id: crypto.randomUUID(),
        title: 'Aprendizado da semana',
        content: 'A equipe responde melhor quando eu explico contexto antes de cobrar entrega.',
      },
    ],
  };
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function ensureStore() {
  if (!fs.existsSync(storeDirectory)) {
    fs.mkdirSync(storeDirectory, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ users: [], appStates: {} }, null, 2));
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

function writeStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function issueToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getUserState(store, email) {
  const state = store.appStates[email];
  if (!state) {
    const user = store.users.find((item) => item.email === email);
    const defaultState = createDefaultState(user || {
      name: 'Lider em desenvolvimento',
      email,
      role: 'Lider',
      company: 'Sua empresa',
    });
    store.appStates[email] = defaultState;
    writeStore(store);
    return clone(defaultState);
  }
  return clone(state);
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, company, password } = req.body;

  if (!name || !email || !role || !company || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatorios.' });
  }

  const store = readStore();
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingVerifiedUser = store.users.find(
    (user) => user.email === normalizedEmail && user.verified
  );

  if (existingVerifiedUser) {
    return res.status(409).json({ message: 'Ja existe uma conta verificada com esse email.' });
  }

  const verificationCode = createVerificationCode();
  const baseUser = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    role: String(role).trim(),
    company: String(company).trim(),
    passwordHash: hashPassword(password),
    verified: false,
    verificationCode,
    createdAt: new Date().toISOString(),
  };

  const existingPendingIndex = store.users.findIndex((user) => user.email === normalizedEmail);
  if (existingPendingIndex >= 0) {
    store.users[existingPendingIndex] = {
      ...store.users[existingPendingIndex],
      ...baseUser,
      id: store.users[existingPendingIndex].id,
    };
  } else {
    store.users.push(baseUser);
  }

  writeStore(store);

  return res.status(201).json({
    message: 'Cadastro criado. Use o codigo enviado para verificar sua conta.',
    devCode: verificationCode,
  });
});

app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body;
  const store = readStore();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = store.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return res.status(404).json({ message: 'Conta nao encontrada para verificacao.' });
  }

  if (user.verificationCode !== String(code || '').trim()) {
    return res.status(400).json({ message: 'Codigo de verificacao invalido.' });
  }

  user.verified = true;
  user.verificationCode = null;

  if (!store.appStates[user.email]) {
    store.appStates[user.email] = createDefaultState(user);
  }

  writeStore(store);
  return res.json({ message: 'Conta verificada com sucesso.' });
});

app.post('/api/auth/resend', (req, res) => {
  const { email } = req.body;
  const store = readStore();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = store.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return res.status(404).json({ message: 'Conta nao encontrada.' });
  }

  const verificationCode = createVerificationCode();
  user.verificationCode = verificationCode;
  writeStore(store);

  return res.json({
    message: 'Novo codigo gerado com sucesso.',
    devCode: verificationCode,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const store = readStore();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = store.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return res.status(404).json({ message: 'Conta nao encontrada.' });
  }

  if (!user.verified) {
    return res.status(403).json({ message: 'Verifique sua conta antes de entrar.' });
  }

  if (user.passwordHash !== hashPassword(password || '')) {
    return res.status(401).json({ message: 'Senha incorreta.' });
  }

  return res.json({
    token: issueToken(user),
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
    },
  });
});

app.get('/api/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Sessao ausente.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json(payload);
  } catch (error) {
    return res.status(401).json({ message: 'Sessao invalida.' });
  }
});

app.get('/api/app-state', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'Informe o email do usuario.' });
  }

  const store = readStore();
  const state = getUserState(store, email);
  return res.json(state);
});

app.post('/api/app-state', (req, res) => {
  const { email, state } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !state) {
    return res.status(400).json({ message: 'Email e estado sao obrigatorios.' });
  }

  const store = readStore();
  store.appStates[normalizedEmail] = state;
  writeStore(store);

  return res.json({ message: 'Estado salvo com sucesso.' });
});

app.get('/api/dashboard', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const store = readStore();
  const state = getUserState(store, email);
  const completedHabits = state.habits.filter((habit) => habit.completedToday).length;
  const doneActions = state.actionPlan.filter((item) => item.status === 'concluido').length;

  return res.json({
    profile: state.profile,
    summary: {
      activeTracks: state.tracks.length,
      completedHabits,
      openFeedbacks: state.feedbacks.length,
      completedActions: doneActions,
    },
    reflections: state.reflections,
  });
});

app.get('/api/trilhas', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const store = readStore();
  const state = getUserState(store, email);
  return res.json(state.tracks);
});

app.get('/api/avaliacoes', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const store = readStore();
  const state = getUserState(store, email);
  return res.json(state.competencies);
});

app.get('/api/feedbacks', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const store = readStore();
  const state = getUserState(store, email);
  return res.json(state.feedbacks);
});

app.get('/api/planos-acao', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const store = readStore();
  const state = getUserState(store, email);
  return res.json(state.actionPlan);
});

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/login.html', (_req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/lideranca.html', (_req, res) => res.sendFile(path.join(__dirname, 'lideranca.html')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
