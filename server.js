const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// Configurações essenciais para a Vercel
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Banco de dados temporário (Nota: Limpa quando o app fica inativo)
let users = [];

// Configuração do Email
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rota para o registro
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = { email, password, verificationCode, verified: false };
    users.push(newUser);

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Código de Verificação",
            text: `Seu código é: ${verificationCode}`
        });
        res.status(201).json({ message: 'Código enviado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar email' });
    }
});

// Rota para verificação do código
app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    const user = users.find(u => u.email === email && u.verificationCode === code);
    if (user) {
        user.verified = true;
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(400).json({ message: 'Código inválido' });
});

// Rota de Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password && u.verified);
    if (user) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Credenciais inválidas' });
});

// Rota da IA Gemini
app.post('/api/gerar-pdi', async (req, res) => {
    const { prompt } = req.body;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ feedback: response.text() });
    } catch (error) {
        res.status(500).json({ error: "Erro na IA" });
    }
});

// Serve o login.html por padrão
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve a página principal se estiver logado
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'gestao_desempenho_v3.html'));
});

// Exportação necessária para o Vercel funcionar
module.exports = app;
