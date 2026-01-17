-- Tabela para registrar pagamentos de empréstimos
-- Cada pagamento pode ser de JUROS (apenas juros) ou AMORTIZACAO (principal + juros)

CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  emprestimo_id INTEGER NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
  data_pagamento TIMESTAMP NOT NULL DEFAULT NOW(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('JUROS', 'AMORTIZACAO')),
  valor_pago DECIMAL(10, 2) NOT NULL CHECK (valor_pago > 0),
  valor_juros DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valor_principal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX idx_pagamentos_emprestimo ON pagamentos(emprestimo_id);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);

-- Adicionar campos ao empréstimo para controlar status
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS saldo_devedor DECIMAL(10, 2);
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'QUITADO', 'ATRASADO'));
ALTER TABLE emprestimos ADD COLUMN IF NOT EXISTS ultimo_vencimento TIMESTAMP;

-- Atualizar saldo_devedor inicial para empréstimos existentes
UPDATE emprestimos SET saldo_devedor = valor_principal WHERE saldo_devedor IS NULL;
