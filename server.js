const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Banco de dados em memória (Atenção: Limpa ao reiniciar no Vercel)
let users = [];

// Configuração do Email (Nodemailer)
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rotas de Autenticação
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
            subject: "Código de Verificação - Gestão de Desempenho",
            text: `Seu código é: ${verificationCode}`
        });
        res.status(201).json({ message: 'Código enviado ao email' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar email' });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    const user = users.find(u => u.email === email && u.verificationCode === code);
    if (user) {
        user.verified = true;
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(400).json({ message: 'Código inválido' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password && u.verified);
    if (user) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Credenciais inválidas ou conta não verificada' });
});

// Rota da IA (Gemini)
app.post('/api/gerar-pdi', async (req, res) => {
    const { prompt } = req.body;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ feedback: response.text() });
    } catch (error) {
        res.status(500).json({ error: "Erro ao processar IA" });
    }
});

// Rota principal para servir o HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Exportação para o Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}
