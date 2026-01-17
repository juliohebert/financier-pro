-- Script para criar empréstimo de teste
-- Execute este script no Neon Console para testar o sistema de pagamentos

-- 1. Primeiro, vamos verificar se existe algum cliente
-- Se não houver, vamos criar um cliente de teste

INSERT INTO clientes (usuario_id, nome, documento, criado_em)
SELECT 1, 'Cliente Teste', '12345678900', NOW()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE usuario_id = 1 LIMIT 1);

-- 2. Criar um empréstimo de teste
-- Valores: R$ 1000 emprestado, 5% juros, total R$ 1050

INSERT INTO emprestimos (
  usuario_id,
  cliente_id,
  nome_cliente,
  valor_principal,
  taxa_juros,
  total_receber,
  data_inicio,
  data_vencimento,
  saldo_devedor,
  status,
  valor_pago
) VALUES (
  1,  -- ID do usuário (ajuste conforme necessário)
  (SELECT id FROM clientes WHERE usuario_id = 1 LIMIT 1),  -- Pega o primeiro cliente
  'Cliente Teste',
  1000.00,  -- R$ 1000 emprestado
  5.00,     -- 5% ao mês
  1050.00,  -- R$ 1050 total (principal + juros)
  '2026-01-17',  -- Data de hoje
  '2026-02-17',  -- Vencimento em 1 mês
  1000.00,  -- Saldo devedor inicial = principal
  'ATIVO',
  0.00      -- Nenhum pagamento ainda
) ON CONFLICT DO NOTHING
RETURNING *;

-- 3. Verificar os dados criados
SELECT 
  e.id,
  e.nome_cliente,
  e.valor_principal,
  e.taxa_juros,
  e.saldo_devedor,
  e.status,
  e.data_inicio,
  e.data_vencimento
FROM emprestimos e
WHERE e.usuario_id = 1
ORDER BY e.id DESC
LIMIT 5;
