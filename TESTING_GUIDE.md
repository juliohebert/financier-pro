# Guia de Teste - Sistema de Pagamentos

## ✅ Checklist de Validação

### 1. Preparação do Ambiente

**Backend (Render):**
- ✅ Migração do banco executada
- ✅ Tabela `pagamentos` criada
- ✅ Campos `saldo_devedor`, `status`, `valor_pago` adicionados
- ⏳ Aguardar deploy (2-3 minutos após push)

**Frontend (Vercel):**
- ✅ Código atualizado com interfaces corretas
- ✅ Mapeamento de campos corrigido
- ⏳ Aguardar deploy (1-2 minutos após push)

---

## 🧪 Testes a Executar

### Teste 1: Criar Cliente e Empréstimo

1. **Login no sistema**
   - Email: joao@email.com (ou seu usuário de teste)
   - Senha: sua senha

2. **Criar Cliente**
   - Ir em "Clientes"
   - Clicar em "Novo Cliente"
   - Preencher nome (obrigatório)
   - Salvar

3. **Criar Empréstimo**
   - Sistema deve redirecionar automaticamente para "Novo Empréstimo"
   - Banner verde: "Cliente cadastrado com sucesso!"
   - Cliente já deve estar pré-selecionado
   - Preencher:
     - Valor: R$ 1.000,00
     - Taxa: 5% (padrão)
     - Data liberação: 17/01/2026 (hoje)
     - Vencimento: 17/02/2026 (1 mês)
   - Confirmar

**Resultado esperado:**
- ✅ Empréstimo criado com sucesso
- ✅ Saldo devedor: R$ 1.000,00
- ✅ Status: ATIVO
- ✅ Juros do período: R$ 50,00
- ✅ Total a receber: R$ 1.050,00

---

### Teste 2: Visualizar Detalhes

1. **Ir para "Controle de Juros"**
   - Deve aparecer o empréstimo criado

2. **Clicar no ícone de olho (👁️)**
   - Deve abrir a tela de detalhes
   - Verificar informações:
     - ✅ Valor Principal Inicial: R$ 1.000,00
     - ✅ Saldo Devedor Atual: R$ 1.000,00
     - ✅ Taxa de Juros: 5% ao mês
     - ✅ Juros do Período: R$ 50,00
     - ✅ Data de Vencimento: 17/02/2026
     - ✅ Status: ATIVO

**Resultado esperado:**
- ✅ Todas as informações aparecem corretamente
- ✅ Botão "Registrar Pagamento" visível
- ✅ Seção "Opções de Pagamento" mostra:
  - Opção 1: Pagar apenas juros - R$ 50,00
  - Opção 2: Quitar tudo - R$ 1.050,00

---

### Teste 3: Pagamento de Juros (Opção 1)

1. **Clicar em "Registrar Pagamento"**

2. **Modal deve abrir com:**
   - Tipo de Pagamento: "Apenas Juros" selecionado
   - Valor Pago: R$ 50,00 (preenchido automaticamente)

3. **Preencher observação (opcional):**
   - Ex: "Pagamento via PIX - Janeiro/2026"

4. **Confirmar pagamento**

**Resultado esperado:**
- ✅ Mensagem: "Pagamento registrado com sucesso!"
- ✅ Página recarrega automaticamente
- ✅ Histórico de Pagamentos mostra:
  - 📅 Data: 17/01/2026
  - 💰 Valor: R$ 50,00
  - 🏷️ Tipo: "Pagamento de Juros"
  - 📊 Detalhamento: Juros: R$ 50,00 | Principal: R$ 0,00
- ✅ Saldo Devedor permanece: R$ 1.000,00
- ✅ Próximo Vencimento: 17/03/2026 (1 mês à frente)
- ✅ Novos Juros: R$ 50,00 (calculados novamente)
- ✅ Status: ATIVO

---

### Teste 4: Pagamento Parcial + Juros (Opção 2 - Quitação Total)

**Cenário:** Cliente quer quitar tudo

1. **Clicar em "Registrar Pagamento"**

2. **Selecionar "Quitação Total"**
   - Valor deve mudar para: R$ 1.050,00
   - (R$ 50,00 juros + R$ 1.000,00 principal)

3. **Confirmar pagamento**

**Resultado esperado:**
- ✅ Mensagem: "Pagamento registrado com sucesso!"
- ✅ Histórico mostra 2 pagamentos:
  - 1º: R$ 50,00 (juros)
  - 2º: R$ 1.050,00 (amortização)
- ✅ Saldo Devedor: R$ 0,00
- ✅ Status: QUITADO
- ✅ Botão "Registrar Pagamento" desaparece
- ✅ Badge verde: "QUITADO"

