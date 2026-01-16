# 🚀 Deploy no Render - Passo a Passo

## 📋 Pré-requisitos

- Conta no Render (https://render.com)
- Conta no Neon (https://neon.tech)
- Repositório GitHub: juliohebert/financier-pro

---

## 1️⃣ Preparar Banco de Dados no Neon

### A. Copiar Connection String

1. Acesse: https://console.neon.tech
2. Selecione seu projeto
3. Vá em **Connection Details**
4. Copie a **Connection String** (formato: `postgresql://user:password@host/database`)

### B. Executar Schema SQL

1. No Neon Console, clique em **SQL Editor**
2. Abra o arquivo `/backend/database/schema_pt.sql`
3. Copie todo conteúdo
4. Cole no SQL Editor e execute
5. Verifique se as 6 tabelas foram criadas:
   - ✅ usuarios
   - ✅ clientes
   - ✅ emprestimos
   - ✅ pagamentos
   - ✅ transacoes
   - ✅ configuracoes_usuario

---

## 2️⃣ Deploy do Backend no Render

### A. Criar Web Service

1. Acesse: https://dashboard.render.com
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório GitHub: `juliohebert/financier-pro`
4. Configure:

```
Name: financier-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### B. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```bash
NODE_ENV=production
PORT=3001

# Cole sua connection string do Neon aqui:
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Gere um secret aleatório (pode usar: openssl rand -base64 32)
JWT_SECRET=seu_secret_super_seguro_aqui

# URL do frontend (Vercel)
FRONTEND_URL=https://financier-pro.vercel.app
```

### C. Deploy

1. Clique em **Create Web Service**
2. Aguarde o build (1-3 minutos)
3. ✅ Backend estará disponível em: `https://financier-backend-xxxx.onrender.com`

---

## 3️⃣ Configurar Frontend no Vercel

### A. Adicionar Variável de Ambiente

1. Acesse: https://vercel.com/dashboard
2. Selecione projeto **financier-pro**
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

```bash
Nome: VITE_API_URL
Valor: https://financier-backend-xxxx.onrender.com
Environments: Production, Preview, Development
```

### B. Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**
4. Aguarde rebuild

---

## 4️⃣ Testar Integração

### A. Criar Primeiro Usuário

Você tem 2 opções:

#### Opção 1: Via SQL Editor (Neon)
```sql
INSERT INTO usuarios (email, senha, nome)
VALUES ('admin@teste.com', '$2a$10$...hash...', 'Admin');
-- Senha precisa estar hasheada com bcrypt
```

#### Opção 2: Adicionar rota de registro no backend
Criar endpoint POST `/auth/register` (recomendado)

### B. Testar Login

1. Acesse: https://financier-pro.vercel.app
2. Faça login com suas credenciais
3. Abra DevTools (F12) → Console
4. Verifique mensagem: "✅ Dados carregados do backend"

---

## 5️⃣ Verificar Logs

### Backend (Render)
```
Dashboard → financier-backend → Logs
```

### Frontend (Vercel)
```
Dashboard → financier-pro → Deployments → View Function Logs
```

---

## 🔧 Troubleshooting

### Erro CORS
```javascript
// backend/src/index.js já está configurado com:
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
```

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` tem `?sslmode=require`
- Teste conexão no Neon SQL Editor

### Erro JWT
- Verifique se `JWT_SECRET` está definido no Render
- Recrie o token com: `openssl rand -base64 32`

### Render "Sleeping" (Free Plan)
- Primeiro acesso leva 30-50s (cold start)
- Considere pingar endpoint a cada 10min

---

## 📊 Checklist Final

- [ ] Schema SQL executado no Neon
- [ ] DATABASE_URL copiado do Neon
- [ ] Backend deployado no Render
- [ ] VITE_API_URL configurado no Vercel
- [ ] Frontend redeploy no Vercel
- [ ] Login funcionando
- [ ] Dados carregando do backend

---

## 🎯 URLs de Referência

- **Frontend**: https://financier-pro.vercel.app
- **Backend**: https://financier-backend-xxxx.onrender.com
- **Neon Console**: https://console.neon.tech
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🆘 Suporte

Em caso de dúvidas:
1. Verifique logs no Render/Vercel
2. Abra DevTools (F12) no navegador
3. Confira variáveis de ambiente

**Importante**: Free plan do Render dorme após 15min de inatividade. Primeiro acesso será lento.
