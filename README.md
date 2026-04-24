# 🚀 Gestão de Desempenho - Guia de Instalação

## ✅ Modo Seguro (Recomendado)

A chave de API do Google Gemini está **protegida no servidor** e **nunca é exposta** no navegador.

---

## � Sistema de Autenticação

O sistema agora inclui **autenticação completa** com:
- ✅ Cadastro de usuários
- ✅ Verificação por email
- ✅ Login seguro com JWT
- ✅ Senhas criptografadas
- ✅ Logout automático

### 📧 Configuração do Email (Obrigatório)

Para que a verificação por email funcione, você precisa configurar um provedor de email:

#### Outlook/Hotmail (Recomendado):
1. **Acesse sua conta Outlook/Hotmail**
2. **Vá em:** Configurações → Conta → Segurança
3. **Ative a autenticação de dois fatores** (se não estiver ativa)
4. **Gere uma senha de app:**
   - Vá em https://account.microsoft.com/security/app-passwords
   - Crie uma nova senha de app
5. **Copie a senha gerada** (16 caracteres)

#### Gmail (Alternativo):
1. Acesse sua conta Gmail
2. Vá em **Configurações** → **Ver todas as configurações** → **Contas e Importação** → **Outros aplicativos Gmail**
3. Clique em **Gerar senha de app**
4. Selecione **Outro** e dê um nome (ex: "Gestão Desempenho")
5. Copie a senha gerada (16 caracteres)

#### Atualize o arquivo `.env`:
```env
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua-senha-de-app
```

**⚠️ Importante:** Use a **senha de app**, não sua senha normal!

---

## 📋 Pré-requisitos

- Node.js instalado (Download: https://nodejs.org/)
- Arquivo HTML (`gestao_desempenho_v3.html`)
- Arquivos de servidor (`server.js`, `.env`, `package.json`)
- **Conta de email configurada** (Gmail recomendado)

---

## 🔧 Instalação

### 1️⃣ Abra PowerShell/Terminal na pasta do projeto

```powershell
cd C:\Users\User\Downloads
```

### 2️⃣ Instale as dependências

```powershell
npm install
```

Isso vai instalar:
- `express` - Servidor web
- `cors` - Permitir requisições do navegador
- `dotenv` - Carregar variáveis de ambiente
- `node-fetch` - Fazer requisições HTTP

### 3️⃣ Verifique o arquivo `.env`

Abra `.env` e confirme que tem:
```env
GEMINI_API_KEY=sua-chave-da-api-do-gemini
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-do-gmail
```

---

## ▶️ Como Usar

### Primeiro Acesso - Cadastro:

1. **Abra o navegador** em: `http://localhost:3001/login.html`
2. **Clique em "Criar conta"**
3. **Preencha o formulário:**
   - Nome completo
   - Email válido
   - Cargo/Função
   - Empresa
   - Senha (mínimo 6 caracteres)
4. **Verifique seu email** - você receberá um código de 6 dígitos
5. **Digite o código** para ativar sua conta
6. **Faça login** com email e senha

### Acesso Normal:

1. **Abra:** `http://localhost:3001/login.html`
2. **Digite email e senha**
3. **Clique em "Entrar"**
4. **Sistema redireciona automaticamente** para o painel principal

### Abra 2 Terminais:

**Terminal 1** - Execute o servidor:
```powershell
npm start
```

Você deve ver:
```
✅ Servidor rodando em http://localhost:3001
🔐 Chave API protegida no servidor
📧 Email service configurado
```

**Terminal 2** - Abra o sistema no navegador:
```powershell
start http://localhost:3001/login.html
```

---

## ✨ Funcionalidades

### 🎯 Sistema Completo de Gestão:
- ✅ **Radar Charts** interativos para skills
- ✅ **Nine Box Matrix** para avaliação de potencial/desempenho
- ✅ **Busca e filtros** por nome e setor
- ✅ **Export para Excel** com dados completos
- ✅ **Sugestões de PDI** com IA (Gemini)
- ✅ **Análise completa** de funcionários com IA

### 🔐 Autenticação Completa:
- ✅ **Cadastro de usuários** com validação
- ✅ **Verificação por email** com códigos
- ✅ **Login seguro** com JWT tokens
- ✅ **Senhas criptografadas** (bcrypt)
- ✅ **Logout automático** e manual
- ✅ **Proteção de rotas** - só usuários logados acessam

### 📊 Relatórios e Métricas:
- ✅ **KPIs em tempo real** (colaboradores, médias, metas)
- ✅ **Histórico de desempenho** por período
- ✅ **Feedbacks organizados** por tipo
- ✅ **Metas com progresso** visual
- ✅ **PDIs com status** de acompanhamento

---

## ⚠️ Limitações Atuais

### 💾 Dados Temporários:
- Dados são salvos apenas na **memória do navegador**
- **Perdem-se** ao fechar o navegador
- **Não há persistência** em banco de dados

### 📧 Email (Configuração Manual):
- Requer configuração de **provedor de email**
- Gmail recomendado com **senha de app**
- Sem configuração = verificação de email não funciona

### 🔄 Melhorias Futuras:
- [ ] **Banco de dados** para persistência
- [ ] **Upload de avatar** para usuários
- [ ] **Recuperação de senha**
- [ ] **Perfis de administrador**
- [ ] **Notificações por email**

---

## 🐛 Solução de Problemas

### ❌ "Servidor não está rodando"
```
Solução: Certifique-se que executou "npm start" no Terminal 1
```

### ❌ "Erro de dependências"
```powershell
# Execute no terminal:
npm install
```

### ❌ "Email não chega"
```
Solução: Configure EMAIL_USER e EMAIL_PASS no .env com senha de app do Gmail
```

### ❌ "Página não carrega"
```
Solução: Certifique-se que o servidor está rodando na porta 3001
```

### ❌ "Login não funciona"
```
Solução: Verifique se configurou o email corretamente no .env
```

### ❌ "Erro 404"
```
Solução: Verifique se a porta 3001 está disponível
         netstat -ano | findstr :3001
```

### ❌ "npm não encontrado"
```
Solução: Instale Node.js em https://nodejs.org/
         Reinicie o PowerShell após instalar
```

### ❌ "Erro de autenticação"
```
Solução: Verifique a chave em .env
         Certifique-se de que tem créditos no Google Cloud
```

---

## 💾 Dados Locais

⚠️ **Importante:** Os dados ainda são salvos apenas na **memória do navegador**. 

Se quiser salvar em banco de dados, avise!

---

## 📞 Suporte

Qualquer dúvida, é só chamar! 🚀