---

### Teste 5: Múltiplos Pagamentos de Juros

**Cenário:** Criar novo empréstimo e pagar juros por 3 meses

1. **Criar novo empréstimo:**
   - Valor: R$ 500,00
   - Taxa: 10%
   - Juros: R$ 50,00

2. **Pagar apenas juros - Mês 1**
   - R$ 50,00
   - Observação: "Janeiro"

3. **Verificar:**
   - Saldo devedor: R$ 500,00 (mantém)
   - Vencimento: +1 mês

4. **Pagar apenas juros - Mês 2**
   - R$ 50,00
   - Observação: "Fevereiro"

5. **Verificar:**
   - Saldo devedor: R$ 500,00 (mantém)
   - Vencimento: +1 mês
   - Histórico: 2 pagamentos

6. **Pagar apenas juros - Mês 3**
   - R$ 50,00
   - Observação: "Março"

7. **Finalmente quitar:**
   - Quitação Total: R$ 550,00

**Resultado esperado:**
- ✅ Histórico mostra 4 pagamentos totais
- ✅ 3 pagamentos de juros (R$ 50 cada)
- ✅ 1 amortização final (R$ 550)
- ✅ Total pago: R$ 700,00 (R$ 150 juros + R$ 500 principal + R$ 50 juros do último mês)
- ✅ Status: QUITADO

---

## 🔍 Validações de Regra de Negócio

### ✅ Regras que DEVEM funcionar:

1. **Pagamento de Juros:**
   - Saldo devedor NÃO diminui
   - Vencimento avança +1 mês
   - Novos juros são calculados sobre o saldo devedor
   - Status permanece ATIVO

2. **Quitação Total:**
   - Saldo devedor vai para R$ 0,00
   - Status muda para QUITADO
   - Botão de pagamento desaparece
   - Não permite mais pagamentos

3. **Histórico:**
   - Todos os pagamentos aparecem em ordem cronológica
   - Cada pagamento mostra divisão: juros + principal
   - Observações aparecem quando preenchidas

4. **Cálculos:**
   - Juros = Saldo Devedor × Taxa ÷ 100
   - Total Devido = Saldo Devedor + Juros
   - Após pagar juros: Saldo permanece igual
   - Após amortização: Saldo = Saldo Anterior - Valor Principal Pago

---

## 🐛 Problemas Conhecidos (Já Corrigidos)

- ✅ Interfaces TypeScript atualizadas
- ✅ Mapeamento de campos do backend corrigido
- ✅ Campo `saldoDevedor` adicionado
- ✅ Navegação para detalhes configurada

---

## 📊 Dados de Teste Recomendados

### Empréstimo Pequeno:
- Principal: R$ 100,00
- Taxa: 5%
- Juros: R$ 5,00
- Total: R$ 105,00

### Empréstimo Médio:
- Principal: R$ 1.000,00
- Taxa: 5%
- Juros: R$ 50,00
- Total: R$ 1.050,00

### Empréstimo Alto:
- Principal: R$ 10.000,00
- Taxa: 10%
- Juros: R$ 1.000,00
- Total: R$ 11.000,00

---

## 🚀 Como Testar Agora

1. **Executar script SQL de teste:**
   ```sql
   -- Cole e execute em Neon Console:
   -- Ver arquivo: backend/migrations/create_test_loan.sql
   ```

2. **Aguardar deploys:**
   - Vercel: ~1 minuto
   - Render: ~3 minutos

3. **Fazer login e testar:**
   - F5 no navegador
   - Login
   - Ir para "Controle de Juros"
   - Clicar no ícone de olho
   - Testar pagamentos

4. **Validar cada cenário:**
   - ✅ Detalhes aparecem
   - ✅ Pagamento de juros funciona
   - ✅ Quitação funciona
   - ✅ Histórico está correto
   - ✅ Saldo devedor atualiza corretamente

---

## ❓ Troubleshooting

**Problema: "Empréstimo não encontrado"**
- ✅ Solução: Aguardar deploy do backend (Render)
- ✅ Criar empréstimo pelo sistema (não via SQL)
- ✅ Verificar se o token está válido (fazer logout/login)

**Problema: Campos vazios ou undefined**
- ✅ Solução: Fazer hard refresh (Ctrl+Shift+R)
- ✅ Limpar cache do navegador
- ✅ Verificar console do navegador (F12)

**Problema: Erro ao registrar pagamento**
- ✅ Verificar se backend está online (Render)
- ✅ Verificar console do navegador
- ✅ Testar endpoint manualmente com curl/Postman
