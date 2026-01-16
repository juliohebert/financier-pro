# 🚀 Deploy Rápido - FinanGestão Pro

## ⚡ Passos Rápidos

### 1. Neon (Banco de Dados) - 2 minutos

1. Acesse: https://console.neon.tech
2. Copie a **Connection String**: `postgresql://...`
3. Abra **SQL Editor** e execute o arquivo `/backend/database/schema_pt.sql`

### 2. Render (Backend) - 3 minutos

1. Acesse: https://dashboard.render.com/new/web
2. Conecte: `juliohebert/financier-pro`
3. Configure:
   - **Name**: `financier-backend`
   - **Root Directory**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`

4. **Environment Variables**:
```bash
DATABASE_URL=cole_sua_connection_string_do_neon_aqui
JWT_SECRET=cole_resultado_de_openssl_rand_base64_32
FRONTEND_URL=https://financier-pro.vercel.app
```

5. Clique **Create Web Service**
6. Copie a URL: `https://financier-backend-xxxx.onrender.com`

### 3. Vercel (Frontend) - 1 minuto

1. Acesse: https://vercel.com/juliohebert/financier-pro/settings/environment-variables
2. Adicione variável:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://financier-backend-xxxx.onrender.com` (URL do passo 2)
   - **Environments**: Todos (Production, Preview, Development)

3. Vá em **Deployments** → Redeploy o último

### 4. Criar Usuário Teste

Acesse Neon SQL Editor e execute:

```sql
-- Senha: teste123
INSERT INTO usuarios (email, senha, nome) VALUES 
('teste@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Usuário Teste');
```

### 5. Testar 🎉

1. Abra: https://financier-pro.vercel.app
2. Login:
   - Email: `teste@email.com`
   - Senha: `teste123`

3. Abra DevTools (F12) → Console
4. Deve aparecer: `✅ Dados carregados do backend`

---

## 🔥 Gerar JWT_SECRET

```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

---

## ⚠️ Importante

**Render Free Plan**: Primeiro acesso leva 30-50s (cold start)

**Vercel**: Se der erro 500, verifique se `VITE_API_URL` foi configurada

---

## 📱 URLs

- Frontend: https://financier-pro.vercel.app
- Backend: https://financier-backend-xxxx.onrender.com (substitua com sua URL)
- Neon: https://console.neon.tech

---

Para mais detalhes: [DEPLOY.md](DEPLOY.md)
