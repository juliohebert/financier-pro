# 🇧🇷 Schema do Banco em Português

## 📋 Estrutura das Tabelas

### 1. **usuarios**
Usuários do sistema (gestores de empréstimos)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | Identificador único |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email (único) |
| senha_hash | VARCHAR(255) | Senha criptografada |
| funcao | VARCHAR(50) | 'USUARIO' ou 'ADMIN' |
| status_licenca | VARCHAR(50) | 'TESTE', 'ATIVO', 'EXPIRADO', 'INATIVO' |
| plano_licenca | VARCHAR(100) | Nome do plano |
| data_inicio_teste | TIMESTAMP | Data de início do período de teste |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

### 2. **clientes**
Clientes que recebem empréstimos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | Identificador único |
| usuario_id | INTEGER | Referência ao usuário (dono) |
| nome | VARCHAR(255) | Nome do cliente |
| documento | VARCHAR(50) | CPF ou CNPJ |
| iniciais | VARCHAR(10) | Siglas do nome |
| email | VARCHAR(255) | Email do cliente |
| telefone | VARCHAR(50) | Telefone de contato |
| endereco | TEXT | Endereço completo |
| observacoes | TEXT | Notas adicionais |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

### 3. **emprestimos**
Empréstimos realizados

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | Identificador único |
| usuario_id | INTEGER | Referência ao usuário (dono) |
| cliente_id | INTEGER | Referência ao cliente |
| nome_cliente | VARCHAR(255) | Nome do cliente (cache) |
| valor_principal | DECIMAL(15,2) | Valor emprestado |
| taxa_juros | DECIMAL(5,2) | Taxa de juros mensal (%) |
| total_receber | DECIMAL(15,2) | Valor total com juros |
| valor_pago | DECIMAL(15,2) | Quanto já foi pago |
| data_inicio | DATE | Data do empréstimo |
| data_vencimento | DATE | Data de vencimento |
| status | VARCHAR(50) | 'ATIVO', 'QUITADO', 'ATRASADO' |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

### 4. **pagamentos**
Pagamentos recebidos dos empréstimos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | Identificador único |
| emprestimo_id | INTEGER | Referência ao empréstimo |
| data_pagamento | DATE | Data do pagamento |
| valor | DECIMAL(15,2) | Valor pago |
| tipo_pagamento | VARCHAR(50) | 'JUROS' ou 'AMORTIZACAO' |
| observacoes | TEXT | Notas sobre o pagamento |
| criado_em | TIMESTAMP | Data de registro |

### 5. **transacoes**
Fluxo de caixa completo

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | Identificador único |
| usuario_id | INTEGER | Referência ao usuário |
| data_transacao | DATE | Data da transação |
| descricao | TEXT | Descrição da transação |
| categoria | VARCHAR(100) | Categoria (ex: Empréstimos, Recebimento) |
| tipo_transacao | VARCHAR(50) | 'ENTRADA' ou 'SAIDA' |
| valor | DECIMAL(15,2) | Valor da transação |
| status | VARCHAR(50) | 'LIQUIDADO' ou 'PENDENTE' |
| criado_em | TIMESTAMP | Data de registro |

### 6. **configuracoes_usuario**
Configurações personalizadas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL | Identificador único |
| usuario_id | INTEGER | Referência ao usuário (único) |
| taxa_juros_padrao | DECIMAL(5,2) | Taxa padrão (%) |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

---

## 🔗 Relacionamentos

```
usuarios (1) -----> (N) clientes
usuarios (1) -----> (N) emprestimos
usuarios (1) -----> (N) transacoes
usuarios (1) -----> (1) configuracoes_usuario

clientes (1) -----> (N) emprestimos
emprestimos (1) ---> (N) pagamentos
```

---

## 🚀 Como Aplicar no Neon

### Opção 1: Limpar e Recriar (SEM dados importantes)

```bash
# 1. Abra o SQL Editor no Neon
# 2. Execute: limpar_tabelas.sql
# 3. Execute: schema_pt.sql
```

### Opção 2: Renomear Tabelas Existentes

```sql
-- Se você já tem dados, renomeie as tabelas
ALTER TABLE clients RENAME TO clientes;
ALTER TABLE loans RENAME TO emprestimos;
ALTER TABLE transactions RENAME TO transacoes;

-- Depois ajuste as colunas conforme necessário
```

---

## 📝 Arquivos Disponíveis

- `schema_pt.sql` - Schema completo em português
- `limpar_tabelas.sql` - Remove tabelas antigas em inglês
- `update_schema.sql` - Atualiza tabelas existentes (inglês)

---

## ✅ Após Aplicar

Verifique se funcionou:

```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- clientes
-- configuracoes_usuario
-- emprestimos
-- pagamentos
-- transacoes
-- usuarios
```
