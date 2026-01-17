# Sistema de Pagamentos de Empréstimos

## Regra de Negócio

Ao cadastrar um empréstimo, estamos concedendo um valor ao cliente que não é pago no ato. Esse valor deverá ser quitado na data do próximo vencimento.

### No vencimento, o cliente tem duas opções:

1. **Quitar o valor total** do empréstimo, incluindo o principal e os juros
2. **Pagar apenas os juros**, mantendo o valor principal em aberto como dívida, que continuará gerando novos juros no próximo período

### Exemplo:

- Emprestado: R$ 100,00
- Juros (10%): R$ 10,00
- Dívida total no vencimento (10/02/2026): R$ 110,00

Se o cliente optar por pagar apenas os R$ 10,00 de juros:
- ✅ Pagamento de juros é registrado
- 📌 Valor principal de R$ 100,00 permanece em aberto
- 📅 Novo vencimento é gerado (próximo mês)
- 💰 Novos juros serão calculados sobre os R$ 100,00

## Instalação

### 1. Executar migração no banco de dados

Execute o script SQL no Neon (ou seu PostgreSQL):

```sql
-- Abra o arquivo: backend/migrations/create_payments_table.sql
-- Cole e execute no Neon Console
```

### 2. Atualizar backend no Render

O backend já foi atualizado com os novos endpoints:

- `GET /loans/:id` - Obter detalhes de um empréstimo com histórico
- `POST /loans/:id/payments` - Registrar pagamento (juros ou amortização)
- `GET /loans/:id/payments` - Obter histórico de pagamentos

### 3. Testar o fluxo

1. Faça login no sistema
2. Crie um empréstimo para um cliente
3. Acesse o **Controle Mensal** e clique no empréstimo para ver detalhes
4. Use o botão **"Registrar Pagamento"** para:
   - Opção 1: Pagar apenas juros
   - Opção 2: Quitar tudo (principal + juros)

## Estrutura da Tabela `pagamentos`

```sql
CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  emprestimo_id INTEGER NOT NULL REFERENCES emprestimos(id),
  data_pagamento TIMESTAMP NOT NULL DEFAULT NOW(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('JUROS', 'AMORTIZACAO')),
  valor_pago DECIMAL(10, 2) NOT NULL,
  valor_juros DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valor_principal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);
```

## Novos campos em `emprestimos`

- `valor_pago` - Total já pago
- `saldo_devedor` - Saldo restante do principal
- `status` - ATIVO, QUITADO, ATRASADO
- `ultimo_vencimento` - Última data de vencimento antes da renovação

## API Endpoints

### Registrar Pagamento

```http
POST /loans/:id/payments
Authorization: Bearer {token}

{
  "tipo": "JUROS",  // ou "AMORTIZACAO"
  "valor_pago": 10.00,
  "observacao": "Pagamento via PIX"
}
```

**Resposta:**

```json
{
  "payment": {
    "id": 1,
    "emprestimo_id": 5,
    "tipo": "JUROS",
    "valor_pago": 10.00,
    "valor_juros": 10.00,
    "valor_principal": 0.00
  },
  "novo_saldo": 100.00,
  "novo_status": "ATIVO"
}
```

### Obter Detalhes do Empréstimo

```http
GET /loans/:id
Authorization: Bearer {token}
```

**Resposta:**

```json
{
  "id": 5,
  "nome_cliente": "João Silva",
  "valor_principal": 100.00,
  "saldo_devedor": 100.00,
  "taxa_juros": 10.00,
  "data_vencimento": "2026-02-10",
  "status": "ATIVO",
  "payments": [
    {
      "id": 1,
      "tipo": "JUROS",
      "valor_pago": 10.00,
      "data_pagamento": "2026-01-17"
    }
  ]
}
```

## Lógica de Pagamentos

### Pagamento de JUROS

1. Registra o valor pago como juros
2. Saldo devedor permanece o mesmo
3. Gera novo vencimento (+ 1 mês)
4. Status permanece ATIVO

### Pagamento de AMORTIZACAO

1. Calcula juros do período
2. Subtrai juros do valor pago
3. Restante é abatido do saldo devedor
4. Se saldo devedor = 0, status = QUITADO
5. Caso contrário, status permanece ATIVO

## Arquivos Modificados

### Backend
- ✅ `backend/src/routes/loans.js` - Novos endpoints
- ✅ `backend/migrations/create_payments_table.sql` - Migração

### Frontend
- ✅ `types.ts` - Atualizado PaymentEntry e Loan
- ✅ `views/LoanDetailsView.tsx` - Nova view completa
- ✅ `App.tsx` - Integração da nova view

## Próximos Passos

1. ✅ Executar migração no banco
2. ✅ Deploy do backend (Render)
3. ✅ Deploy do frontend (Vercel)
4. ⏳ Testar fluxo completo
5. ⏳ Adicionar relatórios de pagamentos
