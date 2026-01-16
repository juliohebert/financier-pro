# 🔧 Como Atualizar o Banco de Dados no Neon

## Situação Atual

Você já tem 3 tabelas criadas no Neon:
- ✅ `clients`
- ✅ `loans`
- ✅ `transactions`

Faltam adicionar:
- ❌ `users` - Usuários do sistema
- ❌ `payments` - Pagamentos dos empréstimos
- ❌ `user_settings` - Configurações do usuário

## 🚀 Passos para Atualizar

### 1. Acesse o Neon SQL Editor

```
https://console.neon.tech/app/projects/[seu-projeto]/branches/[sua-branch]/tables/database-neondb
```

### 2. Execute o Script de Atualização

1. Abra o arquivo `backend/database/update_schema.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Neon
4. Clique em **"Run"**

O script vai:
- ✅ Criar as 3 tabelas faltantes
- ✅ Adicionar colunas que faltam nas tabelas existentes
- ✅ Criar índices para performance
- ✅ Criar triggers para updated_at
- ✅ Inserir usuário admin de teste

### 3. Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- clients
-- loans
-- payments
-- transactions
-- users
-- user_settings
```

### 4. Testar Estrutura

```sql
-- Ver colunas da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Ver relacionamentos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## ⚠️ Importante

- O script usa `IF NOT EXISTS` e `ADD COLUMN IF NOT EXISTS`
- É seguro executar múltiplas vezes
- Não vai sobrescrever dados existentes
- Se já tiver as colunas, apenas pula

## 🔐 Senha do Usuário Admin

O usuário de teste tem senha hasheada de exemplo. Para criar senha real:

```javascript
// No Node.js com bcrypt
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('suaSenhaAqui', 10);
console.log(hash);
```

Depois atualize no banco:

```sql
UPDATE users 
SET password_hash = 'hash_gerado_aqui'
WHERE email = 'admin@financier.pro';
```

## ✅ Depois da Atualização

Seu banco estará pronto para:
1. Autenticação de usuários
2. Multi-tenancy (cada usuário vê só seus dados)
3. Registro de pagamentos
4. Configurações personalizadas
5. Relacionamentos completos

## 🔗 Connection String

Salve sua connection string do Neon:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

Use no `.env` do backend!
