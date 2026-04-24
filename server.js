const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
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

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory database (em produção, use um banco real)
let users = [];
let verificationCodes = {};

// Email transporter (configure com seu provedor de email)
const transporter = nodemailer.createTransport({
  service: 'outlook', // ou 'gmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, role, company, password } = req.body;

    // Validações
    if (!name || !email || !role || !company || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = {
      id: Date.now(),
      name,
      email,
      role,
      company,
      password: hashedPassword,
      verified: false,
      createdAt: new Date()
    };

    users.push(user);

    // Gerar código de verificação
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    verificationCodes[email] = {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutos
      userId: user.id
    };

    // Enviar email de verificação
    try {
      console.log('Tentando enviar email para:', email);
      console.log('EMAIL_USER configurado:', process.env.EMAIL_USER ? 'SIM' : 'NÃO');
      console.log('EMAIL_PASS configurado:', process.env.EMAIL_PASS ? 'SIM' : 'NÃO');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verifique seu email - Gestão de Desempenho',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6d5ae6;">Bem-vindo ao Gestão de Desempenho!</h2>
            <p>Olá ${name},</p>
            <p>Obrigado por se cadastrar. Para ativar sua conta, use o código de verificação abaixo:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #6d5ae6; font-size: 32px; margin: 0;">${verificationCode}</h1>
            </div>
            <p>Este código expira em 10 minutos.</p>
            <p>Se você não solicitou este cadastro, ignore este email.</p>
            <br>
            <p>Atenciosamente,<br>Equipe Gestão de Desempenho</p>
          </div>
        `
      };

      console.log('Enviando email com opções:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });

      const result = await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', result.messageId);

      res.json({ message: 'Usuário registrado. Verifique seu email para o código de ativação.' });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      console.error('Detalhes do erro:', emailError.message);
      // Não falhar o registro por erro de email, apenas logar
      res.status(201).json({
        message: 'Usuário criado com sucesso. Código de verificação não pôde ser enviado por email.',
        userId: user.id
      });
    }

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de verificação de email
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    const verification = verificationCodes[email];
    if (!verification) {
      return res.status(400).json({ message: 'Código de verificação não encontrado' });
    }

    if (Date.now() > verification.expires) {
      delete verificationCodes[email];
      return res.status(400).json({ message: 'Código expirado' });
    }

    if (verification.code !== code) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    // Marcar usuário como verificado
    const user = users.find(u => u.id === verification.userId);
    if (user) {
      user.verified = true;
    }

    // Limpar código usado
    delete verificationCodes[email];

    res.json({ message: 'Email verificado com sucesso' });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de reenvio de código
app.post('/api/auth/resend', async (req, res) => {
  try {
    const { email } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email já verificado' });
    }

    // Gerar novo código
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    verificationCodes[email] = {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000,
      userId: user.id
    };

    // Reenviar email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Novo código de verificação - Gestão de Desempenho',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6d5ae6;">Novo código de verificação</h2>
            <p>Olá ${user.name},</p>
            <p>Aqui está seu novo código de verificação:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #6d5ae6; font-size: 32px; margin: 0;">${verificationCode}</h1>
            </div>
            <p>Este código expira em 10 minutos.</p>
            <br>
            <p>Atenciosamente,<br>Equipe Gestão de Desempenho</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erro ao reenviar email:', emailError);
      return res.status(500).json({ message: 'Erro ao enviar email' });
    }

    res.json({ message: 'Novo código enviado' });

  } catch (error) {
    console.error('Erro no reenvio:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    if (!user.verified) {
      return res.status(401).json({ message: 'Email não verificado. Verifique sua caixa de entrada.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter perfil do usuário
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Rota para logout (opcional, pode ser feito no frontend)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota para gerar sugestões de PDI com IA
app.post('/api/gerar-pdi', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chave de API não configurada' });
    }

    const { nome, cargo, area, softSkills, hardSkills, media } = req.body;

    // Construir o prompt
    const prompt = `Você é especialista em RH. Com base no perfil abaixo, sugira 3 ações de PDI em português.

Nome: ${nome}
Cargo: ${cargo}
Área: ${area}
Soft Skills: ${softSkills}
Hard Skills: ${hardSkills}
Média de Desempenho: ${media}/4

Responda APENAS com JSON válido, sem markdown:
{"sugestoes":[{"competencia":"...","acao":"...","justificativa":"...","prazo":"2025-12-31"}]}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta inválida da IA');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ sugestoes: parsed.sugestoes || [] });

  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Rota para análise completa do funcionário
app.post('/api/analisar-funcionario', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chave de API não configurada' });
    }

    const { funcionario } = req.body;

    // Construir um prompt detalhado com todas as informações
    const prompt = `Você é um especialista em gestão de desempenho e RH. Faça uma análise completa e estratégica do funcionário abaixo:

**DADOS DO FUNCIONÁRIO:**
Nome: ${funcionario.nome}
Cargo: ${funcionario.cargo}
Área: ${funcionario.area}
Média Geral de Desempenho: ${funcionario.mediaGeral}/4

**SOFT SKILLS (${funcionario.softSkillLabels.join(", ")}):**
${funcionario.softSkillsEval.map((s, i) => `- ${funcionario.softSkillLabels[i]}: ${s.nivel} (${s.valor}/4)`).join('\n')}
Média: ${funcionario.softSkillsMedia}/4

**HARD SKILLS (${funcionario.hardSkillLabels.join(", ")}):**
${funcionario.hardSkillsEval.map((s, i) => `- ${funcionario.hardSkillLabels[i]}: ${s.nivel} (${s.valor}/4)`).join('\n')}
Média: ${funcionario.hardSkillsMedia}/4

**METAS ATIVAS:**
${funcionario.metas && funcionario.metas.length ? funcionario.metas.map(m => `- ${m.titulo}: ${m.progresso}% | Prazo: ${m.prazo}`).join('\n') : 'Nenhuma meta'}

**FEEDBACKS RECENTES:**
${funcionario.feedbacks && funcionario.feedbacks.length ? funcionario.feedbacks.slice(0, 3).map(f => `- [${f.tipo.toUpperCase()}] ${f.texto} (${f.data})`).join('\n') : 'Nenhum feedback'}

**AÇÕES DE PDI (DESENVOLVIMENTO PESSOAL):**
${funcionario.pdi && funcionario.pdi.length ? funcionario.pdi.map(p => `- ${p.acao} (${p.status}) | Prazo: ${p.prazo}`).join('\n') : 'Nenhuma ação PDI'}

**HISTÓRICO DE DESEMPENHO:**
${funcionario.historico && funcionario.historico.length ? funcionario.historico.map(h => `- ${h.periodo}: ${h.mediaGeral}/4`).join('\n') : 'Sem histórico'}

**POSIÇÃO NO NINE BOX:**
Potencial: ${funcionario.potencialLabel}
Desempenho: ${funcionario.desempenhoLabel}

---

Com base nessa análise completa, forneça:

1. **DIAGNÓSTICO ATUAL**: Uma avaliação resumida do desempenho e principais características
2. **FORÇAS**: 3-4 pontos fortes do funcionário
3. **OPORTUNIDADES DE MELHORIA**: 3-4 áreas para desenvolvimento
4. **RECOMENDAÇÕES ESTRATÉGICAS**: Como potencializar esse funcionário
5. **PRÓXIMOS PASSOS**: Ações concretas para os próximos 90 dias

Responda em português, de forma profissional e estruturada.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2000 }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const analise = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    res.json({ analise });

  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
